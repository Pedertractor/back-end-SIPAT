import { RequestHandler } from 'express';
import { prisma } from '../services/prisma';
import path from 'path';

export const createNewPhrase: RequestHandler = async (req, res) => {
  try {
    const { phrase, howToContribute, collaboratorId, sector, leader } =
      req.body;
    const imagem = req.file;

    if (!imagem) {
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

    const filterSector = sector
      .normalize('NFD')
      .replace(/[\u0300-\u036f]/g, '')
      .replace(/[^a-zA-Z0-9\s]/g, '');
    const imagemPath = path.join(filterSector + '_' + leader, imagem.filename);

    const statusCreatedNewPhrase = await prisma.register.create({
      data: {
        phrase,
        howToContribute,
        collaboratorId: +collaboratorId,
        imgPath: imagemPath,
      },
    });

    res.status(200).json({
      message: 'Registro com foto criado com sucesso!',
      statusCreatedNewPhrase,
      imagemPath,
    });
  } catch (error) {
    console.log(error);
    res.status(500).json({
      message: 'Erro interno do servidor',
    });
  }
};
