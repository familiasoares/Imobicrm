import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";
import { getToken } from "next-auth/jwt";

// -----------------------------------------------------------------------
// Constants — keep in sync with lib/subscription.ts
// -----------------------------------------------------------------------
const SUBSCRIPTION_COOKIE = "mock_subscription_status";

const BLOCKED_ROUTES = ["/kanban", "/leads", "/arquivados", "/equipe"];

// Paths that are ALWAYS public — no auth or subscription check
const PUBLIC_PATHS = ["/login", "/api/auth"];

function isPublicPath(pathname: string) {
    return PUBLIC_PATHS.some((p) => pathname.startsWith(p));
}

function isBlockedRoute(pathname: string) {
    return BLOCKED_ROUTES.some((r) => pathname.startsWith(r));
}

// -----------------------------------------------------------------------
// Middleware — two-phase guard
// -----------------------------------------------------------------------
export async function middleware(request: NextRequest) {
    const { pathname } = request.nextUrl;

    // Skip auth+subscription checks for public paths and Next.js internals
    if (isPublicPath(pathname)) {
        return NextResponse.next();
    }

    // ────────────────────────────────────────────
    // PHASE 1 — Authentication check
    // getToken() decodes the NextAuth JWT from the httpOnly cookie.
    // No network call — pure crypto, fully Edge-compatible.
    // ────────────────────────────────────────────
    const token = await getToken({
        req: request,
        secret: process.env.NEXTAUTH_SECRET,
    });

    if (!token) {
        // Not authenticated → redirect to login, preserving the intended URL
        const loginUrl = request.nextUrl.clone();
        loginUrl.pathname = "/login";
        loginUrl.searchParams.set("callbackUrl", pathname);
        return NextResponse.redirect(loginUrl);
    }

    // ────────────────────────────────────────────
    // PHASE 2 — Subscription check (only for authenticated users)
    // ────────────────────────────────────────────
    const subscriptionStatus =
        request.cookies.get(SUBSCRIPTION_COOKIE)?.value ?? "ATIVA";

    if (subscriptionStatus === "BLOQUEADA" && isBlockedRoute(pathname)) {
        const url = request.nextUrl.clone();
        url.pathname = "/assinatura";
        url.searchParams.set("bloqueado", "1");
        return NextResponse.redirect(url);
    }

    // ATRASADA → allow through but inject banner cookie
    const response = NextResponse.next();

    if (subscriptionStatus === "ATRASADA") {
        response.cookies.set("crm_show_overdue_banner", "1", {
            path: "/",
            maxAge: 60 * 60,
            sameSite: "strict",
            httpOnly: false,
        });
    } else {
        // Clear banner cookie if no longer overdue
        response.cookies.set("crm_show_overdue_banner", "", {
            path: "/",
            maxAge: 0,
        });
    }

    return response;
}

// -----------------------------------------------------------------------
// Matcher — explicit routes only (avoids running on static assets)
// -----------------------------------------------------------------------
export const config = {
    matcher: [
        "/",
        "/kanban/:path*",
        "/leads/:path*",
        "/arquivados/:path*",
        "/equipe/:path*",
        "/dashboard/:path*",
        "/assinatura/:path*",
        "/treinamentos/:path*",
        "/login",
    ],
};
