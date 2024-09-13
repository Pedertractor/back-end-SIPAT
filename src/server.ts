import express from 'express';
import cors from 'cors';
import { mainRouter } from './routers/main';
import path from 'path';

const SERVER = process.env.IP_SERVER || '';
const PORT = typeof process.env.PORT == 'string' ? +process.env.PORT : 8080;

const app = express();
app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(express.static(path.join(__dirname, 'public')));

app.use('/api', mainRouter);

app.listen(PORT, SERVER, () => {
  console.log(`Server running on PORT: ${PORT}, Server: ${SERVER}`);
});
