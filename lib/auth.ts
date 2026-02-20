import type { NextAuthOptions } from "next-auth";
import CredentialsProvider from "next-auth/providers/credentials";
import { getServerSession } from "next-auth";
import { prisma } from "@/lib/prisma";
import bcrypt from "bcryptjs";

export const authOptions: NextAuthOptions = {
    session: {
        strategy: "jwt",
        maxAge: 30 * 24 * 60 * 60, // 30 dias
    },
    secret: process.env.NEXTAUTH_SECRET,
    debug: process.env.NODE_ENV === "development",
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

                const user = await prisma.user.findUnique({
                    where: { email: credentials.email },
                });

                if (!user) return null;

                const isValid = await bcrypt.compare(credentials.password, user.senha);

                if (!isValid) return null;

                return {
                    id: user.id,
                    name: user.nome,
                    email: user.email,
                    role: user.role,
                    tenantId: user.tenantId,
                } as any;
            },
        }),
    ],
    callbacks: {
        // Callback de redirecionamento para evitar o loop de callbackUrl
        async redirect({ url, baseUrl }) {
            // Se o sistema tentar te mandar para o login estando logado, manda para a raiz
            if (url.includes("/login")) return baseUrl;
            // Garante que o redirecionamento seja sempre para o seu próprio domínio
            return url.startsWith(baseUrl) ? url : baseUrl;
        },
        async jwt({ token, user }) {
            if (user) {
                token.id = user.id;
                token.role = user.role;
                token.tenantId = user.tenantId;
            }
            return token;
        },
        async session({ session, token }) {
            if (session.user) {
                session.user.id = token.id as string;
                session.user.role = token.role as string;
                session.user.tenantId = token.tenantId as string;
            }
            return session;
        },
    },
};

export const getServerAuthSession = () => getServerSession(authOptions);