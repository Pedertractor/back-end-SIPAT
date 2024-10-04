import express from 'express';
import { exportExcelWithDatas, exportPhrases } from '../controllers/datas';
import { verifyAuthToExport } from '../middleware/checkauthtoexport';

export const routerData = express.Router();

routerData.get('/export', verifyAuthToExport, exportExcelWithDatas);
routerData.get('/phrases', verifyAuthToExport, exportPhrases);
