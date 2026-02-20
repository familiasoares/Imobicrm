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

    // Where NextAuth renders its built-in pages (we override login below)
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

                // 3. Retorna os dados que irão para o JWT
                return {
                    id: user.id,
                    name: user.nome,
                    email: user.email,
                    role: user.role,
                    tenantId: user.tenantId,
                };
            },
        }),
    ],

    callbacks: {
        // Persist custom fields from User → JWT (runs on sign-in and token refresh)
        async jwt({ token, user }) {
            if (user) {
                token.id = user.id;
                token.role = user.role;
                token.tenantId = user.tenantId;
            }
            return token;
        },

        // Expose JWT fields on the client-readable Session object
        async session({ session, token }) {
            if (session.user) {
                session.user.id = token.id;
                session.user.role = token.role;
                session.user.tenantId = token.tenantId;
            }
            return session;
        },
    },
};

// -----------------------------------------------------------------------
// Server-side session helper (use in Server Components / Route Handlers)
// Usage: const session = await getServerAuthSession();
// -----------------------------------------------------------------------
export const getServerAuthSession = () => getServerSession(authOptions);
export const authOptions: NextAuthOptions = {
    // ... tudo que já estava acima continua igual ...

    // ADICIONE ISSO AQUI:
    secret: process.env.NEXTAUTH_SECRET,
    debug: process.env.NODE_ENV === "development", // Ajuda a ver erros no terminal
};