import cors from 'cors';
import express from 'express';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import { env } from './config/env.js';
import { errorMiddleware } from './middlewares/error.middleware.js';
import routes from './routes/index.routes.js';

const app = express();
const publicDir = path.resolve(
  path.dirname(fileURLToPath(import.meta.url)),
  '../public'
);

app.use(cors({ origin: env.corsOrigin }));
app.use(express.json());
app.use(routes);
app.use(express.static(publicDir));
app.get('/', (req, res) => {
  res.sendFile(path.join(publicDir, 'index.html'));
});
app.get('/cadastro', (req, res) => {
  res.sendFile(path.join(publicDir, 'index.html'));
});
app.get('/login', (req, res) => {
  res.sendFile(path.join(publicDir, 'login.html'));
});
app.get('/painel/ocorrencias', (req, res) => {
  res.sendFile(path.join(publicDir, 'ocorrencias.html'));
});
app.use(errorMiddleware);

export default app;