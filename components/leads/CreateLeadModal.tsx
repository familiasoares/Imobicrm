"use client";

import React, { useEffect, useRef, useState, useTransition } from "react";
import { X, User, Phone, MapPin, Home, Loader2 } from "lucide-react";
import { useRouter } from "next/navigation";
import { useModal } from "@/components/providers/ModalProvider";
import { useToast } from "@/components/ui/Toast";
import { createLead } from "@/app/actions/lead.actions";

// -----------------------------------------------------------------------
// Field definitions
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

type FormData = {
    nome: string;
    ddd: string;
    telefone: string;
    cidade: string;
    interesse: string;
};

type FormErrors = Partial<Record<keyof FormData, string>>;

const EMPTY: FormData = {
    nome: "", ddd: "11", telefone: "", cidade: "", interesse: "",
};

// -----------------------------------------------------------------------
// Validation
// -----------------------------------------------------------------------
function validate(data: FormData): FormErrors {
    const errors: FormErrors = {};
    if (!data.nome.trim()) errors.nome = "Nome é obrigatório";
    if (!data.telefone.trim()) errors.telefone = "Telefone é obrigatório";
    if (!data.cidade.trim()) errors.cidade = "Cidade é obrigatória";
    if (!data.interesse) errors.interesse = "Selecione um interesse";
    if (data.telefone && !/^[\d\s\-().]+$/.test(data.telefone))
        errors.telefone = "Formato inválido (apenas números, traços e parênteses)";
    return errors;
}

// -----------------------------------------------------------------------
// Modal
// -----------------------------------------------------------------------
export function CreateLeadModal() {
    const { modal, close } = useModal();
    const { toast } = useToast();
    const router = useRouter();
    const [form, setForm] = useState<FormData>(EMPTY);
    const [errors, setErrors] = useState<FormErrors>({});
    const [isPending, startTransition] = useTransition();
    const firstInputRef = useRef<HTMLInputElement>(null);
    const isOpen = modal.type === "create";

    // Focus trap & keyboard close
    useEffect(() => {
        if (!isOpen) { setForm(EMPTY); setErrors({}); return; }
        setTimeout(() => firstInputRef.current?.focus(), 60);
        const onKey = (e: KeyboardEvent) => { if (e.key === "Escape") close(); };
        window.addEventListener("keydown", onKey);
        return () => window.removeEventListener("keydown", onKey);
    }, [isOpen, close]);

    if (!isOpen) return null;

    const set = (field: keyof FormData, value: string) => {
        setForm((f) => ({ ...f, [field]: value }));
        if (errors[field]) setErrors((e) => ({ ...e, [field]: undefined }));
    };

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        const errs = validate(form);
        if (Object.keys(errs).length) { setErrors(errs); return; }

        startTransition(async () => {
            try {
                // 1. Persiste no banco + invalida cache do Next.js (revalidatePath)
                await createLead({
                    nome: form.nome.trim(),
                    ddd: form.ddd,
                    telefone: form.telefone.trim(),
                    cidade: form.cidade.trim(),
                    interesse: form.interesse,
                });

                // 2. Fecha modal e exibe toast
                close();
                toast("Lead criado com sucesso! 🎉", "success");

                // 3. Força o Server Component do Kanban e da Lista a re-buscar do banco.
                //    Isso passa novos `initialLeads` ao KanbanBoard, que o useEffect
                //    recebe e aplica ao estado local — sem F5 necessário.
                router.refresh();
            } catch (err) {
                console.error(err);
                toast("Erro ao criar lead. Tente novamente.", "error");
            }
        });
    };

    return (
        <>
            {/* Backdrop */}
            <div
                className="fixed inset-0 z-40 bg-black/60 backdrop-blur-sm"
                onClick={close}
                aria-hidden="true"
            />

            {/* Modal panel */}
            <div
                role="dialog"
                aria-modal="true"
                aria-labelledby="create-lead-title"
                className="fixed inset-0 z-50 flex items-center justify-center p-4"
            >
                <div
                    className="relative w-full max-w-md rounded-2xl p-6 sm:p-7 animate-fade-in"
                    style={{
                        background: "rgba(9,15,36,0.95)",
                        border: "1px solid rgba(255,255,255,0.07)",
                        backdropFilter: "blur(24px)",
                        WebkitBackdropFilter: "blur(24px)",
                        boxShadow: "0 0 60px rgba(99,102,241,0.12), 0 32px 64px rgba(0,0,0,0.6)",
                    }}
                >
                    {/* Header */}
                    <div className="flex items-center justify-between mb-6">
                        <div>
                            <h2
                                id="create-lead-title"
                                className="text-lg font-bold text-white"
                            >
                                Novo Lead
                            </h2>
                            <p className="text-xs text-slate-500 mt-0.5">
                                Preencha os dados do potencial cliente
                            </p>
                        </div>
                        <button
                            onClick={close}
                            className="btn-ghost p-1.5"
                            aria-label="Fechar"
                        >
                            <X className="h-4 w-4" />
                        </button>
                    </div>

                    {/* Form */}
                    <form onSubmit={handleSubmit} noValidate className="space-y-4">

                        {/* Nome */}
                        <Field
                            label="Nome Completo"
                            error={errors.nome}
                            icon={<User className="h-4 w-4" />}
                        >
                            <input
                                ref={firstInputRef}
                                type="text"
                                placeholder="Ex.: João Silva"
                                value={form.nome}
                                onChange={(e) => set("nome", e.target.value)}
                                className={`glass-input pl-10 ${errors.nome ? "border-red-500/40" : ""}`}
                                disabled={isPending}
                            />
                        </Field>

                        {/* DDD + Telefone (row) */}
                        <div className="flex gap-3">
                            <div className="w-28 flex-shrink-0">
                                <label className="block text-xs font-semibold text-slate-400 uppercase tracking-wider mb-1.5">
                                    DDD
                                </label>
                                <select
                                    value={form.ddd}
                                    onChange={(e) => set("ddd", e.target.value)}
                                    className="glass-input"
                                    disabled={isPending}
                                >
                                    {DDD_OPTIONS.map((d) => (
                                        <option key={d} value={d}>{d}</option>
                                    ))}
                                </select>
                            </div>
                            <Field
                                label="Telefone / WhatsApp"
                                error={errors.telefone}
                                icon={<Phone className="h-4 w-4" />}
                                className="flex-1"
                            >
                                <input
                                    type="tel"
                                    placeholder="9 9999-9999"
                                    value={form.telefone}
                                    onChange={(e) => set("telefone", e.target.value)}
                                    className={`glass-input pl-10 ${errors.telefone ? "border-red-500/40" : ""}`}
                                    disabled={isPending}
                                />
                            </Field>
                        </div>

                        {/* Cidade */}
                        <Field
                            label="Cidade"
                            error={errors.cidade}
                            icon={<MapPin className="h-4 w-4" />}
                        >
                            <input
                                type="text"
                                placeholder="Ex.: São Paulo"
                                value={form.cidade}
                                onChange={(e) => set("cidade", e.target.value)}
                                className={`glass-input pl-10 ${errors.cidade ? "border-red-500/40" : ""}`}
                                disabled={isPending}
                            />
                        </Field>

                        {/* Interesse */}
                        <Field
                            label="Interesse"
                            error={errors.interesse}
                            icon={<Home className="h-4 w-4" />}
                        >
                            <select
                                value={form.interesse}
                                onChange={(e) => set("interesse", e.target.value)}
                                className={`glass-input pl-10 ${errors.interesse ? "border-red-500/40" : ""}`}
                                disabled={isPending}
                            >
                                <option value="">Selecione…</option>
                                {INTERESSE_OPTIONS.map((opt) => (
                                    <option key={opt} value={opt}>{opt}</option>
                                ))}
                            </select>
                        </Field>

                        {/* Actions */}
                        <div className="flex gap-3 pt-2">
                            <button
                                type="button"
                                onClick={close}
                                className="btn-ghost flex-1 justify-center"
                                disabled={isPending}
                            >
                                Cancelar
                            </button>
                            <button
                                type="submit"
                                disabled={isPending}
                                className="btn-brand flex-1 justify-center disabled:opacity-60 disabled:cursor-not-allowed disabled:transform-none"
                                id="btn-create-lead-submit"
                            >
                                {isPending ? (
                                    <><Loader2 className="h-4 w-4 animate-spin" />Salvando…</>
                                ) : (
                                    "Criar Lead"
                                )}
                            </button>
                        </div>
                    </form>
                </div>
            </div>
        </>
    );
}

// -----------------------------------------------------------------------
// Field wrapper (label + icon + error)
// -----------------------------------------------------------------------
function Field({
    label,
    error,
    icon,
    children,
    className = "",
}: {
    label: string;
    error?: string;
    icon: React.ReactNode;
    children: React.ReactNode;
    className?: string;
}) {
    return (
        <div className={`space-y-1.5 ${className}`}>
            <label className="block text-xs font-semibold text-slate-400 uppercase tracking-wider">
                {label}
            </label>
            <div className="relative">
                <span className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 text-slate-500">
                    {icon}
                </span>
                {children}
            </div>
            {error && (
                <p className="text-xs text-red-400">{error}</p>
            )}
        </div>
    );
}
