import { PrismaClient } from '@prisma/client';

// ── Serverless-safe Prisma singleton with connection pooling ──────────────────
// On Vercel serverless, each function invocation may create a new Prisma client.
// Without pooling limits, MongoDB Atlas will hit "Too many connections" error.
// maxPoolSize=10 ensures we stay within Atlas free-tier connection limits.
const prismaClientSingleton = () => {
  const databaseUrl = process.env.DATABASE_URL;
  
  if (!databaseUrl) {
    throw new Error('FATAL: DATABASE_URL environment variable is not defined');
  }

  // Append connection pooling params if not already present
  // serverSelectionTimeoutMS=5000 → fail fast on cold start instead of hanging 10s
  // connectTimeoutMS=8000 → slightly generous for Atlas free tier wake-up
  const urlWithPooling = databaseUrl.includes('maxPoolSize')
    ? databaseUrl
    : `${databaseUrl}${databaseUrl.includes('?') ? '&' : '?'}maxPoolSize=10&connectTimeoutMS=8000&serverSelectionTimeoutMS=5000`;

  return new PrismaClient({
    log: process.env.NODE_ENV === 'development' ? ['error', 'warn'] : ['error'],
    datasources: {
      db: {
        url: urlWithPooling,
      },
    },
  });
};

declare global {
  var prismaGlobal: undefined | ReturnType<typeof prismaClientSingleton>;
}

const prisma = globalThis.prismaGlobal ?? prismaClientSingleton();

export default prisma;

if (process.env.NODE_ENV !== 'production') globalThis.prismaGlobal = prisma;
