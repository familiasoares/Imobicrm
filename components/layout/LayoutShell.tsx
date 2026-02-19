"use client";

import { usePathname } from "next/navigation";
import { SidebarProvider } from "@/components/providers/SidebarProvider";
import { DesktopSidebar, MobileSidebar } from "@/components/layout/Sidebar";
import { Topbar } from "@/components/layout/Topbar";
import { SubscriptionBanner } from "@/components/layout/SubscriptionBanner";

// Pages that must render WITHOUT the sidebar/topbar shell
const AUTH_PATHS = ["/login"];

/**
 * LayoutShell
 *
 * Client Component that conditionally wraps children with the full CRM
 * sidebar/topbar layout or renders them bare (for /login and other auth pages).
 *
 * This avoids having to duplicate the root <html>/<body> structure
 * into separate route-group layouts.
 */
export function LayoutShell({ children }: { children: React.ReactNode }) {
    const pathname = usePathname();
    const isAuthPage = AUTH_PATHS.some((p) => pathname.startsWith(p));

    // ---- Bare render for auth pages ----
    if (isAuthPage) {
        return <>{children}</>;
    }

    // ---- Full CRM shell ----
    return (
        <SidebarProvider>
            {/* Global overdue banner — self-hides when cookie absent */}
            <SubscriptionBanner />

            {/* Desktop sidebar (fixed left) */}
            <DesktopSidebar />

            {/* Mobile drawer */}
            <MobileSidebar />

            {/* Main area: offset to the right of the sidebar */}
            <div
                className="flex flex-col min-h-screen transition-all duration-300"
                style={{ marginLeft: "var(--sidebar-width)" }}
            >
                <Topbar />
                <main
                    className="flex-1 overflow-y-auto p-6"
                    style={{ paddingTop: "calc(64px + 1.5rem)" }}
                >
                    {children}
                </main>
            </div>
        </SidebarProvider>
    );
}
