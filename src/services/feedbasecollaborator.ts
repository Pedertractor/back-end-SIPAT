import path from 'path';
import xlsx from 'xlsx';
import bcrypt from 'bcryptjs';
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

    const salt = await bcrypt.genSalt(10);

    for (const row of data) {
      const saltCPF = await bcrypt.hash(row.CPF, salt);

      await prisma.baseCollaborator.create({
        data: {
          cardNumber: String(row.N).padStart(4, '0'),
          name: row.NOME,
          cpf: saltCPF,
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

const filePath = path.join('../../../dados/RELACAO_FUNC_09_2024.xlsx');

excelConvert(filePath);
