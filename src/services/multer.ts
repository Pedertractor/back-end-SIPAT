import multer from 'multer';
import fs from 'fs';
import path from 'path';

const storage = multer.diskStorage({
  destination(req, file, callback) {
    const { sector, leader } = req.body;

    const filterSector = sector.replace(/ /g, '_');
    const filterSector2 = filterSector
      .normalize('NFD')
      .replace(/[\u0300-\u036f]/g, '')
      .replace(/[^a-zA-Z0-9\s]/g, '');
    const filterLeader = leader.replace(/ /g, '_');
    const uploadDir = path.join(
      __dirname,
      '..',
      'public',
      filterSector2 + '_' + filterLeader
    );

    if (!fs.existsSync(uploadDir)) {
      fs.mkdirSync(uploadDir, { recursive: true });
    }

    callback(null, uploadDir);
  },
  filename(req, file, callback) {
    const { name, card } = req.body;

    const filterName = name.replace(/ /g, '_');
    const ext = path.extname(file.originalname);
    callback(null, `${filterName}_${card}${ext}`);
  },
});

export const upload = multer({
  fileFilter(req, file, callback) {
    const allowed = ['image/jpg', 'image/jpeg', 'image/png'];
    if (allowed.includes(file.mimetype)) {
      callback(null, true);
    }
  },
  storage,
});
