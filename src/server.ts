import express from 'express';
import cors from 'cors';
import { mainRouter } from './routers/main';
import { inicializeCron } from './services/cron-txt';
import https from 'https';
import fs from 'fs';
import path from 'path';

const SERVER = process.env.IP_SERVER || '';
const PORT = typeof process.env.PORT == 'string' ? +process.env.PORT : 8080;

const app = express();

// const corsOptions = {
//   origin: 'http://sipat.grupopedertractor.com.br',
//   methods: 'GET, PUT, DELETE, UPDATE, POST',
// };

app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

app.use('/api', mainRouter);

const sslServer = https.createServer(
  {
    key: fs.readFileSync(path.join(__dirname, 'cert', 'key.pem')),
    cert: fs.readFileSync(path.join(__dirname, 'cert', 'cert.pem')),
  },
  app
);

sslServer.listen(PORT, SERVER, () => {
  console.log(`Server running on PORT: ${PORT}, Server: ${SERVER}`);

  inicializeCron();
});

// app.listen(PORT, SERVER, () => {
//   console.log(`Server running on PORT: ${PORT}, Server: ${SERVER}`);

//   inicializeCron();
// });
