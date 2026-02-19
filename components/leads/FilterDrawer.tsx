"use client";

import React from "react";
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

    return (
        <>
            {/* Overlay */}
            {isOpen && (
                <div
                    className="fixed inset-0 z-50 bg-black/50 backdrop-blur-sm"
                    onClick={onClose}
                    aria-hidden="true"
                />
            )}

            {/* Drawer */}
            <aside
                className={`fixed right-0 top-0 z-50 h-full flex flex-col transition-transform duration-300 ease-in-out ${isOpen ? "translate-x-0" : "translate-x-full"
                    }`}
                style={{
                    width: "340px",
                    background: "rgba(9, 15, 36, 0.95)",
                    borderLeft: "1px solid rgba(255,255,255,0.07)",
                    backdropFilter: "blur(24px)",
                    WebkitBackdropFilter: "blur(24px)",
                }}
                aria-label="Filtros avançados"
            >
                {/* Header */}
                <div className="flex items-center justify-between px-6 py-4 border-b border-white/[0.06]">
                    <div className="flex items-center gap-2">
                        <SlidersHorizontal className="h-4 w-4 text-indigo-400" />
                        <span className="font-semibold text-white text-sm">Filtros Avançados</span>
                        {activeCount > 0 && (
                            <span className="badge badge-info">{activeCount}</span>
                        )}
                    </div>
                    <button onClick={onClose} className="btn-ghost p-1.5" aria-label="Fechar filtros">
                        <X className="h-4 w-4" />
                    </button>
                </div>

                {/* Filters body */}
                <div className="flex-1 overflow-y-auto px-6 py-5 space-y-5">

                    {/* DDD */}
                    <div className="space-y-2">
                        <label className="text-xs font-medium text-slate-400 uppercase tracking-wider">
                            DDD
                        </label>
                        <select
                            value={filters.ddd}
                            onChange={(e) => set("ddd", e.target.value)}
                            className="glass-input"
                        >
                            <option value="">Todos os DDDs</option>
                            {DDDS.map((d) => (
                                <option key={d} value={d} className="bg-slate-900">
                                    ({d})
                                </option>
                            ))}
                        </select>
                    </div>

                    {/* Cidade */}
                    <div className="space-y-2">
                        <label className="text-xs font-medium text-slate-400 uppercase tracking-wider">
                            Cidade
                        </label>
                        <select
                            value={filters.cidade}
                            onChange={(e) => set("cidade", e.target.value)}
                            className="glass-input"
                        >
                            <option value="">Todas as Cidades</option>
                            {CIDADES.map((c) => (
                                <option key={c} value={c} className="bg-slate-900">
                                    {c}
                                </option>
                            ))}
                        </select>
                    </div>

                    {/* Interesse */}
                    <div className="space-y-2">
                        <label className="text-xs font-medium text-slate-400 uppercase tracking-wider">
                            Interesse
                        </label>
                        <select
                            value={filters.interesse}
                            onChange={(e) => set("interesse", e.target.value)}
                            className="glass-input"
                        >
                            <option value="">Todos os Interesses</option>
                            {INTERESSES.map((i) => (
                                <option key={i} value={i} className="bg-slate-900">
                                    {i}
                                </option>
                            ))}
                        </select>
                    </div>

                    {/* Date range */}
                    <div className="space-y-2">
                        <label className="text-xs font-medium text-slate-400 uppercase tracking-wider">
                            Período de Criação
                        </label>
                        <div className="space-y-2">
                            <div>
                                <p className="text-xs text-slate-500 mb-1">De</p>
                                <input
                                    type="date"
                                    value={filters.dataInicio}
                                    onChange={(e) => set("dataInicio", e.target.value)}
                                    className="glass-input [color-scheme:dark]"
                                />
                            </div>
                            <div>
                                <p className="text-xs text-slate-500 mb-1">Até</p>
                                <input
                                    type="date"
                                    value={filters.dataFim}
                                    onChange={(e) => set("dataFim", e.target.value)}
                                    className="glass-input [color-scheme:dark]"
                                />
                            </div>
                        </div>
                    </div>

                    {/* Search tip */}
                    <div
                        className="rounded-xl p-3 text-xs text-slate-500 flex items-start gap-2"
                        style={{ background: "rgba(99,102,241,0.06)", border: "1px solid rgba(99,102,241,0.12)" }}
                    >
                        <Search className="h-3.5 w-3.5 mt-0.5 text-indigo-400 flex-shrink-0" />
                        <span>Use a barra de pesquisa acima para filtrar por nome ou telefone simultaneamente.</span>
                    </div>
                </div>

                {/* Footer */}
                <div className="px-6 py-4 border-t border-white/[0.06] flex gap-3">
                    <button
                        onClick={onClear}
                        className="btn-ghost flex-1 justify-center border border-white/[0.08]"
                    >
                        Limpar Filtros
                    </button>
                    <button onClick={onClose} className="btn-brand flex-1 justify-center">
                        Aplicar
                    </button>
                </div>
            </aside>
        </>
    );
}
