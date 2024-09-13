import { RequestHandler } from 'express';
import { prisma } from '../services/prisma';
import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import { TypeRequestUser } from '../types/typesstaff';
import { PrismaClientKnownRequestError } from '@prisma/client/runtime/library';

const SECRET_KEY: string | undefined = process.env.SECRET_KEY;

export const deleteVote: RequestHandler = async (req: TypeRequestUser, res) => {
  try {
    const collaboratorId = req.collaboratorId;
    const { idvote } = req.params;

    if (collaboratorId && idvote) {
      const statusDeleteVote = await prisma.vote.delete({
        where: {
          id: +idvote,
          collaboratorId: +collaboratorId,
        },
      });

      if (!statusDeleteVote)
        return res.status(500).json({
          message: 'erro ao deletar voto',
        });

      res.status(200).json({
        message: 'voto deletado com sucesso!',
      });
    }
  } catch (error) {
    console.log(error);
    res.status(500).json({
      message: 'erro interno no servidor',
    });
  }
};

export const showVotesByUser: RequestHandler = async (
  req: TypeRequestUser,
  res
) => {
  try {
    const collaboratorId = req.collaboratorId;

    if (collaboratorId) {
      const allVotesByUser = await prisma.vote.findMany({
        where: {
          collaboratorId: +collaboratorId,
        },
        include: {
          register: {
            select: {
              id: true,
              phrase: true,
              howToContribute: true,
              collaborator: {
                select: {
                  id: true,
                  name: true,
                  cardNumber: true,
                  leader: true,
                  costCenter: true,
                },
              },
            },
          },
        },
      });

      if (!allVotesByUser || allVotesByUser.length <= 0)
        return res.status(404).json({
          message: 'você não votou em nenhuma frase ainda!',
        });

      res.status(200).json(allVotesByUser);
    }
  } catch (error) {
    console.log(error);
    res.status(500).json({
      message: 'erro interno no servidor',
    });
  }
};

export const mostRegisterVote: RequestHandler = async (req, res) => {
  try {
    const ranking = await prisma.register.findMany({
      select: {
        id: true,
        phrase: true,
        howToContribute: true,
        _count: true,

        collaborator: {
          select: {
            name: true,
            cardNumber: true,
            leader: true,
            costCenter: true,
            industry: true,
          },
        },
      },
      orderBy: {
        Vote: {
          _count: 'desc',
        },
      },
    });

    if (!ranking)
      return res.status(404).json({
        message: 'nenhum registro com votos ainda!',
      });

    res.status(200).json(ranking);
  } catch (error) {
    console.log(error);
    res.status(500).json({
      message: 'erro interno no servidor',
    });
  }
};

export const loginStaff: RequestHandler = async (req, res) => {
  try {
    const { cpf, cardNumber } = req.body;

    if (cpf && cardNumber) {
      const findCollaboratorByCard = await prisma.baseCollaborator.findFirst({
        where: {
          cardNumber,
        },
      });

      if (!findCollaboratorByCard)
        return res.status(404).json({
          message: 'usuário não encontrado!',
        });

      const cpfMatch = await bcrypt.compare(cpf, findCollaboratorByCard.cpf);

      if (!cpfMatch)
        return res.status(403).json({
          message: 'cpf e/ou cartão estão incorretos',
        });

      const authCollaborator = await prisma.baseCollaborator.findUnique({
        where: {
          id: findCollaboratorByCard.id,
          role: 'ADMIN',
        },
      });

      if (!authCollaborator)
        return res.status(403).json({
          message: 'você precisa ser um staff!',
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
    res.status(500).json({
      message: 'erro interno no servidor',
    });
  }
};

export const voteStaff: RequestHandler = async (req: TypeRequestUser, res) => {
  try {
    const { registerId } = req.body;
    const collaboratorId = req.collaboratorId;

    if (collaboratorId && registerId) {
      const statusNewVote = await prisma.vote.create({
        data: {
          registerId: +registerId,
          collaboratorId: +collaboratorId,
        },
      });

      if (!statusNewVote)
        return res.status(422).json({
          message: 'erro ao fazer votação',
        });

      res.status(200).json({
        message: ' voto realizado com sucesso!',
      });
    }
  } catch (error) {
    console.log(error);

    if (error instanceof PrismaClientKnownRequestError) {
      if (error.code === 'P2002') {
        return res
          .status(400)
          .json({ message: 'Você só pode votar uma vez na frase!' });
      }
    }
    res.status(500).json({
      message: 'erro interno no servidor',
    });
  }
};
