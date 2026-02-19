"use client";

import React from "react";
import { Menu, Plus, Bell } from "lucide-react";
import { useSidebar, NavItemId } from "@/components/providers/SidebarProvider";
import { useModal } from "@/components/providers/ModalProvider";

// Page title map — centralized here so Topbar always shows the right label
const PAGE_TITLES: Record<NavItemId, string> = {
    dashboard: "Dashboard",
    kanban: "Kanban — Funil de Vendas",
    leads: "Lista de Leads",
    arquivados: "Leads Arquivados",
    equipe: "Minha Equipe",
    assinatura: "Minha Assinatura",
    treinamentos: "Treinamentos",
};

interface TopbarProps {
    /** Callback invocado ao clicar em "Novo Lead" — futuramente abrirá um modal */
    onNewLead?: () => void;
}

export function Topbar({ onNewLead }: TopbarProps) {
    const { toggle, activePage } = useSidebar();
    const { openCreate } = useModal();
    const pageTitle = PAGE_TITLES[activePage];

    const handleNewLead = () => {
        onNewLead?.();
        openCreate();
    };

    return (
        <header className="topbar-panel">
            {/* ---- Left: hamburger (mobile) + page title ---- */}
            <div className="flex items-center gap-4">
                {/* Hamburger — only visible on mobile */}
                <button
                    onClick={toggle}
                    className="btn-ghost p-2 lg:hidden"
                    aria-label="Abrir menu"
                    aria-expanded="false"
                >
                    <Menu className="h-5 w-5 text-slate-400" />
                </button>

                <div className="animate-fade-in">
                    <h1 className="text-base font-semibold text-white leading-none">
                        {pageTitle}
                    </h1>
                    <p className="text-[11px] text-slate-500 mt-0.5">
                        {new Date().toLocaleDateString("pt-BR", {
                            weekday: "long",
                            day: "2-digit",
                            month: "long",
                            year: "numeric",
                        })}
                    </p>
                </div>
            </div>

            {/* ---- Right: actions ---- */}
            <div className="flex items-center gap-3">
                {/* Notification bell */}
                <button
                    className="btn-ghost relative p-2"
                    aria-label="Notificações"
                >
                    <Bell className="h-4.5 w-4.5 text-slate-400" />
                    {/* Red dot indicator */}
                    <span
                        className="absolute top-1.5 right-1.5 h-2 w-2 rounded-full bg-indigo-500"
                        aria-hidden="true"
                    />
                </button>

                {/* Divider */}
                <div className="h-6 w-px bg-white/[0.06]" />

                {/* ---- CTA: Novo Lead — opens CreateLeadModal via context ---- */}
                <button
                    onClick={handleNewLead}
                    className="btn-brand"
                    aria-label="Criar novo lead"
                    id="btn-novo-lead"
                >
                    <Plus className="h-4 w-4" />
                    <span className="hidden sm:inline">Novo Lead</span>
                    <span className="sm:hidden">Novo</span>
                </button>
            </div>
        </header>
    );
}
