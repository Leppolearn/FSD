import assert from 'node:assert/strict';
import { test } from 'node:test';
import { createDatabaseService } from '../scripts/database-service.js';

test('SELECT collection uses only an allowlisted table', async () => {
  const calls = [];
  const service = createDatabaseService({
    execute: async (...args) => {
      calls.push(args);
      return [[{ id: 1 }]];
    },
  });

  assert.deepEqual(await service.getAll('movies'), [{ id: 1 }]);
  assert.deepEqual(calls, [['SELECT * FROM `movies`']]);
  await assert.rejects(service.getAll('members'), { statusCode: 404 });
});

test('INSERT binds values and reads back the inserted record', async () => {
  const calls = [];
  let insertedTitle;
  const service = createDatabaseService({
    execute: async (sql, params) => {
      calls.push([sql, params]);
      if (sql.startsWith('INSERT')) {
        insertedTitle = params[0];
        return [{ insertId: 8 }];
      }
      return [[{ id: 8, title: insertedTitle }]];
    },
  });
  const title = "Film'); DROP TABLE movies;--";

  assert.deepEqual(await service.create('movies', { title }), { id: 8, title });
  assert.deepEqual(calls, [
    ['INSERT INTO `movies` (`title`) VALUES (?)', [title]],
    ['SELECT * FROM `movies` WHERE id = ? LIMIT 1', [8]],
  ]);
});

test('UPDATE binds changed values and the record id', async () => {
  const calls = [];
  let selectCount = 0;
  const service = createDatabaseService({
    execute: async (sql, params) => {
      calls.push([sql, params]);
      if (sql.startsWith('SELECT')) {
        selectCount++;
        return [[selectCount === 1 ? { id: 3, rating: 7 } : { id: 3, rating: 9 }]];
      }
      return [{ affectedRows: 1 }];
    },
  });

  assert.deepEqual(await service.update('series', 3, { rating: 9 }), { id: 3, rating: 9 });
  assert.deepEqual(calls[1], ['UPDATE `series` SET `rating` = ? WHERE id = ?', [9, 3]]);
});

test('DELETE binds the id and returns the removed record', async () => {
  const calls = [];
  const service = createDatabaseService({
    execute: async (sql, params) => {
      calls.push([sql, params]);
      return sql.startsWith('SELECT') ? [[{ id: 5, title: 'Old film' }]] : [{ affectedRows: 1 }];
    },
  });

  assert.deepEqual(await service.delete('movies', 5), { id: 5, title: 'Old film' });
  assert.deepEqual(calls[1], ['DELETE FROM `movies` WHERE id = ?', [5]]);
});

test('write operations reject unapproved columns', async () => {
  let called = false;
  const service = createDatabaseService({
    execute: async () => {
      called = true;
      return [[]];
    },
  });

  await assert.rejects(service.create('movies', { title: 'Film', owner: 'admin' }), { statusCode: 400 });
  assert.equal(called, false);
});