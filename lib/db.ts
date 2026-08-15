import { PrismaClient } from '@prisma/client';

const createPrismaClient = () => {
  const client = new PrismaClient({
    log: ['error'],
  });

  return client.$extends({
    query: {
      $allModels: {
        async $allOperations({ model, operation, args, query }) {
          let attempts = 3;
          while (attempts > 0) {
            try {
              return await query(args);
            } catch (error: any) {
              attempts--;
              const isPoolTimeout =
                error?.code === 'P2024' ||
                error?.message?.includes('connection pool') ||
                error?.message?.includes('ConnectionReset') ||
                error?.message?.includes('forcibly closed');

              if (isPoolTimeout && attempts > 0) {
                console.warn(
                  `[Prisma Auto-Reconnect] Re-trying ${model}.${operation} due to Neon DB idle wake-up...`
                );
                await new Promise((resolve) => setTimeout(resolve, 500));
              } else {
                throw error;
              }
            }
          }
          throw new Error('Database query failed');
        },
      },
    },
  });
};

type ExtendedPrismaClient = ReturnType<typeof createPrismaClient>;

const globalForPrisma = globalThis as unknown as {
  prisma: ExtendedPrismaClient | undefined;
};

export const db = globalForPrisma.prisma ?? createPrismaClient();

if (process.env.NODE_ENV !== 'production') {
  globalForPrisma.prisma = db;
}

export async function withDbRetry<T>(fn: () => Promise<T>, retries = 2): Promise<T> {
  return fn();
}
