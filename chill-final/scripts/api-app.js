import express from 'express';
import cors from 'cors';

export function createApiApp(service) {
  const app = express();
  app.use(cors());
  app.use(express.json({ limit: '1mb' }));
  app.get('/api/v1/:resource', async (req, res) => {
    res.json(await service.getAll(req.params.resource));
  });
  app.get('/api/v1/:resource/:id', async (req, res) => {
    res.json(await service.getById(req.params.resource, req.params.id));
  });
  app.post('/api/v1/:resource', async (req, res) => {
    res.status(201).json(await service.create(req.params.resource, req.body));
  });
  app.patch('/api/v1/:resource/:id', async (req, res) => {
    res.json(await service.update(req.params.resource, req.params.id, req.body));
  });
  app.delete('/api/v1/:resource/:id', async (req, res) => {
    res.json(await service.delete(req.params.resource, req.params.id));
  });
  app.use((req, res) => res.status(404).json({ error: 'Endpoint tidak ditemukan' }));
  app.use((error, req, res, next) => {
    const statusCode = error.statusCode || error.status || 500;
    if (statusCode >= 500) console.error(error);
    res.status(statusCode).json({
      error: statusCode >= 500 ? 'Terjadi kesalahan pada server' : error.message,
    });
  });
  return app;
}