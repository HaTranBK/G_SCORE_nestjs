import 'dotenv/config';
import { PrismaClient } from '@prisma/client';
import { PrismaPg } from '@prisma/adapter-pg';
import { Pool } from 'pg';
import * as fs from 'fs';
import * as path from 'path';

const connectionString = process.env.DATABASE_URL!;
const pool = new Pool({ connectionString });
const adapter = new PrismaPg(pool);
const prisma = new PrismaClient({ adapter });

const parseScore = (val: string): number | null => {
  if (!val) return null;
  const trimmed = val.trim();
  if (trimmed === '') return null;
  const num = parseFloat(trimmed);
  return isNaN(num) ? null : num;
};

async function main() {
  let csvFilePath = path.join(__dirname, '../data/diem_thi_thpt_2024.csv');
  
  // Nếu chạy trên docker container thì root dir sẽ là /app
  const dockerCsvPath = '/app/data/diem_thi_thpt_2024.csv';
  if (fs.existsSync(dockerCsvPath)) {
    csvFilePath = dockerCsvPath;
  }
  
  console.log(`Starting to seed data from: ${csvFilePath}`);

  if (!fs.existsSync(csvFilePath)) {
    throw new Error(`CSV file not found at: ${csvFilePath}`);
  }

  const startTime = Date.now();
  console.log("Reading CSV file into memory...");
  const content = fs.readFileSync(csvFilePath, 'utf-8');

  console.log("Splitting CSV lines...");
  const lines = content.split('\n');
  console.log(`Total lines parsed: ${lines.length}. Starting database seed...`);

  let records: any[] = [];
  const CHUNK_SIZE = 15000;
  let totalSeeded = 0;

  for (let i = 1; i < lines.length; i++) {
    const line = lines[i];
    if (!line) continue;

    const parts = line.split(',');
    if (parts.length < 1) continue;

    const sbd = parts[0]?.trim();
    if (!sbd) continue;

    const scoreRecord = {
      sbd,
      toan: parseScore(parts[1]),
      ngu_van: parseScore(parts[2]),
      ngoai_ngu: parseScore(parts[3]),
      vat_li: parseScore(parts[4]),
      hoa_hoc: parseScore(parts[5]),
      sinh_hoc: parseScore(parts[6]),
      lich_su: parseScore(parts[7]),
      dia_li: parseScore(parts[8]),
      gdcd: parseScore(parts[9]),
      ma_ngoai_ngu: parts[10] ? parts[10].trim() : null,
    };

    records.push(scoreRecord);

    if (records.length >= CHUNK_SIZE) {
      await prisma.studentScore.createMany({
        data: records,
        skipDuplicates: true,
      });
      totalSeeded += records.length;
      console.log(`Seeded ${totalSeeded} / ${lines.length - 1} records...`);
      records = [];
    }
  }

  // insert những thằng còn lại
  if (records.length > 0) {
    await prisma.studentScore.createMany({
      data: records,
      skipDuplicates: true,
    });
    totalSeeded += records.length;
    console.log(`Seeded remaining ${records.length} records. Total: ${totalSeeded}`);
  }

  const endTime = Date.now();
  const duration = ((endTime - startTime) / 1000).toFixed(2);
  console.log(`Seeding completed successfully in ${duration} seconds! Total records: ${totalSeeded}`);
}

main()
  .catch((e) => {
    console.error('Error during seeding:', e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
    await pool.end();
  });
