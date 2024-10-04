import fs from 'fs';
import path from 'path';
import { prisma } from './prisma';
import cron from 'node-cron';

const filePath = path.join(__dirname, '../public/BACKUP');

export async function inicializeCron() {
  try {
    const rows = await prisma.register.findMany({
      select: {
        phrase: true,
        howToContribute: true,
        collaborator: {
          select: {
            cardNumber: true,
          },
        },
      },
    });

    const dataMapped = rows.map((item) => {
      return {
        card: item.collaborator.cardNumber,
        phrase: item.phrase,
        howToContribute: item.howToContribute,
      };
    });

    const data = dataMapped
      .map((data) => Object.values(data).join(';'))
      .join('\n');

    const timestamp = new Date()
      .toISOString()
      .replace(/[:.]/g, '-')
      .slice(0, 19);
    const outputPath = path.join(
      __dirname,
      '..',
      'public',
      'BACKUP',
      `output_${timestamp}.txt`
    );

    if (!fs.existsSync(filePath)) {
      fs.mkdirSync(filePath, { recursive: true });
    }

    fs.writeFileSync(outputPath, data);

    console.log('Cron Iniciado');
  } catch (error) {
    console.error('Erro ao exportar dados:', error);
  }
}

cron.schedule('0 0 * * *', () => {
  console.log('Executando cron');
  inicializeCron();
});
