import path from 'path';
import { prisma } from './prisma';
import xlsx from 'xlsx';
import fs from 'fs';

async function getCollaboratorWithMakeRegister() {
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

    const directoryPath = path.resolve(__dirname, 'reports');
    const filePath = path.join(directoryPath, 'dados.xlsx');

    if (!fs.existsSync(directoryPath)) {
      fs.mkdirSync(directoryPath, { recursive: true });
    }

    xlsx.writeFile(wb, filePath);
  } catch (error) {
    console.log(error);
  }
}

getCollaboratorWithMakeRegister();
