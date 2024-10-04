import { RequestHandler } from 'express';
import { prisma } from '../services/prisma';
import xlsx from 'xlsx';
export const exportPhrases: RequestHandler = async (req, res) => {
  try {
    const allInfo = await prisma.register.findMany({
      select: {
        collaborator: {
          select: {
            name: true,
            cardNumber: true,
            leader: true,
            costCenter: true,
            descCostCenter: true,
            industry: true,
          },
        },
        id: true,
        phrase: true,
        howToContribute: true,
        createdAt: true,
        _count: {
          select: {
            Vote: {
              where: {
                like: true,
              },
            },
          },
        },
      },
    });

    if (allInfo) {
      const formattedData = allInfo.map((item) => ({
        id: item.id,
        nome: item.collaborator.name,
        cartao: item.collaborator.cardNumber,
        lider: item.collaborator.leader,
        c_c: item.collaborator.costCenter,
        setor: item.collaborator.descCostCenter,
        industria: item.collaborator.industry,
        frase: item.phrase,
        como_contribuir: item.howToContribute,
        data_frase: new Date(item.createdAt).toLocaleDateString(),
        qnt_votos: +item._count.Vote <= 0 ? 0 : item._count.Vote,
      }));

      const ws = xlsx.utils.json_to_sheet(formattedData);

      const wb = xlsx.utils.book_new();
      xlsx.utils.book_append_sheet(wb, ws, 'Sheet1');

      const buffer = xlsx.write(wb, { bookType: 'xlsx', type: 'buffer' });

      // Defina o cabeçalho para o download do arquivo
      res.set({
        'Content-Disposition': 'attachment; filename="dados.xlsx"',
        'Content-Type':
          'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
        'Content-Length': buffer.length,
      });

      // Envie o buffer como resposta
      res.send(buffer);
    }
  } catch (error) {
    console.log(error);
    res.status(500).send('Erro ao gerar o arquivo Excel');
  }
};

export const exportExcelWithDatas: RequestHandler = async (req, res) => {
  try {
    const allColaboratorMakeRegister = await prisma.register.findMany({
      select: {
        collaboratorId: true,
      },
    });

    const registeredIds = allColaboratorMakeRegister.map(
      (item) => item.collaboratorId
    );

    const allCollaborators = await prisma.baseCollaborator.findMany({
      select: {
        id: true,
        name: true,
        cardNumber: true,
        leader: true,
        costCenter: true,
        descCostCenter: true,
        industry: true,
      },
    });

    const nonRegisteredCollaborators = allCollaborators.filter(
      (collaborator) => !registeredIds.includes(collaborator.id)
    );

    const formattedData = nonRegisteredCollaborators.map((item) => ({
      id: item.id,
      nome: item.name,
      cartao: item.cardNumber,
      lider: item.leader,
      c_c: item.costCenter,
      setor: item.descCostCenter,
      industria: item.industry,
    }));

    const ws = xlsx.utils.json_to_sheet(formattedData);
    const wb = xlsx.utils.book_new();
    xlsx.utils.book_append_sheet(wb, ws, 'Sheet1');

    // Gere um buffer para o arquivo Excel
    const buffer = xlsx.write(wb, { bookType: 'xlsx', type: 'buffer' });

    // Defina o cabeçalho para o download do arquivo
    res.set({
      'Content-Disposition': 'attachment; filename="dados.xlsx"',
      'Content-Type':
        'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
      'Content-Length': buffer.length,
    });

    // Envie o buffer como resposta
    res.status(200).send(buffer);
  } catch (error) {
    console.log(error);
    res.status(500).send('Erro ao gerar o arquivo Excel');
  }
};
