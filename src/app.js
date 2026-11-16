import cors from 'cors';
import express from 'express';
import { env } from './config/env.js';
import { errorMiddleware } from './middlewares/error.middleware.js';
import routes from './routes/index.routes.js';

const app = express();

app.use(cors({ origin: env.corsOrigin }));
app.use(express.json());
app.use(routes);
app.use(errorMiddleware);

export default app;