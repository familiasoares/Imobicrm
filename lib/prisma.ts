import { PrismaClient } from "@prisma/client";

// -----------------------------------------------------------------------
// PrismaClient Singleton
//
// Next.js hot-reload creates new module instances in dev, which would
// cause "too many connections" errors if PrismaClient were instantiated
// at module level normally. The global trick below reuses one instance
// across hot-reloads in development while still being safely shared in
// production (where there is no hot-reload).
//
// Reference: https://www.prisma.io/docs/guides/other/troubleshooting-orm/help-articles/nextjs-prisma-client-dev-practices
// -----------------------------------------------------------------------

const globalForPrisma = globalThis as unknown as {
    prisma: PrismaClient | undefined;
};

export const prisma =
    globalForPrisma.prisma ??
    new PrismaClient({
        log: process.env.NODE_ENV === "development"
            ? ["query", "warn", "error"]
            : ["error"],
    });

if (process.env.NODE_ENV !== "production") {
    globalForPrisma.prisma = prisma;
}
