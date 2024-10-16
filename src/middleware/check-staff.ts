import { RequestHandler } from 'express';
import jwt from 'jsonwebtoken';
import { TypeRequestUser } from '../types/typesstaff';
const SECRET_KEY: string | undefined = process.env.SECRET_KEY;

export const checkStaff: RequestHandler = async (
  req: TypeRequestUser,
  res,
  next
) => {
  try {
    if (!req.headers.authorization)
      return res.status(401).json({ message: 'token não encontrado!' });

    const token = req.headers.authorization.split(' ')[1];

    if (SECRET_KEY) {
      const decoded = jwt.verify(token, SECRET_KEY) as {
        id: number;
        name: string;
        role: string;
      };

      if (!decoded || decoded.role !== 'ADMIN') {
        return res
          .status(403)
          .json({ message: 'Usuário não autorizado a realizar essa ação' });
      }
    }

    next();
  } catch (error) {
    if (error instanceof jwt.TokenExpiredError)
      return res.status(401).json({ message: 'Token expirado' });
    if (error instanceof jwt.JsonWebTokenError)
      return res.status(401).json({ message: 'Token inválido' });
    else return res.status(500).json({ message: 'erro interno no servidor' });
  }
};
