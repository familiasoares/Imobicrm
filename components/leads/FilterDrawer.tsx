"use client";

import React, { useEffect } from "react";
import { X, SlidersHorizontal, Search } from "lucide-react";
import { CIDADES, DDDS, INTERESSES } from "@/lib/mock-leads";

export interface FilterValues {
    ddd: string;
    cidade: string;
    interesse: string;
    dataInicio: string;
    dataFim: string;
}

interface FilterDrawerProps {
    isOpen: boolean;
    onClose: () => void;
    filters: FilterValues;
    onChange: (f: FilterValues) => void;
    onClear: () => void;
}

export function FilterDrawer({
    isOpen,
    onClose,
    filters,
    onChange,
    onClear,
}: FilterDrawerProps) {
    const set = (key: keyof FilterValues, value: string) =>
        onChange({ ...filters, [key]: value });

    const activeCount = Object.values(filters).filter(Boolean).length;

    // Bloqueia a rolagem do fundo quando o menu está aberto no celular
    useEffect(() => {
        if (isOpen) document.body.style.overflow = 'hidden';
        else document.body.style.overflow = 'unset';
        return () => { document.body.style.overflow = 'unset'; }
    }, [isOpen]);

    return (
        <>
            {/* Overlay Escuro com transição */}
            <div
                className={`fixed inset-0 z-[90] bg-black/60 backdrop-blur-sm transition-opacity duration-300 ${isOpen ? "opacity-100 pointer-events-auto" : "opacity-0 pointer-events-none"
                    }`}
                onClick={onClose}
                aria-hidden="true"
            />

            {/* Menu Lateral Ajustado */}
            <aside
                className={`fixed right-0 top-0 z-[100] h-full flex flex-col w-[90vw] max-w-[340px] shadow-[-10px_0_30px_rgba(0,0,0,0.5)] transition-transform duration-300 ease-in-out bg-[#0a0a0a] border-l border-white/[0.06] ${isOpen ? "translate-x-0" : "translate-x-full"
                    }`}
                aria-label="Filtros avançados"
            >
                {/* Header */}
                <div className="flex items-center justify-between px-6 py-5 border-b border-white/[0.06] bg-[#0d0d0d]">
                    <div className="flex items-center gap-2">
                        <SlidersHorizontal className="h-4 w-4 text-cyan-400" />
                        <span className="font-bold text-white text-sm uppercase tracking-wide">Filtros Avançados</span>
                        {activeCount > 0 && (
                            <span className="flex h-5 w-5 items-center justify-center rounded-full bg-cyan-500/10 border border-cyan-500/30 text-[10px] font-bold text-cyan-400">
                                {activeCount}
                            </span>
                        )}
                    </div>
                    <button onClick={onClose} className="p-2 text-slate-400 hover:text-white hover:bg-white/5 rounded-lg transition-colors" aria-label="Fechar filtros">
                        <X className="h-4 w-4" />
                    </button>
                </div>

                {/* Filters body */}
                <div className="flex-1 overflow-y-auto px-6 py-6 space-y-6 scrollbar-thin scrollbar-thumb-white/10">

                    {/* Search tip */}
                    <div className="rounded-xl p-3 text-xs text-slate-400 flex items-start gap-2 bg-cyan-500/5 border border-cyan-500/10">
                        <Search className="h-4 w-4 mt-0.5 text-cyan-400 flex-shrink-0" />
                        <span>Use a barra de pesquisa na tabela para buscar por nome ou telefone rapidamente.</span>
                    </div>

                    {/* DDD */}
                    <div className="space-y-2">
                        <label className="text-[10px] font-bold text-slate-500 uppercase tracking-widest">
                            DDD da Região
                        </label>
                        <select
                            value={filters.ddd}
                            onChange={(e) => set("ddd", e.target.value)}
                            className="glass-input w-full bg-[#050505] border-white/10 text-sm focus:border-cyan-500/50"
                        >
                            <option value="">Todos os DDDs</option>
                            {DDDS.map((d) => (
                                <option key={d} value={d} className="bg-[#0a0a0a]">({d})</option>
                            ))}
                        </select>
                    </div>

                    {/* Cidade */}
                    <div className="space-y-2">
                        <label className="text-[10px] font-bold text-slate-500 uppercase tracking-widest">
                            Cidade
                        </label>
                        <select
                            value={filters.cidade}
                            onChange={(e) => set("cidade", e.target.value)}
                            className="glass-input w-full bg-[#050505] border-white/10 text-sm focus:border-cyan-500/50"
                        >
                            <option value="">Todas as Cidades</option>
                            {CIDADES.map((c) => (
                                <option key={c} value={c} className="bg-[#0a0a0a]">{c}</option>
                            ))}
                        </select>
                    </div>

                    {/* Interesse */}
                    <div className="space-y-2">
                        <label className="text-[10px] font-bold text-slate-500 uppercase tracking-widest">
                            Interesse
                        </label>
                        <select
                            value={filters.interesse}
                            onChange={(e) => set("interesse", e.target.value)}
                            className="glass-input w-full bg-[#050505] border-white/10 text-sm focus:border-cyan-500/50"
                        >
                            <option value="">Todos os Interesses</option>
                            {INTERESSES.map((i) => (
                                <option key={i} value={i} className="bg-[#0a0a0a]">{i}</option>
                            ))}
                        </select>
                    </div>

                    {/* Date range */}
                    <div className="space-y-3">
                        <label className="text-[10px] font-bold text-slate-500 uppercase tracking-widest">
                            Período de Criação
                        </label>
                        <div className="grid grid-cols-2 gap-3">
                            <div>
                                <p className="text-[10px] text-slate-500 mb-1">De</p>
                                <input
                                    type="date"
                                    value={filters.dataInicio}
                                    onChange={(e) => set("dataInicio", e.target.value)}
                                    className="glass-input w-full px-2 bg-[#050505] border-white/10 [color-scheme:dark] text-sm"
                                />
                            </div>
                            <div>
                                <p className="text-[10px] text-slate-500 mb-1">Até</p>
                                <input
                                    type="date"
                                    value={filters.dataFim}
                                    onChange={(e) => set("dataFim", e.target.value)}
                                    className="glass-input w-full px-2 bg-[#050505] border-white/10 [color-scheme:dark] text-sm"
                                />
                            </div>
                        </div>
                    </div>
                </div>

                {/* Footer */}
                <div className="px-6 py-5 border-t border-white/[0.06] bg-[#0d0d0d] flex gap-3">
                    <button
                        onClick={onClear}
                        className="flex-1 py-2 text-xs font-bold text-slate-400 bg-white/5 border border-white/10 rounded-lg hover:text-white hover:bg-white/10 transition-colors"
                    >
                        Limpar
                    </button>
                    <button
                        onClick={onClose}
                        className="flex-1 py-2 text-xs font-bold text-white bg-cyan-500 rounded-lg hover:bg-cyan-400 transition-colors shadow-[0_0_15px_rgba(6,182,212,0.3)]"
                    >
                        Aplicar
                    </button>
                </div>
            </aside>
        </>
    );
}