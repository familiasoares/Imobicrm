"use client";

import React from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { useSession, signOut } from "next-auth/react";
import {
    LayoutDashboard,
    Kanban,
    Users,
    Archive,
    UserCheck,
    CreditCard,
    GraduationCap,
    LogOut,
    ChevronRight,
    Sparkles,
    X,
    CalendarCheck // 👈 Ícone da Agenda adicionado aqui
} from "lucide-react";
import { useSidebar, NavItemId } from "@/components/providers/SidebarProvider";

type NavSection = {
    label?: string;
    items: {
        id: NavItemId | string; // 👈 Adicionado suporte para string caso NavItemId seja estrito
        label: string;
        icon: React.ElementType;
        href: string;
    }[];
};

const navSections: NavSection[] = [
    {
        label: "Principal",
        items: [
            { id: "dashboard", label: "Dashboard", icon: LayoutDashboard, href: "/" },
            { id: "agenda", label: "Agenda & Tarefas", icon: CalendarCheck, href: "/agenda" }, // 👈 Novo botão da Agenda!
            { id: "kanban", label: "Kanban", icon: Kanban, href: "/kanban" },
            { id: "leads", label: "Lista de Leads", icon: Users, href: "/leads" },
            { id: "arquivados", label: "Arquivados", icon: Archive, href: "/arquivados" },
        ],
    },
    {
        label: "Gestão",
        items: [
            { id: "equipe", label: "Minha Equipe", icon: UserCheck, href: "/equipe" },
            { id: "assinatura", label: "Minha Assinatura", icon: CreditCard, href: "/assinatura" },
            { id: "treinamentos", label: "Treinamentos", icon: GraduationCap, href: "/treinamentos" },
        ],
    },
];

const ROLE_LABELS: Record<string, string> = {
    ADMIN_SAAS: "Admin SaaS",
    GERENTE: "Gerente",
    CORRETOR: "Corretor",
};

function getInitial(name?: string | null, email?: string | null): string {
    return (name?.[0] ?? email?.[0] ?? "U").toUpperCase();
}

// -----------------------------------------------------------------------
// Sidebar Content
// -----------------------------------------------------------------------
function SidebarContent({ onClose }: { onClose?: () => void }) {
    const { activePage, navigate } = useSidebar();
    const pathname = usePathname();
    const { data: session, status } = useSession();

    const user = session?.user;
    const initial = getInitial(user?.name, user?.email);
    const roleLabel = ROLE_LABELS[user?.role ?? ""] ?? user?.role ?? "—";
    const displayName = user?.name ?? user?.email ?? "Utilizador";

    const handleNavigate = (id: any) => {
        navigate(id);
        if (onClose) onClose(); // Fecha no mobile após clicar
    };

    return (
        <div className="flex flex-col h-full bg-[#0a0a0a] border-r border-white/[0.06]">
            {/* Header */}
            <div className="px-6 py-6 flex items-center justify-between">
                <div className="flex items-center gap-3">
                    <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-gradient-to-br from-cyan-500 to-blue-600 shadow-[0_0_15px_rgba(6,182,212,0.4)]">
                        <Sparkles className="h-4 w-4 text-white" />
                    </div>
                    <div>
                        <p className="text-sm font-bold text-white tracking-wide">ImobiCRM</p>
                        <p className="text-[10px] text-cyan-500 font-bold uppercase tracking-widest">Pro</p>
                    </div>
                </div>
                {/* Botão fechar (visível apenas no mobile via CSS) */}
                <button onClick={onClose} className="lg:hidden text-slate-500 hover:text-white">
                    <X className="h-5 w-5" />
                </button>
            </div>

            {/* Nav */}
            <nav className="flex-1 overflow-y-auto px-3 py-4 space-y-6">
                {navSections.map((section) => (
                    <div key={section.label}>
                        {section.label && (
                            <p className="mb-2 px-3 text-[10px] font-bold uppercase tracking-widest text-slate-600">
                                {section.label}
                            </p>
                        )}
                        <ul className="space-y-1">
                            {section.items.map((item) => {
                                const isActive = activePage === item.id || pathname === item.href;
                                return (
                                    <li key={item.id}>
                                        <Link
                                            href={item.href}
                                            onClick={() => handleNavigate(item.id)}
                                            className={`flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium transition-all duration-200 group
                                                ${isActive
                                                    ? "bg-cyan-500/10 text-cyan-400 shadow-[inset_0_0_10px_rgba(6,182,212,0.05)]"
                                                    : "text-slate-400 hover:bg-white/[0.03] hover:text-slate-200"}`}
                                        >
                                            <item.icon className={`h-4 w-4 ${isActive ? "text-cyan-400" : "text-slate-500 group-hover:text-slate-300"}`} />
                                            <span className="flex-1">{item.label}</span>
                                            {isActive && <ChevronRight className="h-3 w-3" />}
                                        </Link>
                                    </li>
                                );
                            })}
                        </ul>
                    </div>
                ))}
            </nav>

            {/* Footer */}
            <div className="p-4 border-t border-white/[0.06] space-y-2">
                <div className="flex items-center gap-3 p-2 rounded-xl bg-white/[0.02] border border-white/[0.05]">
                    <div className="h-8 w-8 rounded-full bg-gradient-to-tr from-cyan-600 to-blue-700 flex items-center justify-center text-xs font-bold text-white">
                        {status === "loading" ? "..." : initial}
                    </div>
                    <div className="flex-1 min-w-0">
                        <p className="text-xs font-bold text-slate-200 truncate">{roleLabel}</p>
                        <p className="text-[10px] text-slate-500 truncate">{displayName}</p>
                    </div>
                </div>
                <button
                    onClick={() => signOut({ callbackUrl: "/login" })}
                    className="flex items-center gap-3 px-3 py-2.5 w-full rounded-lg text-sm font-medium text-red-400 hover:bg-red-500/10 transition-colors"
                >
                    <LogOut className="h-4 w-4" />
                    Sair
                </button>
            </div>
        </div>
    );
}

// -----------------------------------------------------------------------
// Main Sidebar Exports
// -----------------------------------------------------------------------

export function DesktopSidebar() {
    return (
        <aside className="hidden lg:flex flex-col w-64 h-screen sticky top-0">
            <SidebarContent />
        </aside>
    );
}

export function MobileSidebar() {
    const { isOpen, close } = useSidebar();

    return (
        <>
            {/* Overlay: Suave com transição de opacidade */}
            <div
                className={`fixed inset-0 z-40 bg-black/60 backdrop-blur-sm transition-opacity duration-300 lg:hidden
                ${isOpen ? "opacity-100 pointer-events-auto" : "opacity-0 pointer-events-none"}`}
                onClick={close}
            />

            {/* Drawer: Desliza da esquerda sem destruir o componente */}
            <aside
                className={`fixed inset-y-0 left-0 z-50 w-72 bg-black transition-transform duration-300 ease-in-out lg:hidden
                ${isOpen ? "translate-x-0" : "-translate-x-full"}`}
            >
                <SidebarContent onClose={close} />
            </aside>
        </>
    );
}