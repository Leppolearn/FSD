const TABLES = new Set(['movies', 'series']);
const COLUMNS = new Set(['title', 'year', 'genre', 'rating', 'duration', 'poster', 'desc']);

function httpError(statusCode, message) {
  const error = new Error(message);
  error.statusCode = statusCode;
  return error;
}

function getTable(resource) {
  if (!TABLES.has(resource)) throw httpError(404, 'Resource tidak ditemukan');
  return `\`${resource}\``;
}

function getFields(data) {
  if (!data || typeof data !== 'object' || Array.isArray(data)) {
    throw httpError(400, 'Body harus berupa object JSON');
  }
  const fields = Object.entries(data);
  if (fields.length === 0 || fields.some(([field]) => !COLUMNS.has(field))) {
    throw httpError(400, 'Body kosong atau berisi kolom yang tidak diizinkan');
  }
  return fields;
}

export function createDatabaseService(pool) {
  return {
    async getAll(resource) {
      const table = getTable(resource);
      const [rows] = await pool.execute(`SELECT * FROM ${table}`);
      return rows;
    },
    async getById(resource, id) {
      const table = getTable(resource);
      const [rows] = await pool.execute(`SELECT * FROM ${table} WHERE id = ? LIMIT 1`, [id]);
      if (!rows[0]) throw httpError(404, 'Data tidak ditemukan');
      return rows[0];
    },
    async create(resource, data) {
      const table = getTable(resource);
      const fields = getFields(data);
      const columns = fields.map(([field]) => `\`${field}\``).join(', ');
      const placeholders = fields.map(() => '?').join(', ');
      const values = fields.map(([, value]) => value);
      const [result] = await pool.execute(
        `INSERT INTO ${table} (${columns}) VALUES (${placeholders})`,
        values
      );
      return this.getById(resource, result.insertId);
    },
    async update(resource, id, data) {
      const table = getTable(resource);
      const fields = getFields(data);
      await this.getById(resource, id);
      const assignments = fields.map(([field]) => `\`${field}\` = ?`).join(', ');
      const values = fields.map(([, value]) => value);
      await pool.execute(`UPDATE ${table} SET ${assignments} WHERE id = ?`, [...values, id]);
      return this.getById(resource, id);
    },
    async delete(resource, id) {
      const table = getTable(resource);
      const item = await this.getById(resource, id);
      await pool.execute(`DELETE FROM ${table} WHERE id = ?`, [id]);
      return item;
    },
  };
}