import NextAuth from "next-auth";
import { authOptions } from "@/lib/auth";

// Next.js App Router Route Handler for NextAuth
// Handles ALL /api/auth/* routes: sign-in, sign-out, session, CSRF, etc.
const handler = NextAuth(authOptions);

export { handler as GET, handler as POST };
