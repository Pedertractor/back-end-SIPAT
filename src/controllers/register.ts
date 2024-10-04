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
    const userIp = req.headers['x-forwarded-for'] || req.socket.remoteAddress;
    const { phrase, howToContribute, acceptConditions } = req.body;
    const collaboratorId = req.collaboratorId;
    const imagem = req.file;
    let imagemPath;

    const existingRegister = await prisma.register.findFirst({
      where: {
        collaboratorId: collaboratorId,
      },
    });

    if (existingRegister) {
      return res
        .status(409)
        .json({ message: 'Usuário já possui uma frase registrada!' });
    }

    if (imagem && acceptConditions === false) {
      return res
        .status(409)
        .json({ message: 'Foto não pode ser enviada sem aceitar os termos!' });
    }

    const findCollaborator = await prisma.baseCollaborator.findUnique({
      where: {
        id: collaboratorId,
      },
      select: {
        id: true,
        descCostCenter: true,
        leader: true,
      },
    });

    if (findCollaborator && collaboratorId) {
      if (imagem) {
        const filterSector = findCollaborator.descCostCenter
          .normalize('NFD')
          .replace(/[\u0300-\u036f]/g, '')
          .replace(/[^a-zA-Z0-9\s]/g, '');
        imagemPath = path.join(
          filterSector + '_' + findCollaborator.leader,
          imagem.filename
        );
      }

      await prisma.$transaction([
        prisma.register.create({
          data: {
            phrase,
            howToContribute,
            collaboratorId: +collaboratorId,
            imgPath: imagem && imagemPath,
          },
        }),
        prisma.acceptConditions.create({
          data: {
            acceptanceMethod: 'CHECKBOX',
            addressIp: userIp ? userIp.toString() : null,
            accept: acceptConditions === 'true' ? true : false,
            collaboratorId: +collaboratorId,
          },
        }),
      ]);

      res.status(200).json({
        message: 'Registro criado com sucesso!',
      });
    } else {
      return res.status(404).json({
        message: 'colaborador não encontrado',
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
