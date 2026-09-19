import express, { Request, Response, NextFunction } from 'express';
import dns from 'node:dns';

dns.setDefaultResultOrder('ipv4first');

import 'dotenv/config';
import cors from 'cors';
import { toNodeHandler } from 'better-auth/node';
import { auth } from './lib/auth.js';
import userRouter from './routes/userRoutes.js';
import projectRouter from './routes/projectRoutes.js';
import { stripeWebhook } from './controllers/stripeWebhook.js';

const app = express();

const port = 3000;

const corsOptions = {
    origin: process.env.TRUSTED_ORIGINS?.split(',').map(o => o.trim()) || [],
    credentials: true,
}

app.use(cors(corsOptions))
app.post('/api/stripe', express.raw({type: 'application/json'}), stripeWebhook)

app.all('/api/auth/{*any}', toNodeHandler(auth));

app.use(express.json({limit: '50mb'}))

app.get('/', (req: Request, res: Response) => {
    res.send('Server is Live!');
});
app.use('/api/user', userRouter);
app.use('/api/project', projectRouter);

// Global error handler to prevent unhandled errors from crashing the server
app.use((err: any, req: Request, res: Response, _next: NextFunction) => {
    console.error('Unhandled error:', err);
    if (!res.headersSent) {
        res.status(500).json({ message: err.message || 'Internal Server Error' });
    }
});

app.listen(port, () => {
    console.log(`Server is running at http://localhost:${port}`);
});