import { RequestHandler } from 'express';
import { prisma } from '../services/prisma';
import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import { TypeRequestUser } from '../types/typesstaff';
import { PrismaClientKnownRequestError } from '@prisma/client/runtime/library';

const SECRET_KEY: string | undefined = process.env.SECRET_KEY;

export const likeOrDeslike: RequestHandler = async (
  req: TypeRequestUser,
  res
) => {
  try {
    const collaboratorId = req.collaboratorId;
    const { idvote } = req.params;
    const { status } = req.body;
    if (collaboratorId && idvote) {
      const statusUpdateVote = await prisma.vote.update({
        where: {
          id: +idvote,
          collaboratorId: +collaboratorId,
        },
        data: {
          like: status.like,
          deslike: status.deslike,
        },
      });

      if (!statusUpdateVote)
        return res.status(422).json({
          message: 'erro ao atualizar voto',
        });

      res.status(200).json({
        message: 'voto atualizado com sucesso!',
      });
    }
  } catch (error) {
    console.log(error);
    res.status(500).json({
      message: 'erro interno no servidor',
    });
  }
};

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

export const forVoting: RequestHandler = async (req: TypeRequestUser, res) => {
  try {
    const collaboratorId = req.collaboratorId;

    if (collaboratorId) {
      const allPhrasesNeedVote = await prisma.register.findMany({
        where: {
          NOT: {
            Vote: {
              some: {
                collaboratorId: +collaboratorId,
              },
            },
          },
        },
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
      });

      res.status(200).json(allPhrasesNeedVote);
    }
  } catch (error) {
    console.log(error);
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
    const { registerId, status } = req.body;
    const collaboratorId = req.collaboratorId;

    console.log(registerId, collaboratorId);

    if (collaboratorId && registerId) {
      const statusNewVote = await prisma.vote.create({
        data: {
          registerId: +registerId,
          collaboratorId: +collaboratorId,
          like: status.like,
          deslike: status.deslike,
        },
      });

      if (!statusNewVote)
        return res.status(422).json({
          message: 'erro ao fazer votação',
        });

      res.status(200).json({
        message: 'voto realizado com sucesso!',
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

export const revalidLoginStaff: RequestHandler = async (req, res, next) => {
  try {
    if (!req.headers.authorization)
      return res.status(401).json({ message: 'token não encontrado!' });

    const token = req.headers.authorization.split(' ')[1];

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
          return res.status(403).json({
            login: false,
          });

        if (user) {
          return res.status(200).json({
            login: true,
          });
        }
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
