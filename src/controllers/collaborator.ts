import { RequestHandler } from 'express';
import { prisma } from '../services/prisma';

export const checkCollaborator: RequestHandler = async (req, res) => {
  try {
    const body = req.body;

    if (body) {
      const collaboratorCpf = await prisma.baseCollaborator.findUnique({
        where: {
          cpf: body.cpf,
        },
      });

      if (!collaboratorCpf)
        return res.status(404).json({
          message: 'usuário não encontrado',
        });

      const authCollaborator = await prisma.baseCollaborator.findUnique({
        where: {
          id: collaboratorCpf.id,
          cardNumber: body.cardNumber,
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
          message: 'cartão e CPF não correspondem!',
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

      res.status(200).json({
        validation: true,
        authCollaborator,
      });
    }
  } catch (error) {
    console.log(error);
  }
};
