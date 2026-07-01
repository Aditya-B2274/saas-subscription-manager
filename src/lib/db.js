import { PrismaClient } from '@prisma/client';
import { PrismaPg } from '@prisma/adapter-pg';
import pg from 'pg';

const globalForPrisma = globalThis;

let db;

const connectionString = process.env.DATABASE_URL;

if (connectionString) {
  if (!globalForPrisma.prisma) {
    const pool = new pg.Pool({ connectionString });
    const adapter = new PrismaPg(pool);
    globalForPrisma.prisma = new PrismaClient({ adapter });
  }
  db = globalForPrisma.prisma;
} else {
  
  db = new PrismaClient();
}

export { db };
