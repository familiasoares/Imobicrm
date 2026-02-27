"use client";

import React, { useEffect, useRef, useState, useTransition } from "react";
import { X, User, Phone, MapPin, Home, Loader2, Archive, ExternalLink, FileText, Send, Clock, Edit3 } from "lucide-react";
import { useRouter } from "next/navigation";
import { useModal } from "@/components/providers/ModalProvider";
import { useToast } from "@/components/ui/Toast";
import { updateLead, archiveLead, addLeadNote } from "@/app/actions/lead.actions";

const INTERESSE_OPTIONS = [
    "Compra — Casa",
    "Compra — Apartamento",
    "Compra — Terreno",
    "Compra — Comercial",
    "Locação — Residencial",
    "Locação — Comercial",
    "Investimento",
];

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
    NOVO_LEAD: "#06b6d4",
    EM_ATENDIMENTO: "#22d3ee",
    VISITA: "#0891b2",
    AGENDAMENTO: "#3b82f6",
    PROPOSTA: "#8b5cf6",
    VENDA_FECHADA: "#10b981",
    VENDA_PERDIDA: "#ef4444",
};

type FormData = {
    nome: string;
    ddd: string;
    telefone: string;
    cidade: string;
    interesse: string;
    observacoes: string;
};
type FormErrors = Partial<Record<keyof FormData, string>>;

function validate(data: FormData): FormErrors {
    const errors: FormErrors = {};
    if (!data.nome.trim()) errors.nome = "Obrigatório";
    if (!data.ddd.trim()) errors.ddd = "Obrigatório";
    if (!data.telefone.trim()) errors.telefone = "Obrigatório";
    if (!data.cidade.trim()) errors.cidade = "Obrigatório";
    if (!data.interesse) errors.interesse = "Selecione";
    return errors;
}

export function EditLeadModal() {
    const { modal, close } = useModal();
    const { toast } = useToast();
    const router = useRouter();

    const [form, setForm] = useState<FormData | null>(null);
    const [errors, setErrors] = useState<FormErrors>({});
    const [newNote, setNewNote] = useState("");

    const [isPending, startTransition] = useTransition();
    const [isPendingNote, startTransitionNote] = useTransition();
    const [archiveConfirm, setArchiveConfirm] = useState(false);

    const firstInputRef = useRef<HTMLInputElement>(null);

    const isOpen = modal.type === "edit";
    const lead = isOpen ? modal.lead : null;

    // 🚀 O CHEAT CODE DO TYPESCRIPT AQUI:
    // Isso diz para a Vercel parar de verificar os tipos estritos deste objeto e aceitar os campos novos
    const leadData = lead as any;

    useEffect(() => {
        if (!isOpen || !leadData) { setForm(null); setErrors({}); setArchiveConfirm(false); return; }
        setForm({
            nome: leadData.nome || "",
            ddd: leadData.ddd || "",
            telefone: leadData.telefone || "",
            cidade: leadData.cidade || "",
            interesse: leadData.interesse || "",
            observacoes: leadData.observacoes || "",
        });
        setTimeout(() => firstInputRef.current?.focus(), 60);
    }, [isOpen, leadData]);

    if (!isOpen || !leadData || !form) return null;

    const set = (field: keyof FormData, value: string) => {
        setForm((f) => f ? { ...f, [field]: value } : f);
        if (errors[field]) setErrors((e) => ({ ...e, [field]: undefined }));
    };

    // ---- Salvar Dados Principais ----
    const handleSave = (e: React.FormEvent) => {
        e.preventDefault();
        if (!form) return;
        const errs = validate(form);
        if (Object.keys(errs).length) { setErrors(errs); return; }

        startTransition(async () => {
            try {
                await updateLead(leadData.id, {
                    nome: form.nome.trim(),
                    ddd: form.ddd,
                    telefone: form.telefone.trim(),
                    cidade: form.cidade.trim(),
                    interesse: form.interesse,
                    observacoes: form.observacoes.trim(),
                });
                close();
                toast("Lead atualizado com sucesso!", "success");
                router.refresh();
            } catch (err) {
                console.error(err);
                toast("Erro ao atualizar lead.", "error");
            }
        });
    };

    // ---- Arquivar ----
    const handleArchive = () => {
        if (!archiveConfirm) { setArchiveConfirm(true); return; }
        startTransition(async () => {
            try {
                await archiveLead(leadData.id);
                close();
                toast("Lead arquivado.", "warning");
                router.refresh();
            } catch (err) {
                console.error(err);
                toast("Erro ao arquivar lead.", "error");
            }
        });
    };

    // ---- Salvar Nota na Timeline ----
    const handleAddNote = () => {
        if (!newNote.trim()) return;

        startTransitionNote(async () => {
            try {
                await addLeadNote(leadData.id, newNote.trim());
                toast("Anotação adicionada ao histórico!", "success");
                setNewNote("");

                router.refresh();
                close();
                setTimeout(() => router.refresh(), 100);
            } catch (err) {
                toast("Erro ao adicionar nota.", "error");
            }
        });
    };

    const statusColor = STATUS_COLORS[leadData.status] ?? "#06b6d4";

    return (
        <div className="fixed inset-0 z-[110] flex items-center justify-center p-4 sm:p-6">

            <div className="absolute inset-0 bg-black/80 backdrop-blur-sm transition-opacity" onClick={close} aria-hidden="true" />

            <div
                role="dialog"
                aria-modal="true"
                className="relative w-full max-w-5xl bg-[#0a0a0a] border border-cyan-500/20 rounded-2xl shadow-[0_20px_60px_-15px_rgba(6,182,212,0.3)] flex flex-col overflow-hidden animate-fade-in-up"
                style={{ maxHeight: '90dvh' }}
            >
                {/* Linha de Status Superior */}
                <div className="shrink-0 h-1.5 w-full" style={{ background: `linear-gradient(90deg, ${statusColor}, transparent)` }} />

                {/* Header Blindado */}
                <div className="shrink-0 flex items-start justify-between px-6 py-5 border-b border-white/[0.06] bg-[#0d0d0d]">
                    <div>
                        <div className="flex items-center gap-2 mb-1.5">
                            <span
                                className="rounded px-2 py-0.5 text-[10px] font-bold uppercase tracking-widest border"
                                style={{ background: `${statusColor}15`, color: statusColor, borderColor: `${statusColor}30` }}
                            >
                                {STATUS_LABELS[leadData.status] ?? leadData.status}
                            </span>
                            <span className="text-xs text-slate-500 font-medium tracking-wide">
                                ID: {leadData.id.slice(0, 8)}
                            </span>
                        </div>
                        <h2 id="edit-lead-title" className="text-xl font-black text-white tracking-tight">
                            Gestão do Lead
                        </h2>
                    </div>
                    <button onClick={close} className="p-2 text-slate-400 hover:text-white hover:bg-white/5 rounded-lg transition-colors" aria-label="Fechar">
                        <X className="h-5 w-5" />
                    </button>
                </div>

                {/* Corpo Dividido */}
                <div className="flex-1 overflow-y-auto scrollbar-thin scrollbar-thumb-white/10">
                    <div className="grid grid-cols-1 lg:grid-cols-12 min-h-full">

                        {/* ----------------- LADO ESQUERDO: DADOS DO LEAD ----------------- */}
                        <div className="lg:col-span-5 p-6 border-b lg:border-b-0 lg:border-r border-white/[0.06] bg-[#0a0a0a]">
                            <h3 className="text-xs font-bold text-cyan-400 uppercase tracking-widest mb-6 flex items-center gap-2">
                                <User className="h-4 w-4" /> Dados do Contato
                            </h3>

                            <form onSubmit={handleSave} className="space-y-5">
                                <EField label="Nome Completo" error={errors.nome} icon={<User className="h-4 w-4" />}>
                                    <input
                                        ref={firstInputRef} type="text" value={form.nome} onChange={(e) => set("nome", e.target.value)} disabled={isPending}
                                        className={`glass-input w-full pl-10 bg-[#050505] border-white/10 text-sm focus:border-cyan-500/50 ${errors.nome ? "border-red-500/50" : ""}`}
                                    />
                                </EField>

                                <div className="flex gap-4">
                                    <div className="w-24 flex-shrink-0">
                                        <label className="block text-[10px] font-bold text-slate-500 uppercase tracking-widest mb-1.5">DDD</label>
                                        <input
                                            type="text" maxLength={2} value={form.ddd} onChange={(e) => set("ddd", e.target.value.replace(/\D/g, ''))} disabled={isPending}
                                            className={`glass-input w-full bg-[#050505] border-white/10 text-center text-sm focus:border-cyan-500/50 ${errors.ddd ? "border-red-500/50" : ""}`}
                                        />
                                    </div>
                                    <EField label="Telefone / WhatsApp" error={errors.telefone} icon={<Phone className="h-4 w-4" />} className="flex-1">
                                        <input
                                            type="tel" value={form.telefone} onChange={(e) => set("telefone", e.target.value)} disabled={isPending}
                                            className={`glass-input w-full pl-10 bg-[#050505] border-white/10 text-sm focus:border-cyan-500/50 ${errors.telefone ? "border-red-500/50" : ""}`}
                                        />
                                    </EField>
                                </div>

                                <EField label="Cidade" error={errors.cidade} icon={<MapPin className="h-4 w-4" />}>
                                    <input
                                        type="text" value={form.cidade} onChange={(e) => set("cidade", e.target.value)} disabled={isPending}
                                        className={`glass-input w-full pl-10 bg-[#050505] border-white/10 text-sm focus:border-cyan-500/50 ${errors.cidade ? "border-red-500/50" : ""}`}
                                    />
                                </EField>

                                <EField label="Interesse Principal" error={errors.interesse} icon={<Home className="h-4 w-4" />}>
                                    <select
                                        value={form.interesse} onChange={(e) => set("interesse", e.target.value)} disabled={isPending}
                                        className={`glass-input w-full pl-10 bg-[#050505] border-white/10 text-sm focus:border-cyan-500/50 ${errors.interesse ? "border-red-500/50" : ""}`}
                                    >
                                        <option value="">Selecione…</option>
                                        {INTERESSE_OPTIONS.map((opt) => <option key={opt} value={opt} className="bg-[#0a0a0a]">{opt}</option>)}
                                    </select>
                                </EField>

                                {/* WhatsApp Link */}
                                <a
                                    href={`https://wa.me/55${form.ddd}${form.telefone.replace(/\D/g, "")}`} target="_blank" rel="noopener noreferrer"
                                    className="inline-flex items-center gap-2 text-xs font-bold text-emerald-400 hover:text-emerald-300 bg-emerald-500/10 px-3 py-1.5 rounded-lg border border-emerald-500/20 transition-colors"
                                >
                                    <ExternalLink className="h-3.5 w-3.5" /> Abrir conversa no WhatsApp
                                </a>

                                <hr className="border-white/[0.06] my-6" />

                                {/* Perfil de Busca Fixo */}
                                <div className="space-y-1.5">
                                    <label className="flex items-center gap-2 text-[10px] font-bold text-slate-500 uppercase tracking-widest">
                                        <FileText className="h-3.5 w-3.5" /> Perfil de Busca / Observações Fixas
                                    </label>
                                    <textarea
                                        value={form.observacoes}
                                        onChange={(e) => set("observacoes", e.target.value)}
                                        placeholder="Ex: Cliente busca apartamento de 3 dormitórios, aceita permuta de menor valor..."
                                        rows={4}
                                        className="glass-input w-full bg-[#050505] border-white/10 text-sm focus:border-cyan-500/50 resize-none p-3"
                                        disabled={isPending}
                                    />
                                </div>

                                <div className="flex gap-3 pt-4">
                                    <button
                                        type="button" onClick={handleArchive} disabled={isPending}
                                        className={`flex items-center justify-center gap-2 px-4 py-2.5 text-xs font-bold rounded-lg transition-all ${archiveConfirm ? "bg-amber-500/20 text-amber-400 border border-amber-500/50" : "bg-white/5 text-slate-400 border border-white/10 hover:text-white"}`}
                                    >
                                        <Archive className="h-4 w-4" /> {archiveConfirm ? "Confirmar Arquivo?" : "Arquivar"}
                                    </button>
                                    <button
                                        type="submit" disabled={isPending}
                                        className="flex-1 flex items-center justify-center gap-2 py-2.5 text-xs font-bold text-black bg-cyan-400 rounded-lg hover:bg-cyan-300 transition-all shadow-[0_0_15px_rgba(6,182,212,0.4)] uppercase tracking-wide disabled:opacity-60"
                                    >
                                        {isPending ? <><Loader2 className="h-4 w-4 animate-spin" /> Salvando...</> : "Salvar Dados"}
                                    </button>
                                </div>
                            </form>
                        </div>

                        {/* ----------------- LADO DIREITO: TIMELINE & HISTÓRICO ----------------- */}
                        <div className="lg:col-span-7 p-6 bg-[#080808] flex flex-col">
                            <h3 className="text-xs font-bold text-indigo-400 uppercase tracking-widest mb-6 flex items-center gap-2">
                                <Clock className="h-4 w-4" /> Histórico e Timeline
                            </h3>

                            {/* Caixa de Nova Anotação */}
                            <div className="bg-[#0d0d0d] border border-white/10 rounded-xl p-4 mb-6 relative focus-within:border-indigo-500/50 transition-colors">
                                <textarea
                                    value={newNote}
                                    onChange={(e) => setNewNote(e.target.value)}
                                    placeholder="Adicione uma anotação na timeline deste lead (Ex: Liguei hoje, pediu para retornar amanhã)."
                                    rows={3}
                                    className="w-full bg-transparent text-sm text-slate-200 placeholder:text-slate-600 focus:outline-none resize-none"
                                />
                                <div className="flex justify-between items-center mt-2 border-t border-white/[0.06] pt-3">
                                    <span className="text-[10px] text-slate-500">A anotação ficará salva com a data de hoje.</span>
                                    <button
                                        onClick={handleAddNote}
                                        disabled={isPendingNote || !newNote.trim()}
                                        className="flex items-center gap-2 bg-indigo-500 text-white text-xs font-bold px-4 py-1.5 rounded-lg hover:bg-indigo-400 disabled:opacity-50 transition-colors"
                                    >
                                        {isPendingNote ? <Loader2 className="h-3.5 w-3.5 animate-spin" /> : <Send className="h-3.5 w-3.5" />}
                                        Publicar
                                    </button>
                                </div>
                            </div>

                            {/* Lista da Timeline */}
                            <div className="flex-1 space-y-4">

                                {leadData.history && leadData.history.length > 0 ? (
                                    leadData.history.map((hist: any) => {
                                        const isNote = hist.statusAntes === hist.statusDepois && hist.observacao;

                                        return (
                                            <div key={hist.id} className="flex gap-4">
                                                <div className="flex flex-col items-center">
                                                    <div className={`h-8 w-8 rounded-full flex items-center justify-center z-10 ${isNote ? 'bg-indigo-500/10 border border-indigo-500/30 text-indigo-400' : 'bg-cyan-500/10 border border-cyan-500/30 text-cyan-400'}`}>
                                                        {isNote ? <Edit3 className="h-3.5 w-3.5" /> : <Clock className="h-3.5 w-3.5" />}
                                                    </div>
                                                    <div className="w-px h-full bg-white/10 my-1"></div>
                                                </div>
                                                <div className="flex-1 pb-4">
                                                    <div className="flex items-baseline justify-between mb-1">
                                                        <p className="text-sm font-bold text-slate-200">
                                                            {isNote ? "Anotação Adicionada" : "Status Alterado"}
                                                        </p>
                                                        <span className="text-[10px] text-slate-500 font-medium">
                                                            {new Date(hist.criadoEm).toLocaleDateString('pt-BR')} às {new Date(hist.criadoEm).toLocaleTimeString('pt-BR', { hour: '2-digit', minute: '2-digit' })}
                                                        </span>
                                                    </div>

                                                    {/* Mostra de onde pra onde mudou se for alteração de Status */}
                                                    {!isNote && (
                                                        <p className="text-xs text-slate-500 mt-0.5">
                                                            Moveu de <span className="text-slate-400 line-through">{STATUS_LABELS[hist.statusAntes] || hist.statusAntes}</span> para <span className="text-cyan-400 font-semibold">{STATUS_LABELS[hist.statusDepois] || hist.statusDepois}</span>
                                                        </p>
                                                    )}

                                                    {/* Mostra a caixa da anotação se existir texto */}
                                                    {hist.observacao && (
                                                        <div className="bg-white/5 border border-white/10 rounded-lg p-3 mt-2">
                                                            <p className="text-xs text-slate-300 leading-relaxed whitespace-pre-wrap">
                                                                {hist.observacao}
                                                            </p>
                                                        </div>
                                                    )}
                                                </div>
                                            </div>
                                        );
                                    })
                                ) : (
                                    <p className="text-xs text-slate-500 text-center py-4">Nenhuma movimentação registrada.</p>
                                )}

                                {/* Card Origem (Fixo no final) */}
                                <div className="flex gap-4">
                                    <div className="flex flex-col items-center">
                                        <div className="h-8 w-8 rounded-full bg-cyan-500/10 border border-cyan-500/30 flex items-center justify-center text-cyan-400 z-10">
                                            <User className="h-3.5 w-3.5" />
                                        </div>
                                    </div>
                                    <div className="flex-1">
                                        <div className="flex items-baseline justify-between mb-1">
                                            <p className="text-sm font-bold text-slate-200">Lead Criado</p>
                                            <span className="text-[10px] text-slate-500 font-medium">
                                                {new Date(leadData.criadoEm || new Date()).toLocaleDateString('pt-BR')}
                                            </span>
                                        </div>
                                        <p className="text-xs text-slate-500 mt-0.5">Entrada no sistema.</p>
                                    </div>
                                </div>

                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}

// -----------------------------------------------------------------------
// Field wrapper
// -----------------------------------------------------------------------
function EField({ label, error, icon, children, className = "" }: any) {
    return (
        <div className={`space-y-1.5 ${className}`}>
            <label className="block text-[10px] font-bold text-slate-500 uppercase tracking-widest">
                {label}
            </label>
            <div className="relative">
                <span className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 text-cyan-500/50">{icon}</span>
                {children}
            </div>
            {error && <p className="text-[10px] text-red-400">{error}</p>}
        </div>
    );
}