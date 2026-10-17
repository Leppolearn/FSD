import assert from 'node:assert/strict';
import { afterEach, beforeEach, test } from 'node:test';
import { createServer } from 'node:http';
import { createApiApp } from '../scripts/api-app.js';

let server;
let baseUrl;

beforeEach(async () => {
  const service = {
    getAll: async (resource) => [{ id: 1, title: `${resource} item` }],
    getById: async (resource, id) => ({ id: Number(id), title: `${resource} item` }),
    create: async (resource, data) => ({ id: 2, ...data, resource }),
    update: async (resource, id, data) => ({ id: Number(id), ...data, resource }),
    delete: async (resource, id) => ({ id: Number(id), resource }),
  };
  server = createServer(createApiApp(service));
  await new Promise((resolve) => server.listen(0, '127.0.0.1', resolve));
  baseUrl = `http://127.0.0.1:${server.address().port}/api/v1`;
});

afterEach(async () => {
  await new Promise((resolve, reject) => {
    server.close((error) => error ? reject(error) : resolve());
  });
});

test('GET returns a resource collection', async () => {
  const response = await fetch(`${baseUrl}/movies`);
  assert.equal(response.status, 200);
  assert.deepEqual(await response.json(), [{ id: 1, title: 'movies item' }]);
});

test('GET by id returns one resource', async () => {
  const response = await fetch(`${baseUrl}/series/7`);
  assert.equal(response.status, 200);
  assert.deepEqual(await response.json(), { id: 7, title: 'series item' });
});

test('POST creates a resource and returns 201', async () => {
  const response = await fetch(`${baseUrl}/movies`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ title: 'New film' }),
  });
  assert.equal(response.status, 201);
  assert.deepEqual(await response.json(), { id: 2, title: 'New film', resource: 'movies' });
});

test('PATCH updates a resource', async () => {
  const response = await fetch(`${baseUrl}/movies/3`, {
    method: 'PATCH',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ rating: 9 }),
  });
  assert.equal(response.status, 200);
  assert.deepEqual(await response.json(), { id: 3, rating: 9, resource: 'movies' });
});

test('DELETE removes a resource', async () => {
  const response = await fetch(`${baseUrl}/series/4`, { method: 'DELETE' });
  assert.equal(response.status, 200);
  assert.deepEqual(await response.json(), { id: 4, resource: 'series' });
});