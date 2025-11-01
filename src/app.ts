import express from 'express';
import cors from 'cors';
import helmet from 'helmet';
import morgan from 'morgan';
import router from './routes/taskRouter';
import chatRouter from "./routes/chatRouter"

const app = express();

app.use(helmet());
app.use(morgan('dev'));
app.use(cors({ origin: true })); // configure origin for production
app.use(express.json());

// health check
app.get('/health', (req, res) => res.json({ ok: true }));

// api
app.use('/api/tasks', router);
app.use('/api/chat', chatRouter);
// for default / browser route
app.use('/', router);


// generic error handler (basic)
app.use((err: any, req: any, res: any, next: any) => {
  console.error(err);
  res.status(err.status || 500).json({ error: err.message || 'Internal error' });
});

export default app;
