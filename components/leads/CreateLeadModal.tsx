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

type FormData = {
    nome: string;
    ddd: string;
    telefone: string;
    cidade: string;
    interesse: string;
};

type FormErrors = Partial<Record<keyof FormData, string>>;

const EMPTY: FormData = {
    nome: "", ddd: "", telefone: "", cidade: "", interesse: "",
};

// -----------------------------------------------------------------------
// Validation
// -----------------------------------------------------------------------
function validate(data: FormData): FormErrors {
    const errors: FormErrors = {};
    if (!data.nome.trim()) errors.nome = "Nome obrigatório";
    if (!data.ddd.trim()) errors.ddd = "Obrigatório";
    else if (data.ddd.length < 2) errors.ddd = "Inválido";
    if (!data.telefone.trim()) errors.telefone = "Telefone obrigatório";
    if (!data.cidade.trim()) errors.cidade = "Cidade obrigatória";
    if (!data.interesse) errors.interesse = "Selecione";

    if (data.telefone && !/^[\d\s\-().]+$/.test(data.telefone))
        errors.telefone = "Apenas números";

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
                await createLead({
                    nome: form.nome.trim(),
                    ddd: form.ddd,
                    telefone: form.telefone.trim(),
                    cidade: form.cidade.trim(),
                    interesse: form.interesse,
                });

                close();
                toast("Lead criado com sucesso! 🎉", "success");
                router.refresh();
            } catch (err) {
                console.error(err);
                toast("Erro ao criar lead. Tente novamente.", "error");
            }
        });
    };

    return (
        <div className="fixed inset-0 z-[110] flex items-center justify-center p-4">
            {/* Backdrop escurecido */}
            <div
                className="absolute inset-0 bg-black/70 backdrop-blur-sm transition-opacity"
                onClick={close}
                aria-hidden="true"
            />

            {/* Modal panel */}
            <div
                role="dialog"
                aria-modal="true"
                aria-labelledby="create-lead-title"
                className="relative w-full max-w-md bg-[#0a0a0a] border border-cyan-500/20 rounded-2xl p-6 sm:p-8 shadow-[0_20px_60px_-15px_rgba(6,182,212,0.3)] animate-fade-in-up"
            >
                {/* Header */}
                <div className="flex items-center justify-between mb-8">
                    <div>
                        <h2 id="create-lead-title" className="text-xl font-bold text-white tracking-tight">
                            Novo Lead
                        </h2>
                        <p className="text-xs text-slate-400 mt-1 uppercase tracking-widest font-semibold">
                            Preencha os dados de contato
                        </p>
                    </div>
                    <button
                        onClick={close}
                        className="p-2 text-slate-400 hover:text-white hover:bg-white/5 rounded-lg transition-colors"
                        aria-label="Fechar"
                        disabled={isPending}
                    >
                        <X className="h-5 w-5" />
                    </button>
                </div>

                {/* Form */}
                <form onSubmit={handleSubmit} noValidate className="space-y-5">

                    {/* Nome */}
                    <Field label="Nome Completo" error={errors.nome} icon={<User className="h-4 w-4" />}>
                        <input
                            ref={firstInputRef}
                            type="text"
                            placeholder="Ex.: João Silva"
                            value={form.nome}
                            onChange={(e) => set("nome", e.target.value)}
                            className={`glass-input w-full pl-10 bg-[#050505] border-white/10 text-sm focus:border-cyan-500/50 transition-colors ${errors.nome ? "border-red-500/50 focus:border-red-500/50" : ""}`}
                            disabled={isPending}
                        />
                    </Field>

                    {/* DDD + Telefone (row) */}
                    <div className="flex gap-4">
                        <div className="w-24 flex-shrink-0">
                            <label className="block text-[10px] font-bold text-slate-500 uppercase tracking-widest mb-1.5">
                                DDD
                            </label>
                            <input
                                type="text"
                                placeholder="Ex: 11"
                                maxLength={2}
                                value={form.ddd}
                                onChange={(e) => set("ddd", e.target.value.replace(/\D/g, ''))} // Só permite números
                                className={`glass-input w-full bg-[#050505] border-white/10 text-sm text-center focus:border-cyan-500/50 transition-colors ${errors.ddd ? "border-red-500/50" : ""}`}
                                disabled={isPending}
                            />
                            {errors.ddd && <p className="text-[10px] text-red-400 mt-1">{errors.ddd}</p>}
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
                                className={`glass-input w-full pl-10 bg-[#050505] border-white/10 text-sm focus:border-cyan-500/50 transition-colors ${errors.telefone ? "border-red-500/50 focus:border-red-500/50" : ""}`}
                                disabled={isPending}
                            />
                        </Field>
                    </div>

                    {/* Cidade */}
                    <Field label="Cidade" error={errors.cidade} icon={<MapPin className="h-4 w-4" />}>
                        <input
                            type="text"
                            placeholder="Ex.: São Paulo"
                            value={form.cidade}
                            onChange={(e) => set("cidade", e.target.value)}
                            className={`glass-input w-full pl-10 bg-[#050505] border-white/10 text-sm focus:border-cyan-500/50 transition-colors ${errors.cidade ? "border-red-500/50 focus:border-red-500/50" : ""}`}
                            disabled={isPending}
                        />
                    </Field>

                    {/* Interesse */}
                    <Field label="Interesse" error={errors.interesse} icon={<Home className="h-4 w-4" />}>
                        <select
                            value={form.interesse}
                            onChange={(e) => set("interesse", e.target.value)}
                            className={`glass-input w-full pl-10 bg-[#050505] border-white/10 text-sm focus:border-cyan-500/50 transition-colors ${errors.interesse ? "border-red-500/50 focus:border-red-500/50" : ""}`}
                            disabled={isPending}
                        >
                            <option value="">Selecione…</option>
                            {INTERESSE_OPTIONS.map((opt) => (
                                <option key={opt} value={opt} className="bg-[#0a0a0a]">{opt}</option>
                            ))}
                        </select>
                    </Field>

                    {/* Actions */}
                    <div className="flex gap-3 pt-4">
                        <button
                            type="button"
                            onClick={close}
                            className="w-1/3 py-2.5 text-xs font-bold text-slate-400 bg-white/5 border border-white/10 rounded-lg hover:text-white hover:bg-white/10 transition-colors uppercase tracking-wide"
                            disabled={isPending}
                        >
                            Cancelar
                        </button>
                        <button
                            type="submit"
                            disabled={isPending}
                            className="w-2/3 py-2.5 flex items-center justify-center gap-2 text-xs font-bold text-black bg-cyan-400 rounded-lg hover:bg-cyan-300 transition-all shadow-[0_0_15px_rgba(6,182,212,0.4)] uppercase tracking-wide disabled:opacity-60 disabled:cursor-not-allowed"
                        >
                            {isPending ? (
                                <><Loader2 className="h-4 w-4 animate-spin" /> Salvando...</>
                            ) : (
                                "Criar Lead"
                            )}
                        </button>
                    </div>
                </form>
            </div>
        </div>
    );
}

// -----------------------------------------------------------------------
// Field wrapper
// -----------------------------------------------------------------------
function Field({ label, error, icon, children, className = "" }: any) {
    return (
        <div className={`space-y-1.5 ${className}`}>
            <label className="block text-[10px] font-bold text-slate-500 uppercase tracking-widest">
                {label}
            </label>
            <div className="relative">
                <span className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 text-cyan-500/50">
                    {icon}
                </span>
                {children}
            </div>
            {error && <p className="text-[10px] text-red-400">{error}</p>}
        </div>
    );
}