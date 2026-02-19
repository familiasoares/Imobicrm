"use client";

import React, { useEffect, useRef, useState, useTransition } from "react";
import {
    X, User, Phone, MapPin, Home,
    Loader2, Archive, ExternalLink,
} from "lucide-react";
import { useRouter } from "next/navigation";
import { useModal } from "@/components/providers/ModalProvider";
import { useToast } from "@/components/ui/Toast";
import { updateLead, archiveLead } from "@/app/actions/lead.actions";

// -----------------------------------------------------------------------
// Interest options (kept in sync with CreateLeadModal)
// -----------------------------------------------------------------------
const INTERESSE_OPTIONS = [
    "Compra — Casa",
    "Compra — Apartamento",
    "Compra — Terreno",
    "Compra — Comercial",
    "Locação — Residencial",
    "Locação — Comercial",
    "Investimento",
];

const DDD_OPTIONS = [
    "11", "12", "13", "14", "15", "16", "17", "18", "19",
    "21", "22", "24", "27", "28", "31", "32", "33", "34", "35", "37", "38",
    "41", "42", "43", "44", "45", "46", "47", "48", "49", "51", "53", "54", "55",
    "61", "62", "63", "64", "65", "66", "67", "68", "69",
    "71", "73", "74", "75", "77", "79", "81", "82", "83", "84", "85", "86", "87", "88", "89",
    "91", "92", "93", "94", "95", "96", "97", "98", "99",
];

// Status display labels
const STATUS_LABELS: Record<string, string> = {
    NOVO_LEAD: "Novo Lead",
    EM_ATENDIMENTO: "Em Atendimento",
    VISITA: "Visita",
    AGENDAMENTO: "Agendamento",
    PROPOSTA: "Proposta",
    VENDA_FECHADA: "Venda Fechada",
    VENDA_PERDIDA: "Venda Perdida",
};
const STATUS_COLORS: Record<string, string> = {
    NOVO_LEAD: "#6366f1",
    EM_ATENDIMENTO: "#3b82f6",
    VISITA: "#8b5cf6",
    AGENDAMENTO: "#f59e0b",
    PROPOSTA: "#ec4899",
    VENDA_FECHADA: "#10b981",
    VENDA_PERDIDA: "#ef4444",
};

type FormData = {
    nome: string;
    ddd: string;
    telefone: string;
    cidade: string;
    interesse: string;
};
type FormErrors = Partial<Record<keyof FormData, string>>;

function validate(data: FormData): FormErrors {
    const errors: FormErrors = {};
    if (!data.nome.trim()) errors.nome = "Nome é obrigatório";
    if (!data.telefone.trim()) errors.telefone = "Telefone é obrigatório";
    if (!data.cidade.trim()) errors.cidade = "Cidade é obrigatória";
    if (!data.interesse) errors.interesse = "Selecione um interesse";
    return errors;
}

// -----------------------------------------------------------------------
// Modal
// -----------------------------------------------------------------------
export function EditLeadModal() {
    const { modal, close } = useModal();
    const { toast } = useToast();
    const router = useRouter();
    const [form, setForm] = useState<FormData | null>(null);
    const [errors, setErrors] = useState<FormErrors>({});
    const [isPending, startTransition] = useTransition();
    const [archiveConfirm, setArchiveConfirm] = useState(false);
    const firstInputRef = useRef<HTMLInputElement>(null);

    const isOpen = modal.type === "edit";
    const lead = isOpen ? modal.lead : null;

    // Populate form when lead changes
    useEffect(() => {
        if (!isOpen || !lead) { setForm(null); setErrors({}); setArchiveConfirm(false); return; }
        setForm({
            nome: lead.nome,
            ddd: lead.ddd,
            telefone: lead.telefone,
            cidade: lead.cidade,
            interesse: lead.interesse,
        });
        setTimeout(() => firstInputRef.current?.focus(), 60);
    }, [isOpen, lead]);

    // Escape key
    useEffect(() => {
        if (!isOpen) return;
        const onKey = (e: KeyboardEvent) => { if (e.key === "Escape") close(); };
        window.addEventListener("keydown", onKey);
        return () => window.removeEventListener("keydown", onKey);
    }, [isOpen, close]);

    if (!isOpen || !lead || !form) return null;

    const set = (field: keyof FormData, value: string) => {
        setForm((f) => f ? { ...f, [field]: value } : f);
        if (errors[field]) setErrors((e) => ({ ...e, [field]: undefined }));
    };

    // ---- Save ----
    const handleSave = (e: React.FormEvent) => {
        e.preventDefault();
        if (!form) return;
        const errs = validate(form);
        if (Object.keys(errs).length) { setErrors(errs); return; }

        startTransition(async () => {
            try {
                await updateLead(lead.id, {
                    nome: form.nome.trim(),
                    ddd: form.ddd,
                    telefone: form.telefone.trim(),
                    cidade: form.cidade.trim(),
                    interesse: form.interesse,
                });
                close();
                toast("Lead atualizado com sucesso!", "success");
                router.refresh(); // re-fetch DB → LeadsClient + KanbanBoard sync via useEffect
            } catch (err) {
                console.error(err);
                toast("Erro ao atualizar lead.", "error");
            }
        });
    };

    // ---- Archive ----
    const handleArchive = () => {
        if (!archiveConfirm) { setArchiveConfirm(true); return; }
        startTransition(async () => {
            try {
                await archiveLead(lead.id);
                close();
                toast("Lead arquivado.", "warning");
                router.refresh(); // remove card from board + list without F5
            } catch (err) {
                console.error(err);
                toast("Erro ao arquivar lead.", "error");
            }
        });
    };

    const statusColor = STATUS_COLORS[lead.status] ?? "#6366f1";

    return (
        <>
            {/* Backdrop */}
            <div
                className="fixed inset-0 z-40 bg-black/60 backdrop-blur-sm"
                onClick={close}
                aria-hidden="true"
            />

            {/* Dialog */}
            <div
                role="dialog"
                aria-modal="true"
                aria-labelledby="edit-lead-title"
                className="fixed inset-0 z-50 flex items-center justify-center p-4"
            >
                <div
                    className="relative w-full max-w-lg rounded-2xl animate-fade-in overflow-hidden"
                    style={{
                        background: "rgba(9,15,36,0.97)",
                        border: "1px solid rgba(255,255,255,0.07)",
                        backdropFilter: "blur(24px)",
                        WebkitBackdropFilter: "blur(24px)",
                        boxShadow: "0 0 60px rgba(99,102,241,0.12), 0 32px 64px rgba(0,0,0,0.6)",
                    }}
                >
                    {/* Accent bar */}
                    <div className="h-1 w-full" style={{ background: `linear-gradient(90deg, ${statusColor}, transparent)` }} />

                    <div className="p-6 sm:p-7">
                        {/* Header */}
                        <div className="flex items-start justify-between mb-5">
                            <div>
                                <div className="flex items-center gap-2 mb-1">
                                    <span
                                        className="rounded-full px-2 py-0.5 text-[11px] font-semibold"
                                        style={{
                                            background: `${statusColor}22`,
                                            color: statusColor,
                                            border: `1px solid ${statusColor}44`,
                                        }}
                                    >
                                        {STATUS_LABELS[lead.status] ?? lead.status}
                                    </span>
                                </div>
                                <h2 id="edit-lead-title" className="text-lg font-bold text-white">
                                    Editar Lead
                                </h2>
                                <p className="text-xs text-slate-500 mt-0.5">ID interno: {lead.id.slice(0, 8)}…</p>
                            </div>
                            <button onClick={close} className="btn-ghost p-1.5" aria-label="Fechar">
                                <X className="h-4 w-4" />
                            </button>
                        </div>

                        {/* Form */}
                        <form onSubmit={handleSave} noValidate className="space-y-4">

                            {/* Nome */}
                            <EField label="Nome Completo" error={errors.nome} icon={<User className="h-4 w-4" />}>
                                <input
                                    ref={firstInputRef}
                                    type="text"
                                    value={form.nome}
                                    onChange={(e) => set("nome", e.target.value)}
                                    className={`glass-input pl-10 ${errors.nome ? "border-red-500/40" : ""}`}
                                    disabled={isPending}
                                />
                            </EField>

                            {/* DDD + Telefone */}
                            <div className="flex gap-3">
                                <div className="w-28 flex-shrink-0">
                                    <label className="block text-xs font-semibold text-slate-400 uppercase tracking-wider mb-1.5">DDD</label>
                                    <select
                                        value={form.ddd}
                                        onChange={(e) => set("ddd", e.target.value)}
                                        className="glass-input"
                                        disabled={isPending}
                                    >
                                        {DDD_OPTIONS.map((d) => <option key={d} value={d}>{d}</option>)}
                                    </select>
                                </div>
                                <EField label="Telefone / WhatsApp" error={errors.telefone} icon={<Phone className="h-4 w-4" />} className="flex-1">
                                    <input
                                        type="tel"
                                        value={form.telefone}
                                        onChange={(e) => set("telefone", e.target.value)}
                                        className={`glass-input pl-10 ${errors.telefone ? "border-red-500/40" : ""}`}
                                        disabled={isPending}
                                    />
                                </EField>
                            </div>

                            {/* Cidade */}
                            <EField label="Cidade" error={errors.cidade} icon={<MapPin className="h-4 w-4" />}>
                                <input
                                    type="text"
                                    value={form.cidade}
                                    onChange={(e) => set("cidade", e.target.value)}
                                    className={`glass-input pl-10 ${errors.cidade ? "border-red-500/40" : ""}`}
                                    disabled={isPending}
                                />
                            </EField>

                            {/* Interesse */}
                            <EField label="Interesse" error={errors.interesse} icon={<Home className="h-4 w-4" />}>
                                <select
                                    value={form.interesse}
                                    onChange={(e) => set("interesse", e.target.value)}
                                    className={`glass-input pl-10 ${errors.interesse ? "border-red-500/40" : ""}`}
                                    disabled={isPending}
                                >
                                    <option value="">Selecione…</option>
                                    {INTERESSE_OPTIONS.map((opt) => <option key={opt} value={opt}>{opt}</option>)}
                                </select>
                            </EField>

                            {/* WhatsApp quick-link */}
                            <a
                                href={`https://wa.me/55${form.ddd}${form.telefone.replace(/\D/g, "")}`}
                                target="_blank"
                                rel="noopener noreferrer"
                                className="flex items-center gap-2 text-xs text-emerald-400 hover:text-emerald-300 transition-colors"
                            >
                                <ExternalLink className="h-3.5 w-3.5" />
                                Abrir WhatsApp
                            </a>

                            {/* Actions row */}
                            <div className="flex gap-3 pt-2">
                                {/* Archive */}
                                <button
                                    type="button"
                                    onClick={handleArchive}
                                    disabled={isPending}
                                    className={`btn-ghost border flex-shrink-0 transition-all ${archiveConfirm
                                        ? "border-amber-500/40 text-amber-400 hover:bg-amber-500/10"
                                        : "border-white/[0.08]"
                                        }`}
                                >
                                    <Archive className="h-4 w-4" />
                                    {archiveConfirm ? "Confirmar?" : "Arquivar"}
                                </button>

                                <button
                                    type="button"
                                    onClick={close}
                                    className="btn-ghost"
                                    disabled={isPending}
                                >
                                    Cancelar
                                </button>

                                <button
                                    type="submit"
                                    disabled={isPending}
                                    className="btn-brand flex-1 justify-center disabled:opacity-60 disabled:cursor-not-allowed disabled:transform-none"
                                    id="btn-edit-lead-submit"
                                >
                                    {isPending ? (
                                        <><Loader2 className="h-4 w-4 animate-spin" />Salvando…</>
                                    ) : (
                                        "Salvar"
                                    )}
                                </button>
                            </div>
                        </form>
                    </div>
                </div>
            </div>
        </>
    );
}

// -----------------------------------------------------------------------
// Field wrapper
// -----------------------------------------------------------------------
function EField({
    label, error, icon, children, className = "",
}: {
    label: string; error?: string; icon: React.ReactNode;
    children: React.ReactNode; className?: string;
}) {
    return (
        <div className={`space-y-1.5 ${className}`}>
            <label className="block text-xs font-semibold text-slate-400 uppercase tracking-wider">
                {label}
            </label>
            <div className="relative">
                <span className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 text-slate-500">{icon}</span>
                {children}
            </div>
            {error && <p className="text-xs text-red-400">{error}</p>}
        </div>
    );
}
