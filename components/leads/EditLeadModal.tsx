"use client";

import React, { useEffect, useRef, useState, useTransition } from "react";
import {
    X, User, Phone, MapPin, Home, Loader2, Archive,
    ExternalLink, FileText, Send, Clock, Edit3,
    DollarSign, Wallet, ListChecks, Building2,
    Plus
} from "lucide-react";
import { useRouter } from "next/navigation";
import { useModal } from "@/components/providers/ModalProvider";
import { useToast } from "@/components/ui/Toast";
import { updateLead, archiveLead, addLeadNote } from "@/app/actions/lead.actions";

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
    tipoImovel: string;
    valorPretendido: string;
    perfilFinanceiro: string;
    caracteristicasDesejadas: string;
};

type FormErrors = Partial<Record<keyof FormData, string>>;

export function EditLeadModal() {
    const { modal, close } = useModal();
    const { toast } = useToast();
    const router = useRouter();

    const [form, setForm] = useState<FormData | null>(null);
    const [errors, setErrors] = useState<FormErrors>({});
    const [newNote, setNewNote] = useState("");
    const [localHistory, setLocalHistory] = useState<any[]>([]);

    const [isPending, startTransition] = useTransition();
    const [isPendingNote, startTransitionNote] = useTransition();
    const [archiveConfirm, setArchiveConfirm] = useState(false);

    const firstInputRef = useRef<HTMLInputElement>(null);
    const isOpen = modal.type === "edit";
    const lead = isOpen ? modal.lead : null;
    const leadData = lead as any;

    useEffect(() => {
        if (!isOpen || !leadData) {
            setForm(null);
            setErrors({});
            setArchiveConfirm(false);
            setLocalHistory([]);
            return;
        }

        setForm({
            nome: leadData.nome || "",
            ddd: leadData.ddd || "",
            telefone: leadData.telefone || "",
            cidade: leadData.cidade || "",
            interesse: leadData.interesse || "",
            observacoes: leadData.observacoes || "",
            tipoImovel: leadData.tipoImovel || "",
            valorPretendido: leadData.valorPretendido || "",
            perfilFinanceiro: leadData.perfilFinanceiro || "",
            caracteristicasDesejadas: leadData.caracteristicasDesejadas || "",
        });

        setLocalHistory(leadData.history || []);
        document.body.style.overflow = 'hidden';

        if (window.innerWidth > 768) {
            setTimeout(() => firstInputRef.current?.focus(), 60);
        }

        return () => { document.body.style.overflow = 'unset'; };
    }, [isOpen, leadData]);

    if (!isOpen || !leadData || !form) return null;

    const set = (field: keyof FormData, value: string) => {
        setForm((f) => f ? { ...f, [field]: value } : f);
        if (errors[field]) setErrors((e) => ({ ...e, [field]: undefined }));
    };

    const handleSave = (e: React.FormEvent) => {
        e.preventDefault();
        if (!form) return;
        startTransition(async () => {
            try {
                await updateLead(leadData.id, form);
                toast("Lead atualizado!", "success");
                router.refresh();
                setTimeout(() => close(), 400);
            } catch (err) {
                toast("Erro ao atualizar.", "error");
            }
        });
    };

    const handleArchive = () => {
        if (!archiveConfirm) { setArchiveConfirm(true); return; }
        startTransition(async () => {
            try {
                await archiveLead(leadData.id);
                router.refresh();
                setTimeout(() => close(), 400);
                toast("Lead arquivado.", "warning");
            } catch (err) {
                toast("Erro ao arquivar.", "error");
            }
        });
    };

    const handleAddNote = () => {
        if (!newNote.trim()) return;
        startTransitionNote(async () => {
            try {
                await addLeadNote(leadData.id, newNote.trim());
                const newHistoryItem = {
                    id: Date.now().toString(),
                    statusAntes: leadData.status,
                    statusDepois: leadData.status,
                    observacao: newNote.trim(),
                    criadoEm: new Date().toISOString(),
                    usuario: { nome: "Você" }
                };
                setLocalHistory((prev) => [newHistoryItem, ...prev]);
                setNewNote("");
                toast("Nota salva!", "success");
                router.refresh();
            } catch (err) {
                toast("Erro ao salvar nota.", "error");
            }
        });
    };

    const statusColor = STATUS_COLORS[leadData.status] ?? "#06b6d4";

    // 🚀 AJUSTE: Inputs agora têm fundo sólido e fonte maior (15px) para melhor leitura
    const inputClass = "w-full bg-[#121212] border border-white/10 rounded-xl pl-12 pr-4 py-3 text-[15px] text-white outline-none focus:border-cyan-400 focus:ring-4 focus:ring-cyan-400/5 transition-all placeholder:text-slate-600";

    return (
        <div className="fixed inset-0 z-[110] bg-[#0a0a0a] flex flex-col animate-fade-in overflow-hidden text-slate-200">
            <div className="shrink-0 h-1 w-full" style={{ background: statusColor }} />

            {/* Header */}
            <div className="shrink-0 flex items-center justify-between px-6 sm:px-10 py-4 border-b border-white/[0.06] bg-[#0d0d0d]">
                <div className="flex items-center gap-4">
                    <div className="h-12 w-12 rounded-full flex items-center justify-center text-lg font-bold text-white shadow-lg" style={{ backgroundColor: `${statusColor}30`, border: `1px solid ${statusColor}50` }}>
                        {form.nome.charAt(0)}
                    </div>
                    <div>
                        <h2 className="text-xl font-bold text-white tracking-tight leading-none mb-1.5">
                            {form.nome || "Lead Sem Nome"}
                        </h2>
                        <span className="text-[10px] font-bold uppercase tracking-widest px-2 py-0.5 rounded bg-white/5 text-slate-400 border border-white/10">
                            {STATUS_LABELS[leadData.status]}
                        </span>
                    </div>
                </div>
                <button onClick={close} className="p-2 text-slate-400 hover:text-white hover:bg-white/5 rounded-xl transition-all">
                    <X className="h-6 w-6" />
                </button>
            </div>

            <div className="flex-1 overflow-y-auto">
                <div className="grid grid-cols-1 lg:grid-cols-12 min-h-full">

                    <div className="lg:col-span-5 p-6 sm:p-10 border-r border-white/[0.06] bg-[#0a0a0a]">
                        <form onSubmit={handleSave} className="space-y-8 max-w-xl mx-auto">

                            <section className="space-y-5">
                                <h3 className="text-[11px] font-bold text-cyan-400 uppercase tracking-[0.2em] mb-4 opacity-90">Informações de Contato</h3>
                                <EField label="Nome do Cliente" icon={<User className="h-4 w-4" />}>
                                    <input ref={firstInputRef} type="text" value={form.nome} onChange={(e) => set("nome", e.target.value)} className={inputClass} />
                                </EField>
                                <div className="grid grid-cols-4 gap-3">
                                    <EField label="DDD" className="col-span-1">
                                        <input type="text" maxLength={2} value={form.ddd} onChange={(e) => set("ddd", e.target.value)} className="w-full bg-[#121212] border border-white/10 rounded-xl px-2 py-3 text-[15px] text-white text-center outline-none focus:border-cyan-400 transition-all" />
                                    </EField>
                                    <EField label="WhatsApp / Telefone" icon={<Phone className="h-4 w-4" />} className="col-span-3">
                                        <input type="text" value={form.telefone} onChange={(e) => set("telefone", e.target.value)} className={inputClass} />
                                    </EField>
                                </div>
                                <EField label="Cidade" icon={<MapPin className="h-4 w-4" />}>
                                    <input type="text" value={form.cidade} onChange={(e) => set("cidade", e.target.value)} className={inputClass} />
                                </EField>
                                <a href={`https://wa.me/55${form.ddd}${form.telefone.replace(/\D/g, "")}`} target="_blank" className="flex items-center justify-center gap-2 w-full py-3.5 rounded-xl bg-emerald-500/10 text-emerald-400 text-xs font-bold border border-emerald-500/20 hover:bg-emerald-500/20 transition-all shadow-sm">
                                    <ExternalLink className="h-4 w-4" /> Abrir Conversa no WhatsApp
                                </a>
                            </section>

                            <section className="space-y-5 pt-6 border-t border-white/[0.06]">
                                <h3 className="text-[11px] font-bold text-purple-400 uppercase tracking-[0.2em] mb-4 opacity-90">Perfil de Busca e Valor</h3>
                                <div className="grid grid-cols-2 gap-4">
                                    <EField label="Tipo de Imóvel" icon={<Building2 className="h-4 w-4" />}>
                                        <input type="text" value={form.tipoImovel} onChange={(e) => set("tipoImovel", e.target.value)} placeholder="Ex: Apto, Casa..." className={inputClass} />
                                    </EField>
                                    <EField label="Valor Pretendido" icon={<DollarSign className="h-4 w-4" />}>
                                        <input type="text" value={form.valorPretendido} onChange={(e) => set("valorPretendido", e.target.value)} placeholder="Ex: Até 600k" className={inputClass} />
                                    </EField>
                                </div>
                                <EField label="Perfil Financeiro" icon={<Wallet className="h-4 w-4" />}>
                                    <input type="text" value={form.perfilFinanceiro} onChange={(e) => set("perfilFinanceiro", e.target.value)} placeholder="Ex: Financiamento, À vista..." className={inputClass} />
                                </EField>
                                <EField label="Características Desejadas" icon={<ListChecks className="h-4 w-4" />}>
                                    <textarea value={form.caracteristicasDesejadas} onChange={(e) => set("caracteristicasDesejadas", e.target.value)} placeholder="Ex: 3 quartos, suíte..." rows={2} className="w-full bg-[#121212] border border-white/10 rounded-xl pl-12 pr-4 py-3 text-[15px] text-white outline-none focus:border-cyan-400 transition-all resize-none" />
                                </EField>
                            </section>

                            <div className="flex flex-col gap-3 pt-6">
                                <button type="submit" disabled={isPending} className="w-full py-4 bg-cyan-500 text-black font-bold text-xs uppercase tracking-widest rounded-xl hover:bg-cyan-400 transition-all shadow-[0_10px_30px_-10px_rgba(6,182,212,0.4)] disabled:opacity-50">
                                    {isPending ? "Salvando..." : "Atualizar Ficha do Lead"}
                                </button>
                                <button type="button" onClick={handleArchive} className={`w-full py-3 text-[10px] font-bold uppercase tracking-widest rounded-xl transition-all ${archiveConfirm ? "bg-red-500 text-white" : "text-slate-500 hover:bg-white/5"}`}>
                                    {archiveConfirm ? "Confirmar Arquivamento?" : "Arquivar Lead"}
                                </button>
                            </div>
                        </form>
                    </div>

                    {/* COLUNA DIREITA */}
                    <div className="lg:col-span-7 p-6 sm:p-10 bg-[#080808]">
                        <div className="max-w-2xl mx-auto flex flex-col h-full">
                            <h3 className="text-[11px] font-bold text-slate-400 uppercase tracking-[0.2em] mb-8 flex items-center gap-2">
                                <Clock className="h-4 w-4" /> Timeline do Atendimento
                            </h3>

                            <div className="bg-[#0d0d0d] border border-white/10 rounded-2xl p-4 mb-10 focus-within:border-indigo-500/50 transition-all shadow-xl">
                                <textarea
                                    value={newNote} onChange={(e) => setNewNote(e.target.value)}
                                    placeholder="Escreva uma nova atualização sobre este lead..."
                                    className="w-full bg-transparent border-none outline-none text-[15px] text-white placeholder:text-slate-700 resize-none min-h-[80px]"
                                />
                                <div className="flex justify-end mt-2 pt-3 border-t border-white/[0.05]">
                                    <button onClick={handleAddNote} disabled={isPendingNote || !newNote.trim()} className="flex items-center gap-2 px-6 py-2 bg-indigo-600 text-white text-[11px] font-bold uppercase tracking-widest rounded-lg hover:bg-indigo-500 disabled:opacity-30 transition-all shadow-md">
                                        {isPendingNote ? <Loader2 className="h-3 w-3 animate-spin" /> : <Send className="h-3 w-3" />} Registrar Nota
                                    </button>
                                </div>
                            </div>

                            <div className="relative space-y-10 before:absolute before:left-[19px] before:top-2 before:bottom-0 before:w-px before:bg-gradient-to-b before:from-indigo-500/30 before:to-transparent">
                                {localHistory.map((hist: any) => {
                                    const isNote = hist.statusAntes === hist.statusDepois;
                                    return (
                                        <div key={hist.id} className="relative pl-12 group">
                                            <div className={`absolute left-0 top-1 h-10 w-10 rounded-full flex items-center justify-center z-10 border shadow-md transition-all ${isNote ? "bg-indigo-500/10 border-indigo-500/30 text-indigo-400" : "bg-white/5 border-white/10 text-slate-400"}`}>
                                                {isNote ? <Edit3 className="h-4 w-4" /> : <Clock className="h-4 w-4" />}
                                            </div>
                                            <div className="flex flex-col">
                                                <div className="flex items-center justify-between mb-2.5">
                                                    <div className="flex items-center gap-2">
                                                        <span className={`text-[10px] font-bold px-2 py-0.5 rounded border uppercase tracking-tight ${hist.usuario
                                                                ? "bg-cyan-500/10 text-cyan-300 border-cyan-500/20"
                                                                : "bg-white/5 text-slate-500 border-white/10"
                                                            }`}>
                                                            {hist.usuario?.nome || "Sistema"}
                                                        </span>
                                                        <span className="text-[11px] font-semibold text-slate-400 uppercase tracking-wider">
                                                            • {isNote ? "Anotação" : "Etapa"}
                                                        </span>
                                                    </div>
                                                    <span className="text-[11px] font-medium text-slate-500">
                                                        {new Date(hist.criadoEm).toLocaleDateString('pt-BR')}
                                                    </span>
                                                </div>
                                                {hist.observacao && (
                                                    <div className={`p-4 rounded-2xl text-[14px] leading-relaxed whitespace-pre-wrap border shadow-sm ${isNote ? "bg-white/[0.04] border-white/[0.08] text-white" : "bg-transparent border-dashed border-white/10 text-slate-400"}`}>
                                                        {hist.observacao}
                                                    </div>
                                                )}
                                            </div>
                                        </div>
                                    );
                                })}
                                <div className="relative pl-12">
                                    <div className="absolute left-0 top-0 h-10 w-10 rounded-full bg-emerald-500/10 border border-emerald-500/30 flex items-center justify-center text-emerald-400 z-10 shadow-sm">
                                        <Plus className="h-4 w-4" />
                                    </div>
                                    <div className="pt-2">
                                        <span className="text-[11px] font-bold text-emerald-400 uppercase tracking-widest opacity-90">Lead Criado no Sistema</span>
                                        <p className="text-[11px] text-slate-500 font-medium mt-1">{new Date(leadData.criadoEm).toLocaleDateString()}</p>
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

// 🚀 AJUSTE: EField com rótulos mais brilhantes e melhor espaçamento
function EField({ label, icon, children, className = "" }: any) {
    return (
        <div className={`space-y-2 ${className}`}>
            <label className="block text-[11px] font-bold text-slate-300 uppercase tracking-wider ml-1 opacity-90">{label}</label>
            <div className="relative group/field">
                {icon && <span className="absolute left-4 top-1/2 -translate-y-1/2 text-cyan-400 opacity-80 group-focus-within/field:opacity-100 transition-colors z-10">{icon}</span>}
                {children}
            </div>
        </div>
    );
}