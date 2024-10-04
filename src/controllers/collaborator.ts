import { RequestHandler } from 'express';
import { prisma } from '../services/prisma';
import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';

const SECRET_KEY: string | undefined = process.env.SECRET_KEY;

export const checkCollaborator: RequestHandler = async (req, res) => {
  try {
    const { cardNumber, cpf } = req.body;

    if (cardNumber) {
      const collaboratorCard = await prisma.baseCollaborator.findFirst({
        where: {
          cardNumber,
        },
      });

      if (!collaboratorCard)
        return res.status(403).json({
          message: 'CPF e/ou cartão estão incorretos, verifique!',
        });

      const cpfMatch = await bcrypt.compare(cpf, collaboratorCard.cpf);

      if (!cpfMatch)
        return res
          .status(403)
          .json({ message: 'CPF e/ou cartão estão incorretos, verifique!' });

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
          message: 'Você já tem uma frase cadastrada! Obrigado!',
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
