import path from 'path';
import { prisma } from './prisma';
import xlsx from 'xlsx';
import fs from 'fs';

async function getCollaboratorWithMakeRegister() {
  try {
    const allColaboratorMakeRegister = await prisma.register.findMany({
      select: {
        id: true,
        phrase: true,
        howToContribute: true,
        createdAt: true,
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
      },
    });

    console.log(allColaboratorMakeRegister);

    const formattedData = allColaboratorMakeRegister.map((item) => ({
      id: item.id,
      frase: item.phrase,
      como_contribuir: item.howToContribute,
      enviado: new Date(item.createdAt).toLocaleDateString(),
      nome: item.collaborator.name,
      cartao: item.collaborator.cardNumber,
      lider: item.collaborator.leader,
      c_c: item.collaborator.costCenter,
      setor: item.collaborator.descCostCenter,
      industria: item.collaborator.industry,
    }));

    const ws = xlsx.utils.json_to_sheet(formattedData);

    const wb = xlsx.utils.book_new();
    xlsx.utils.book_append_sheet(wb, ws, 'Sheet1');

    const directoryPath = path.resolve(__dirname, 'reports');
    const filePath = path.join(directoryPath, 'dados.xlsx');

    if (!fs.existsSync(directoryPath)) {
      fs.mkdirSync(directoryPath, { recursive: true });
    }

    xlsx.writeFile(wb, filePath);

    console.log(`Arquivo salvo em: ${filePath}`);
  } catch (error) {
    console.log(error);
  }
}

getCollaboratorWithMakeRegister();
