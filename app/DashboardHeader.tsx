"use client";

import React from "react";
import { useModal } from "@/components/providers/ModalProvider";
import { Plus } from "lucide-react";

export function DashboardHeader() {
    const { openCreate } = useModal();

    return (
        <header className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
            <div>
                <h1 className="text-2xl font-bold text-white tracking-tight">Dashboard Executivo</h1>
                <p className="text-sm text-slate-500 mt-1">Resumo do desempenho de vendas em tempo real.</p>
            </div>

            <button
                onClick={openCreate}
                className="flex items-center justify-center sm:justify-start gap-1.5 text-xs font-bold text-white bg-gradient-to-r from-cyan-500 to-blue-600 px-5 py-2.5 rounded-lg shadow-[0_0_15px_rgba(6,182,212,0.3)] hover:shadow-[0_0_20px_rgba(6,182,212,0.5)] transition-all active:scale-95"
            >
                <Plus className="h-4 w-4" />
                Novo Lead
            </button>
        </header>
    );
}