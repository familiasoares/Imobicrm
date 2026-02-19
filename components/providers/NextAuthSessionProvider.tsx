"use client";

import { SessionProvider } from "next-auth/react";

/**
 * Thin client-side wrapper around NextAuth's SessionProvider.
 * Must be a Client Component so it can use React context.
 * Placed in app/layout.tsx to make useSession() available everywhere.
 */
export function NextAuthSessionProvider({
    children,
}: {
    children: React.ReactNode;
}) {
    return <SessionProvider>{children}</SessionProvider>;
}
