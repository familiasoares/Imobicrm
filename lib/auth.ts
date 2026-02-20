import type { NextAuthOptions } from "next-auth";
import CredentialsProvider from "next-auth/providers/credentials";
import { getServerSession } from "next-auth";
import { prisma } from "@/lib/prisma";
import bcrypt from "bcryptjs";

// -----------------------------------------------------------------------
// NextAuth configuration
// -----------------------------------------------------------------------
export const authOptions: NextAuthOptions = {
    // Use JWT strategy (no database adapter needed for the session itself)
    session: {
        strategy: "jwt",
        maxAge: 30 * 24 * 60 * 60, // 30 days
    },

    // Secret for JWT encryption (Essential for Vercel/Production)
    secret: process.env.NEXTAUTH_SECRET,

    // Debug mode helps to see errors in terminal during development
    debug: process.env.NODE_ENV === "development",

    // Where NextAuth renders its built-in pages
    pages: {
        signIn: "/login",
        error: "/login",
    },

    providers: [
        CredentialsProvider({
            name: "Credentials",
            credentials: {
                email: { label: "Email", type: "email" },
                password: { label: "Senha", type: "password" },
            },

            async authorize(credentials) {
                if (!credentials?.email || !credentials?.password) return null;

                // 1. Busca o usuário no banco pelo e-mail
                const user = await prisma.user.findUnique({
                    where: { email: credentials.email },
                });

                if (!user) return null;

                // 2. Compara a senha enviada com o hash do banco
                const isValid = await bcrypt.compare(credentials.password, user.senha);

                if (!isValid) return null;

                // 3. Retorna os dados (Usamos 'as any' para o TypeScript parar de reclamar do tenantId null)
                return {
                    id: user.id,
                    name: user.nome,
                    email: user.email,
                    role: user.role,
                    tenantId: user.tenantId,
                } as any;
            },