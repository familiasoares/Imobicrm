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
} from "lucide-react";
import { useSidebar, NavItemId } from "@/components/providers/SidebarProvider";

// -----------------------------------------------------------------------
// Nav items definition
// -----------------------------------------------------------------------
type NavSection = {
    label?: string;
    items: {
        id: NavItemId;
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

// Role display labels (keeps "GERENTE" → "Gerente")
const ROLE_LABELS: Record<string, string> = {
    ADMIN_SAAS: "Admin SaaS",
    GERENTE: "Gerente",
    CORRETOR: "Corretor",
};

// -----------------------------------------------------------------------
// User avatar: first initial from name, falls back to email initial
// -----------------------------------------------------------------------
function getInitial(name?: string | null, email?: string | null): string {
    return (name?.[0] ?? email?.[0] ?? "U").toUpperCase();
}

// -----------------------------------------------------------------------
// Sidebar content (shared between desktop and mobile drawer)
// -----------------------------------------------------------------------
function SidebarContent() {
    const { activePage, navigate } = useSidebar();
    const pathname = usePathname();
    const { data: session, status } = useSession();

    const user = session?.user;
    const initial = getInitial(user?.name, user?.email);
    const roleLabel = ROLE_LABELS[user?.role ?? ""] ?? user?.role ?? "—";
    const displayName = user?.name ?? user?.email ?? "Utilizador";

    return (
        <div className="flex flex-col h-full">
            {/* ---- Logo / Brand ---- */}
            <div className="px-5 py-5 border-b border-white/[0.06]">
                <div className="flex items-center gap-3">
                    <div
                        className="flex h-9 w-9 items-center justify-center rounded-xl animate-pulse-glow"
                        style={{
                            background: "linear-gradient(135deg, #6366f1 0%, #8b5cf6 100%)",
                            boxShadow: "0 0 20px rgba(99,102,241,0.45)",
                        }}
                    >
                        <Sparkles className="h-4 w-4 text-white" />
                    </div>
                    <div>
                        <p className="text-sm font-bold text-white tracking-wide leading-none">
                            ImobiCRM
                        </p>
                        <p className="text-[10px] text-slate-500 mt-0.5 font-medium tracking-widest uppercase">
                            Pro
                        </p>
                    </div>
                </div>
            </div>

            {/* ---- Navigation ---- */}
            <nav className="flex-1 overflow-y-auto px-3 py-4 space-y-5">
                {navSections.map((section) => (
                    <div key={section.label}>
                        {section.label && (
                            <p className="mb-1.5 px-3 text-[10px] font-semibold uppercase tracking-widest text-slate-600">
                                {section.label}
                            </p>
                        )}
                        <ul className="space-y-0.5">
                            {section.items.map((item) => {
                                const isActive = activePage === item.id || pathname === item.href;
                                return (
                                    <li key={item.id}>
                                        <Link
                                            href={item.href}
                                            className={`nav-item group ${isActive ? "active" : ""}`}
                                            onClick={() => navigate(item.id)}
                                        >
                                            <item.icon
                                                className={`h-4 w-4 flex-shrink-0 transition-colors ${isActive
                                                        ? "text-indigo-400"
                                                        : "text-slate-500 group-hover:text-slate-300"
                                                    }`}
                                            />
                                            <span className="flex-1">{item.label}</span>
                                            {isActive && (
                                                <ChevronRight className="h-3.5 w-3.5 text-indigo-400 opacity-70" />
                                            )}
                                        </Link>
                                    </li>
                                );
                            })}
                        </ul>
                    </div>
                ))}
            </nav>

            {/* ---- Footer: Live session user + Logout ---- */}
            <div className="border-t border-white/[0.06] px-3 py-4 space-y-1">
                {/* User card — shows real session data */}
                <div className="glass-card flex items-center gap-3 px-3 py-2.5 mb-2">
                    {/* Avatar with initial */}
                    <div
                        className="flex h-8 w-8 flex-shrink-0 items-center justify-center rounded-full text-xs font-bold text-white"
                        style={{ background: "linear-gradient(135deg, #6366f1, #8b5cf6)" }}
                    >
                        {status === "loading" ? (
                            <div className="h-3 w-3 animate-spin rounded-full border border-white border-t-transparent" />
                        ) : (
                            initial
                        )}
                    </div>
                    <div className="flex-1 min-w-0">
                        {status === "loading" ? (
                            <>
                                <div className="h-2.5 w-20 animate-pulse rounded bg-white/10 mb-1.5" />
                                <div className="h-2 w-28 animate-pulse rounded bg-white/[0.06]" />
                            </>
                        ) : (
                            <>
                                <p className="text-xs font-semibold text-slate-200 truncate">
                                    {roleLabel}
                                </p>
                                <p className="text-[10px] text-slate-500 truncate">{displayName}</p>
                            </>
                        )}
                    </div>
                </div>

                {/* Logout button */}
                <button
                    className="nav-item text-red-400/80 hover:bg-red-500/10 hover:text-red-400 w-full"
                    onClick={() => signOut({ callbackUrl: "/login" })}
                >
                    <LogOut className="h-4 w-4" />
                    Sair
                </button>
            </div>
        </div>
    );
}

// -----------------------------------------------------------------------
// Desktop Sidebar (always visible ≥ lg)
// -----------------------------------------------------------------------
export function DesktopSidebar() {
    return (
        <aside className="sidebar-panel hidden lg:flex">
            <SidebarContent />
        </aside>
    );
}

// -----------------------------------------------------------------------
// Mobile Drawer + Overlay
// -----------------------------------------------------------------------
export function MobileSidebar() {
    const { isOpen, close } = useSidebar();

    if (!isOpen) return null;

    return (
        <>
            <div
                className="mobile-overlay lg:hidden"
                onClick={close}
                aria-hidden="true"
            />
            <aside
                className="sidebar-panel lg:hidden animate-slide-in-left"
                role="dialog"
                aria-modal="true"
                aria-label="Menu de navegação"
            >
                <SidebarContent />
            </aside>
        </>
    );
}
