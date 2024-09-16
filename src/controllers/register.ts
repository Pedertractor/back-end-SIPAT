import { RequestHandler } from 'express';
import { prisma } from '../services/prisma';
import path from 'path';
import { PrismaClientKnownRequestError } from '@prisma/client/runtime/library';
import { TypeRequestUser } from '../types/typesstaff';

export const createNewPhrase: RequestHandler = async (
  req: TypeRequestUser,
  res
) => {
  try {
    const { phrase, howToContribute } = req.body;
    const collaboratorId = req.collaboratorId;
    const imagem = req.file;

    if (!imagem && collaboratorId) {
      const statusRegister = await prisma.register.create({
        data: {
          phrase,
          howToContribute,
          collaboratorId: +collaboratorId,
        },
      });

      if (!statusRegister)
        return res.status(422).json({
          message: 'Erro ao criar registro',
        });

      return res.status(200).json({
        message: 'Registro sem foto criado com sucesso!',
      });
    }

    if (imagem && collaboratorId) {
      const findCollaborator = await prisma.baseCollaborator.findUnique({
        where: {
          id: +collaboratorId,
        },
      });

      if (!findCollaborator)
        return res.status(404).json({
          message: 'colaborador não encontrado',
        });

      const filterSector = findCollaborator.descCostCenter
        .normalize('NFD')
        .replace(/[\u0300-\u036f]/g, '')
        .replace(/[^a-zA-Z0-9\s]/g, '');
      const imagemPath = path.join(
        filterSector + '_' + findCollaborator.leader,
        imagem.filename
      );

      const statusCreatedNewPhrase = await prisma.register.create({
        data: {
          phrase,
          howToContribute,
          collaboratorId: +collaboratorId,
          imgPath: imagemPath,
        },
        select: {
          howToContribute: true,
          phrase: true,
        },
      });

      res.status(200).json({
        message: 'Registro com foto criado com sucesso!',
        statusCreatedNewPhrase,
        imagemPath,
      });
    }
  } catch (error) {
    if (error instanceof PrismaClientKnownRequestError) {
      if (error.code === 'P2002') {
        return res
          .status(400)
          .json({ message: 'Você só pode criar uma frase!' });
      }
    }
    res.status(500).json({
      message: 'erro interno no servidor',
    });
  }
};
