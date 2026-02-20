"use client";

import React from "react";
import { usePathname } from "next/navigation";
import { DesktopSidebar, MobileSidebar } from "@/components/Sidebar";
import { SidebarProvider, useSidebar } from "@/components/providers/SidebarProvider";
import { Menu, Bell } from "lucide-react";

export function LayoutShell({ children }: { children: React.ReactNode }) {
    const pathname = usePathname();
    const isLoginPage = pathname === "/login";

    // Se for login, não renderiza sidebar nem estrutura de dashboard
    if (isLoginPage) return <main className="bg-black min-h-screen">{children}</main>;

    return (
        <SidebarProvider>
            <div className="flex min-h-screen bg-black text-slate-200">
                {/* Desktop Sidebar: Visível apenas em telas grandes (lg) */}
                <DesktopSidebar />

                {/* Mobile Sidebar: Menu que desliza no celular */}
                <MobileSidebar />

                {/* Área de Conteúdo Principal */}
                <div className="flex flex-col flex-1 min-w-0">

                    {/* BARRA SUPERIOR MOBILE (Aparece apenas no celular/tablet) */}
                    <header className="flex items-center justify-between px-4 h-16 border-b border-white/[0.06] lg:hidden bg-[#0a0a0a] sticky top-0 z-30">
                        <div className="flex items-center gap-2">
                            <div className="h-8 w-8 rounded-lg bg-gradient-to-br from-cyan-500 to-blue-600 flex items-center justify-center shadow-[0_0_10px_rgba(6,182,212,0.3)]">
                                <span className="text-white text-xs font-bold">I</span>
                            </div>
                            <span className="text-sm font-bold text-white tracking-tight">ImobiCRM</span>
                        </div>

                        <div className="flex items-center gap-2">
                            <button className="p-2 text-slate-400">
                                <Bell className="h-5 w-5" />
                            </button>
                            {/* Botão que abre a Sidebar no celular */}
                            <MobileMenuTrigger />
                        </div>
                    </header>

                    {/* Conteúdo da Página */}
                    <main className="flex-1 overflow-x-hidden p-4 md:p-8">
                        <div className="max-w-7xl mx-auto">
                            {children}
                        </div>
                    </main>
                </div>
            </div>
        </SidebarProvider>
    );
}

// Botão separado para evitar re-renderizações desnecessárias
function MobileMenuTrigger() {
    const { open } = useSidebar();
    return (
        <button
            onClick={open}
            className="p-2 rounded-lg bg-white/[0.05] border border-white/[0.1] text-cyan-400 active:scale-95 transition-transform"
            aria-label="Abrir menu"
        >
            <Menu className="h-6 w-6" />
        </button>
    );
}