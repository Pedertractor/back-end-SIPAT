import path from 'path';
import xlsx from 'xlsx';
import { prisma } from './prisma';

async function excelConvert(filePath: string) {
  try {
    const workbook = xlsx.readFile(filePath);
    const sheetName = workbook.SheetNames[0];
    const sheet = workbook.Sheets[sheetName];
    const data: {
      N: string;
      NOME: string;
      CPF: string;
      Lider: string;
      C_Custo: string;
      C_Custo_Desc: string;
      Empresa: string;
    }[] = xlsx.utils.sheet_to_json(sheet);
    console.log(data);

    for (const row of data) {
      await prisma.baseCollaborator.create({
        data: {
          cardNumber: String(row.N).padStart(4, '0'),
          name: row.NOME,
          cpf: row.CPF,
          costCenter: String(row.C_Custo),
          descCostCenter: row.C_Custo_Desc,
          industry: row.Empresa,
          leader: row.Lider,
        },
      });
    }

    console.log('Dados inseridos com sucesso!');
  } catch (error) {
    console.error('Erro ao processar o arquivo Excel:', error);
  }
}

const filePath = path.join('../../../dados/RELACAO_FUNC_08_2024.xlsx');

excelConvert(filePath);
