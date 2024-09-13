import { RequestHandler } from 'express';
import { prisma } from '../services/prisma';
import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';

const SECRET_KEY: string | undefined = process.env.SECRET_KEY;

export const checkCollaborator: RequestHandler = async (req, res) => {
  try {
    const body = req.body;

    if (body) {
      const collaboratorCard = await prisma.baseCollaborator.findFirst({
        where: {
          cardNumber: body.cardNumber,
        },
      });

      if (!collaboratorCard)
        return res.status(404).json({
          message: 'usuário não encontrado',
        });

      const cpfMatch = await bcrypt.compare(body.cpf, collaboratorCard.cpf);

      if (!cpfMatch)
        return res
          .status(403)
          .json({ message: 'cpf e/ou cartão estão incorretos' });

      const authCollaborator = await prisma.baseCollaborator.findUnique({
        where: {
          id: collaboratorCard.id,
        },
        select: {
          id: true,
          name: true,
          leader: true,
          cardNumber: true,
          costCenter: true,
          descCostCenter: true,
        },
      });

      if (!authCollaborator)
        return res.status(403).json({
          message: 'colaborador não encontrado',
        });

      const existRegister = await prisma.register.findUnique({
        where: {
          collaboratorId: authCollaborator.id,
        },
      });

      if (existRegister)
        return res.status(400).json({
          message: 'você já tem uma frase cadastrada! Obrigado!',
        });

      if (SECRET_KEY) {
        const token = jwt.sign(
          {
            id: authCollaborator.id,
            name: authCollaborator.name,
          },
          SECRET_KEY,
          { expiresIn: '2h' }
        );

        if (token) res.status(200).json({ token });
      }
    }
  } catch (error) {
    console.log(error);
  }
};
