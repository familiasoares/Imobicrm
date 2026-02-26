"use client";

import React, { useEffect } from "react";
import { X, SlidersHorizontal, Search } from "lucide-react";

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
    leads: any[]; // 👈 Adicionamos a lista de leads aqui para ser dinâmica!
}

export function FilterDrawer({
    isOpen,
    onClose,
    filters,
    onChange,
    onClear,
    leads = [], // Valor padrão para evitar erros
}: FilterDrawerProps) {
    const set = (key: keyof FilterValues, value: string) =>
        onChange({ ...filters, [key]: value });

    const activeCount = Object.values(filters).filter(Boolean).length;

    // 🧠 MÁGICA AQUI: Extrai apenas os valores únicos que existem nos leads atuais
    const uniqueDDDs = Array.from(new Set(leads.map(l => l.ddd).filter(Boolean))).sort();
    const uniqueCidades = Array.from(new Set(leads.map(l => l.cidade).filter(Boolean))).sort();
    const uniqueInteresses = Array.from(new Set(leads.map(l => l.interesse).filter(Boolean))).sort();

    useEffect(() => {
        if (isOpen) document.body.style.overflow = 'hidden';
        else document.body.style.overflow = 'unset';
        return () => { document.body.style.overflow = 'unset'; }
    }, [isOpen]);

    if (!isOpen) return null;

    return (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 sm:p-6">
            <div
                className="absolute inset-0 bg-black/70 backdrop-blur-sm transition-opacity"
                onClick={onClose}
                aria-hidden="true"
            />

            <aside
                className="relative w-full max-w-lg bg-[#0a0a0a] border border-cyan-500/20 rounded-2xl shadow-[0_20px_60px_-15px_rgba(6,182,212,0.3)] flex flex-col overflow-hidden animate-fade-in-up"
                aria-label="Filtros avançados"
                style={{ maxHeight: '85vh' }}
            >
                {/* Header */}
                <div className="flex items-center justify-between px-6 py-5 border-b border-white/[0.06] bg-[#0d0d0d]">
                    <div className="flex items-center gap-2">
                        <SlidersHorizontal className="h-5 w-5 text-cyan-400" />
                        <span className="font-bold text-white text-base uppercase tracking-wide">Filtros Avançados</span>
                        {activeCount > 0 && (
                            <span className="flex h-5 w-5 items-center justify-center rounded-full bg-cyan-500/10 border border-cyan-500/30 text-[10px] font-bold text-cyan-400">
                                {activeCount}
                            </span>
                        )}
                    </div>
                    <button onClick={onClose} className="p-2 text-slate-400 hover:text-white hover:bg-white/5 rounded-lg transition-colors" aria-label="Fechar filtros">
                        <X className="h-5 w-5" />
                    </button>
                </div>

                {/* Filters body */}
                <div className="flex-1 overflow-y-auto px-6 py-6 space-y-6 scrollbar-thin scrollbar-thumb-white/10">

                    <div className="rounded-xl p-3 text-xs text-slate-400 flex items-start gap-2 bg-cyan-500/5 border border-cyan-500/10">
                        <Search className="h-4 w-4 mt-0.5 text-cyan-400 flex-shrink-0" />
                        <span>Use a barra de pesquisa na tabela para buscar por nome ou telefone rapidamente.</span>
                    </div>

                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
                        {/* DDD Dinâmico */}
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
                                {uniqueDDDs.map((d) => (
                                    <option key={d} value={d} className="bg-[#0a0a0a]">({d})</option>
                                ))}
                            </select>
                        </div>

                        {/* Cidade Dinâmica */}
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
                                {uniqueCidades.map((c) => (
                                    <option key={c} value={c} className="bg-[#0a0a0a]">{c}</option>
                                ))}
                            </select>
                        </div>
                    </div>

                    {/* Interesse Dinâmico */}
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
                            {uniqueInteresses.map((i) => (
                                <option key={i} value={i} className="bg-[#0a0a0a]">{i}</option>
                            ))}
                        </select>
                    </div>

                    {/* Date range */}
                    <div className="space-y-3">
                        <label className="text-[10px] font-bold text-slate-500 uppercase tracking-widest">
                            Período de Criação
                        </label>
                        <div className="grid grid-cols-2 gap-4">
                            <div>
                                <p className="text-[10px] text-slate-500 mb-1">De</p>
                                <input
                                    type="date"
                                    value={filters.dataInicio}
                                    onChange={(e) => set("dataInicio", e.target.value)}
                                    className="glass-input w-full px-3 bg-[#050505] border-white/10 [color-scheme:dark] text-sm"
                                />
                            </div>
                            <div>
                                <p className="text-[10px] text-slate-500 mb-1">Até</p>
                                <input
                                    type="date"
                                    value={filters.dataFim}
                                    onChange={(e) => set("dataFim", e.target.value)}
                                    className="glass-input w-full px-3 bg-[#050505] border-white/10 [color-scheme:dark] text-sm"
                                />
                            </div>
                        </div>
                    </div>
                </div>

                {/* Footer */}
                <div className="px-6 py-5 border-t border-white/[0.06] bg-[#0d0d0d] flex gap-3">
                    <button
                        onClick={onClear}
                        className="w-1/3 py-2.5 text-xs font-bold text-slate-400 bg-white/5 border border-white/10 rounded-lg hover:text-white hover:bg-white/10 transition-colors uppercase tracking-wide"
                    >
                        Limpar
                    </button>
                    <button
                        onClick={onClose}
                        className="w-2/3 py-2.5 text-xs font-bold text-black bg-cyan-400 rounded-lg hover:bg-cyan-300 transition-colors shadow-[0_0_15px_rgba(6,182,212,0.4)] uppercase tracking-wide"
                    >
                        Aplicar Filtros
                    </button>
                </div>
            </aside>
        </div>
    );
}