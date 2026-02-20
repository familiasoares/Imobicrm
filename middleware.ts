import { withAuth } from "next-auth/middleware";

export default withAuth({
    pages: {
        signIn: "/login",
    },
});

export const config = {
    matcher: [
        "/",
        "/kanban/:path*",
        "/leads/:path*",
        "/arquivados/:path*",
        "/equipe/:path*",
        "/dashboard/:path*",
        "/assinatura/:path*",
    ]
};