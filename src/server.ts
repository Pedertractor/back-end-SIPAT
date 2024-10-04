import express from 'express';
import cors from 'cors';
import { mainRouter } from './routers/main';
import { inicializeCron } from './services/cron-txt';

const SERVER = process.env.IP_SERVER || '';
const PORT = typeof process.env.PORT == 'string' ? +process.env.PORT : 8080;

const app = express();

const corsOptions = {
  // origin: 'http://sipat.grupopedertractor.com.br:3000',
  origin: 'http://172.31.98.159:3000',
  methods: 'GET, PUT, DELETE, UPDATE, POST',
};

app.use(cors(corsOptions));
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

app.use('/api', mainRouter);

app.listen(PORT, SERVER, () => {
  console.log(`Server running on PORT: ${PORT}, Server: ${SERVER}`);

  inicializeCron();
});
