import type { NextAuthOptions } from "next-auth";
import CredentialsProvider from "next-auth/providers/credentials";
import { getServerSession } from "next-auth";

// -----------------------------------------------------------------------
// Mock users — replace with `prisma.user.findUnique()` in production
// -----------------------------------------------------------------------
const MOCK_USERS = [
    {
        id: "user_001",
        name: "Carlos Admin",
        email: "admin@imobicrm.com",
        password: "123456",
        role: "GERENTE",
        tenantId: "tenant_001",
    },
    {
        id: "user_002",
        name: "Ana Corretora",
        email: "ana@imobicrm.com",
        password: "123456",
        role: "CORRETOR",
        tenantId: "tenant_001",
    },
];

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

                // --- PRODUCTION TODO ---
                // const user = await prisma.user.findUnique({
                //   where: { email: credentials.email },
                // });
                // if (!user) return null;
                // const valid = await bcrypt.compare(credentials.password, user.passwordHash);
                // if (!valid) return null;
                // return { id: user.id, name: user.name, email: user.email, role: user.role, tenantId: user.tenantId };

                const user = MOCK_USERS.find(
                    (u) =>
                        u.email === credentials.email &&
                        u.password === credentials.password
                );

                if (!user) return null;

                return {
                    id: user.id,
                    name: user.name,
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
