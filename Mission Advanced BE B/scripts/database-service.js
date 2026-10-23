const TABLES = new Set(['movies', 'series', 'movie']);
const COLUMNS = new Set(['title', 'year', 'genre', 'rating', 'duration', 'poster', 'desc']);
const SORTABLE_COLUMNS = new Set(['id', 'title', 'year', 'genre', 'rating', 'duration']);

function httpError(statusCode, message) {
  const error = new Error(message);
  error.statusCode = statusCode;
  return error;
}

function getTable(resource) {
  const normalized = resource === 'movie' ? 'movies' : resource;
  if (!TABLES.has(resource)) throw httpError(404, 'Resource tidak ditemukan');
  return `\`${normalized}\``;
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
    /**
     * Langkah Kelima: Implementasi Query Params (filter, sort, search)
     * 1. Filter: req.query filtering dengan WHERE
     * 2. Sorting: query sorting dengan ORDER BY
     * 3. Search: query search dengan WHERE dan LIKE
     */
    async getAll(resource, query = {}) {
      const table = getTable(resource);
      const conditions = [];
      const values = [];

      // 3. Search: Mencari berdasarkan karakter tertentu menggunakan WHERE dan LIKE
      const searchTerm = query.search || query.q;
      if (searchTerm) {
        conditions.push('`title` LIKE ?');
        values.push(`%${searchTerm}%`);
      }

      // 1. Filter: Menyaring konten sesuai kategori dengan WHERE
      for (const [key, val] of Object.entries(query)) {
        if (['search', 'q', 'sort', 'sortBy', 'order'].includes(key)) {
          continue;
        }
        if (COLUMNS.has(key) && val !== undefined && val !== '') {
          conditions.push(`\`${key}\` = ?`);
          values.push(val);
        }
      }

      let sql = `SELECT * FROM ${table}`;
      if (conditions.length > 0) {
        sql += ` WHERE ${conditions.join(' AND ')}`;
      }

      // 2. Sorting: Mengurutkan data menggunakan ORDER BY
      const sortField = query.sortBy || query.sort;
      if (sortField) {
        let fieldName = sortField;
        let direction = (query.order || 'ASC').toUpperCase();
        if (fieldName.startsWith('-')) {
          fieldName = fieldName.slice(1);
          direction = 'DESC';
        }
        if (SORTABLE_COLUMNS.has(fieldName)) {
          const safeDirection = direction === 'DESC' ? 'DESC' : 'ASC';
          sql += ` ORDER BY \`${fieldName}\` ${safeDirection}`;
        }
      }

      // Pertahankan kompatibilitas jika tidak ada parameter nilai
      const [rows] = values.length > 0
        ? await pool.execute(sql, values)
        : await pool.execute(sql);

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