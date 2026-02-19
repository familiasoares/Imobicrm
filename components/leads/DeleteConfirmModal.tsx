"use client";

import React from "react";
import { AlertTriangle, Trash2, X } from "lucide-react";

interface DeleteConfirmModalProps {
    isOpen: boolean;
    count: number;
    onConfirm: () => void;
    onCancel: () => void;
}

export function DeleteConfirmModal({
    isOpen,
    count,
    onConfirm,
    onCancel,
}: DeleteConfirmModalProps) {
    if (!isOpen) return null;

    return (
        <div className="fixed inset-0 z-[70] flex items-center justify-center p-4">
            {/* Dark overlay */}
            <div
                className="absolute inset-0 bg-black/70 backdrop-blur-sm"
                onClick={onCancel}
                aria-hidden="true"
            />

            {/* Modal */}
            <div
                className="relative w-full max-w-md rounded-2xl p-6 animate-fade-in"
                style={{
                    background: "rgba(15, 5, 5, 0.96)",
                    border: "1px solid rgba(239,68,68,0.25)",
                    backdropFilter: "blur(24px)",
                    WebkitBackdropFilter: "blur(24px)",
                    boxShadow: "0 0 60px rgba(239,68,68,0.15), 0 24px 48px rgba(0,0,0,0.6)",
                }}
                role="dialog"
                aria-modal="true"
                aria-labelledby="delete-modal-title"
            >
                {/* Close */}
                <button
                    onClick={onCancel}
                    className="absolute right-4 top-4 btn-ghost p-1.5"
                    aria-label="Cancelar"
                >
                    <X className="h-4 w-4" />
                </button>

                {/* Icon */}
                <div
                    className="mx-auto mb-4 flex h-14 w-14 items-center justify-center rounded-2xl"
                    style={{ background: "rgba(239,68,68,0.15)", border: "1px solid rgba(239,68,68,0.2)" }}
                >
                    <AlertTriangle className="h-7 w-7 text-red-400" />
                </div>

                {/* Text */}
                <div className="text-center space-y-2 mb-6">
                    <h2 id="delete-modal-title" className="text-lg font-bold text-white">
                        Excluir Definitivamente?
                    </h2>
                    <p className="text-sm text-slate-400">
                        Você está prestes a excluir permanentemente{" "}
                        <span className="font-semibold text-red-400">
                            {count} {count === 1 ? "lead" : "leads"}
                        </span>
                        . Esta ação{" "}
                        <span className="font-semibold text-white">não pode ser desfeita</span>.
                    </p>
                </div>

                {/* Warning box */}
                <div
                    className="rounded-xl p-3 mb-6 text-xs text-red-300/80 flex items-start gap-2"
                    style={{ background: "rgba(239,68,68,0.08)", border: "1px solid rgba(239,68,68,0.15)" }}
                >
                    <AlertTriangle className="h-3.5 w-3.5 mt-0.5 text-red-400 flex-shrink-0" />
                    <span>
                        Os dados dos leads, histórico de interações e motivos de perda associados
                        também serão removidos permanentemente.
                    </span>
                </div>

                {/* Actions */}
                <div className="flex gap-3">
                    <button
                        onClick={onCancel}
                        className="btn-ghost flex-1 justify-center border border-white/[0.08]"
                    >
                        Cancelar
                    </button>
                    <button
                        onClick={onConfirm}
                        className="flex-1 inline-flex items-center justify-center gap-2 rounded-xl px-5 py-2.5 text-sm font-semibold text-white transition-all duration-200"
                        style={{
                            background: "linear-gradient(135deg,#dc2626,#ef4444)",
                            boxShadow: "0 0 20px rgba(220,38,38,0.35)",
                        }}
                        onMouseEnter={(e) => {
                            (e.currentTarget as HTMLButtonElement).style.boxShadow =
                                "0 0 32px rgba(220,38,38,0.55)";
                            (e.currentTarget as HTMLButtonElement).style.transform = "translateY(-1px)";
                        }}
                        onMouseLeave={(e) => {
                            (e.currentTarget as HTMLButtonElement).style.boxShadow =
                                "0 0 20px rgba(220,38,38,0.35)";
                            (e.currentTarget as HTMLButtonElement).style.transform = "translateY(0)";
                        }}
                    >
                        <Trash2 className="h-4 w-4" />
                        Excluir Permanently
                    </button>
                </div>
            </div>
        </div>
    );
}
