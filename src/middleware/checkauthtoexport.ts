import { RequestHandler } from 'express';
import jwt from 'jsonwebtoken';
import { prisma } from '../services/prisma';

const SECRET_KEY: string | undefined = process.env.SECRET_KEY;

export const verifyAuthToExport: RequestHandler = async (req, res, next) => {
  try {
    if (!req.headers.authorization)
      return res.status(401).json({ message: 'token não encontrado!' });

    const token = req.headers.authorization.split(' ')[1];

    if (!SECRET_KEY)
      return res.status(401).json({ message: 'key não encontrada' });

    if (SECRET_KEY) {
      const decoded = jwt.verify(token, SECRET_KEY) as {
        id: number;
        name: string;
      };

      if (decoded) {
        const user = await prisma.baseCollaborator.findUnique({
          where: {
            id: decoded.id,
            name: decoded.name,
          },
        });

        if (!user)
          return res.status(404).json({ message: 'usuário não encontrado' });

        const checkRole = await prisma.baseCollaborator.findUnique({
          where: {
            id: user.id,
            role: 'ADMIN',
          },
        });

        if (!checkRole)
          return res
            .status(403)
            .json({ message: 'você precisa ser um staff!' });

        if (checkRole) next();
      }
    }
  } catch (error) {
    console.log(error);
    if (error instanceof jwt.TokenExpiredError)
      return res.status(401).json({ message: 'Token expirado' });
    if (error instanceof jwt.JsonWebTokenError)
      return res.status(401).json({ message: 'Token inválido' });
    else return res.status(500).json({ message: 'erro interno no servidor' });
  }
};
