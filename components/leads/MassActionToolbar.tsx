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
        <div
            className="fixed bottom-6 left-1/2 -translate-x-1/2 z-50 animate-fade-in"
            style={{ zIndex: 60 }}
            role="toolbar"
            aria-label="Ações em massa"
        >
            <div
                className="flex items-center gap-3 rounded-2xl px-5 py-3"
                style={{
                    background: "rgba(9, 15, 36, 0.92)",
                    border: "1px solid rgba(255,255,255,0.1)",
                    backdropFilter: "blur(20px)",
                    WebkitBackdropFilter: "blur(20px)",
                    boxShadow: "0 8px 40px rgba(0,0,0,0.5), 0 0 0 1px rgba(99,102,241,0.15)",
                }}
            >
                {/* Count badge */}
                <div className="flex items-center gap-2 pr-4 border-r border-white/[0.08]">
                    <span
                        className="flex h-7 w-7 items-center justify-center rounded-full text-xs font-bold text-white"
                        style={{ background: "linear-gradient(135deg,#6366f1,#8b5cf6)" }}
                    >
                        {selectedCount}
                    </span>
                    <span className="text-sm text-slate-300 whitespace-nowrap">
                        {selectedCount === 1 ? "lead selecionado" : "leads selecionados"}
                    </span>
                </div>

                {/* Actions */}
                <div className="flex items-center gap-2">
                    {mode === "active" && (
                        <>
                            <button
                                onClick={onArchive}
                                className="flex items-center gap-2 rounded-xl px-4 py-2 text-sm font-medium text-amber-400 transition-all hover:bg-amber-500/10"
                                title="Arquivar selecionados"
                            >
                                <Archive className="h-4 w-4" />
                                <span className="hidden sm:inline">Arquivar</span>
                            </button>

                            <button
                                onClick={onExportCSV}
                                className="flex items-center gap-2 rounded-xl px-4 py-2 text-sm font-medium text-emerald-400 transition-all hover:bg-emerald-500/10"
                                title="Exportar CSV"
                            >
                                <Download className="h-4 w-4" />
                                <span className="hidden sm:inline">Exportar CSV</span>
                            </button>
                        </>
                    )}

                    {mode === "archived" && (
                        <>
                            <button
                                onClick={onReactivate}
                                className="flex items-center gap-2 rounded-xl px-4 py-2 text-sm font-medium text-indigo-400 transition-all hover:bg-indigo-500/10"
                                title="Reativar selecionados"
                            >
                                <RotateCcw className="h-4 w-4" />
                                <span className="hidden sm:inline">Reativar</span>
                            </button>

                            <button
                                onClick={onDeleteForever}
                                className="flex items-center gap-2 rounded-xl px-4 py-2 text-sm font-medium text-red-400 transition-all hover:bg-red-500/10"
                                title="Excluir definitivamente"
                            >
                                <Trash2 className="h-4 w-4" />
                                <span className="hidden sm:inline">Excluir</span>
                            </button>
                        </>
                    )}
                </div>

                {/* Clear selection */}
                <div className="pl-3 border-l border-white/[0.08]">
                    <button
                        onClick={onClearSelection}
                        className="flex h-7 w-7 items-center justify-center rounded-lg text-slate-500 transition-colors hover:bg-white/[0.06] hover:text-slate-300"
                        title="Limpar seleção"
                    >
                        <X className="h-4 w-4" />
                    </button>
                </div>
            </div>
        </div>
    );
}
