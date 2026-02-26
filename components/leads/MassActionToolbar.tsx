"use client";

import React from "react";
import { Archive, Download, RotateCcw, Trash2, X } from "lucide-react";

interface MassActionToolbarProps {
    selectedCount: number;
    mode: "active" | "archived";
    onClearSelection: () => void;
    onArchive?: () => void;
    onExportCSV?: () => void;
    onReactivate?: () => void;
    onDeleteForever?: () => void;
}

export function MassActionToolbar({
    selectedCount,
    mode,
    onClearSelection,
    onArchive,
    onExportCSV,
    onReactivate,
    onDeleteForever,
}: MassActionToolbarProps) {
    if (selectedCount === 0) return null;

    return (
        // O "inset-x-0 flex justify-center" garante a centralização absoluta na tela
        <div
            className="fixed bottom-6 inset-x-0 z-[100] flex justify-center px-4 pointer-events-none animate-fade-in"
            role="toolbar"
            aria-label="Ações em massa"
        >
            <div
                className="pointer-events-auto flex flex-wrap sm:flex-nowrap items-center gap-2 sm:gap-3 rounded-2xl px-4 py-3 shadow-2xl bg-[#0a0a0a] border border-white/10"
                style={{
                    boxShadow: "0 10px 40px rgba(0,0,0,0.8), 0 0 0 1px rgba(6,182,212,0.2)",
                }}
            >
                {/* Count badge */}
                <div className="flex items-center gap-2 pr-4 border-r border-white/10">
                    <span
                        className="flex h-6 w-6 sm:h-7 sm:w-7 items-center justify-center rounded-full text-xs font-bold text-white"
                        style={{ background: "linear-gradient(135deg, #06b6d4, #2563eb)" }}
                    >
                        {selectedCount}
                    </span>
                    <span className="text-[11px] sm:text-sm text-slate-300 font-medium whitespace-nowrap">
                        {selectedCount === 1 ? "lead selecionado" : "leads selecionados"}
                    </span>
                </div>

                {/* Actions */}
                <div className="flex items-center gap-1 sm:gap-2">
                    {mode === "active" && (
                        <>
                            <button
                                onClick={onArchive}
                                className="flex items-center gap-1.5 rounded-lg sm:rounded-xl px-3 py-2 text-[11px] sm:text-sm font-bold text-amber-400 hover:bg-amber-500/10 transition-colors uppercase tracking-wide"
                                title="Arquivar selecionados"
                            >
                                <Archive className="h-3.5 w-3.5 sm:h-4 sm:w-4" />
                                <span className="hidden sm:inline">Arquivar</span>
                            </button>

                            <button
                                onClick={onExportCSV}
                                className="flex items-center gap-1.5 rounded-lg sm:rounded-xl px-3 py-2 text-[11px] sm:text-sm font-bold text-cyan-400 hover:bg-cyan-500/10 transition-colors uppercase tracking-wide"
                                title="Exportar CSV"
                            >
                                <Download className="h-3.5 w-3.5 sm:h-4 sm:w-4" />
                                <span className="hidden sm:inline">Exportar</span>
                            </button>
                        </>
                    )}

                    {mode === "archived" && (
                        <>
                            <button
                                onClick={onReactivate}
                                className="flex items-center gap-1.5 rounded-lg sm:rounded-xl px-3 py-2 text-[11px] sm:text-sm font-bold text-cyan-400 hover:bg-cyan-500/10 transition-colors uppercase tracking-wide"
                                title="Reativar selecionados"
                            >
                                <RotateCcw className="h-3.5 w-3.5 sm:h-4 sm:w-4" />
                                <span className="hidden sm:inline">Reativar</span>
                            </button>

                            <button
                                onClick={onDeleteForever}
                                className="flex items-center gap-1.5 rounded-lg sm:rounded-xl px-3 py-2 text-[11px] sm:text-sm font-bold text-red-400 hover:bg-red-500/10 transition-colors uppercase tracking-wide"
                                title="Excluir definitivamente"
                            >
                                <Trash2 className="h-3.5 w-3.5 sm:h-4 sm:w-4" />
                                <span className="hidden sm:inline">Excluir</span>
                            </button>
                        </>
                    )}
                </div>

                {/* Clear selection */}
                <div className="pl-2 sm:pl-3 border-l border-white/10">
                    <button
                        onClick={onClearSelection}
                        className="flex h-7 w-7 items-center justify-center rounded-lg text-slate-400 hover:bg-white/10 hover:text-white transition-colors"
                        title="Limpar seleção"
                    >
                        <X className="h-4 w-4" />
                    </button>
                </div>
            </div>
        </div>
    );
}