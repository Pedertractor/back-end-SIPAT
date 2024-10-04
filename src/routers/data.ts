import express from 'express';
import { exportExcelWithDatas, exportPhrases } from '../controllers/datas';

export const routerData = express.Router();

routerData.get('/export', exportExcelWithDatas);
routerData.get('/phrases', exportPhrases);
