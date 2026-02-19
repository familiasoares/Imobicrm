import type { DefaultSession } from "next-auth";

// -----------------------------------------------------------------------
// Extend NextAuth built-in types so TypeScript knows about our custom
// multi-tenant fields on both Session and JWT.
// -----------------------------------------------------------------------
declare module "next-auth" {
    interface Session {
        user: {
            id: string;
            role: string;        // "ADMIN_SAAS" | "GERENTE" | "CORRETOR"
            tenantId: string;    // FK to the Tenant row in Prisma
        } & DefaultSession["user"]; // keeps name, email, image
    }

    // The raw User object returned by CredentialsProvider.authorize()
    interface User {
        id: string;
        role: string;
        tenantId: string;
    }
}

declare module "next-auth/jwt" {
    interface JWT {
        id: string;
        role: string;
        tenantId: string;
    }
}
