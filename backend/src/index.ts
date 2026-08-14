import 'dotenv/config';
import express from 'express';
import helmet from 'helmet';
import cors from 'cors';
import { config } from './config/index.js';
import { corsOptions, globalLimiter, authLimiter } from './middleware/security.js';

const app = express();

app.use(helmet());
app.use(cors(corsOptions));
app.use(express.json({ limit: '100kb' }));
app.use(globalLimiter);
app.use('/auth', authLimiter);

app.get('/', (req, res) => {
  res.send('Hello World');
});

app.listen(config.port, () => {
  console.log(`Server is running on http://localhost:${config.port}`);
});
