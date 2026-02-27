"use client";

import React, { useEffect, useState, useTransition, useRef } from "react";
import { GripVertical, Sparkles, Plus, Clock } from "lucide-react";
import { updateLeadStatus } from "@/app/actions/lead.actions";
import { useModal } from "@/components/providers/ModalProvider";

// -----------------------------------------------------------------------
// Tipagens e Configurações
// -----------------------------------------------------------------------
type LeadStatus = "NOVO_LEAD" | "EM_ATENDIMENTO" | "VISITA" | "AGENDAMENTO" | "PROPOSTA" | "VENDA_FECHADA" | "VENDA_PERDIDA";

const COLUMNS: { id: LeadStatus; label: string; color: string }[] = [
    { id: "NOVO_LEAD", label: "Novo Lead", color: "#06b6d4" },       // Cyan Brilhante
    { id: "EM_ATENDIMENTO", label: "Atendimento", color: "#22d3ee" },// Cyan Claro
    { id: "VISITA", label: "Visita", color: "#0891b2" },             // Cyan Escuro
    { id: "AGENDAMENTO", label: "Agendamento", color: "#3b82f6" },   // Azul
    { id: "PROPOSTA", label: "Proposta", color: "#8b5cf6" },         // Roxo
    { id: "VENDA_FECHADA", label: "Venda Fechada", color: "#10b981" },// Verde
    { id: "VENDA_PERDIDA", label: "Venda Perdida", color: "#ef4444" },// Vermelho
];

const DEFAULT_VISIBLE: LeadStatus[] = ["NOVO_LEAD", "EM_ATENDIMENTO", "VISITA", "AGENDAMENTO", "PROPOSTA"];

// -----------------------------------------------------------------------
// Componente de Card Individual
// -----------------------------------------------------------------------
function LeadCard({ lead, onDragStart, onEdit }: any) {
    return (
        <div
            draggable
            onDragStart={(e) => onDragStart(e, lead.id)}
            onClick={() => onEdit(lead)} // 👈 Clique global no card abre o modal
            className="relative rounded-xl border border-white/[0.08] bg-[#0a0a0a] p-4 cursor-pointer active:cursor-grabbing hover:border-cyan-500/50 hover:bg-[#0d0d0d] hover:shadow-[0_0_20px_rgba(6,182,212,0.15)] group transition-all"
        >
            <div className="flex items-start gap-3 select-none">
                <div className="mt-1 cursor-grab active:cursor-grabbing">
                    <GripVertical className="h-4 w-4 text-slate-600 group-hover:text-cyan-400 transition-colors" />
                </div>
                <div className="flex-1 min-w-0">
                    <p className="text-sm font-bold text-slate-100 truncate group-hover:text-cyan-400 transition-colors">
                        {lead.nome}
                    </p>
                    <p className="text-xs text-slate-500 font-medium mt-0.5">
                        {lead.telefone}
                    </p>
                </div>
            </div>

            <div className="mt-4 pl-7 flex justify-between items-center">
                <span className="rounded bg-cyan-500/10 px-2 py-1 text-[9px] font-bold text-cyan-400 uppercase border border-cyan-500/20 tracking-wider">
                    {lead.interesse}
                </span>

                {/* Mostrador de tempo desde a última atualização */}
                <span className="flex items-center gap-1 text-[10px] text-slate-500 font-medium group-hover:text-cyan-500/80 transition-colors">
                    <Clock className="h-3 w-3" />
                    Abrir
                </span>
            </div>
        </div>
    );
}

// -----------------------------------------------------------------------
// Componente Principal do Kanban
// -----------------------------------------------------------------------
export function KanbanBoard({ initialLeads }: { initialLeads: any[] }) {
    const [leads, setLeads] = useState(initialLeads);
    const [dragId, setDragId] = useState<string | null>(null);
    const [dragOverCol, setDragOverCol] = useState<LeadStatus | null>(null);
    const [isPending, startTransition] = useTransition();
    const [showFinal, setShowFinal] = useState(false);

    const { openEdit, openCreate } = useModal();
    const scrollRef = useRef<HTMLDivElement>(null);

    // Sincroniza estado se os props mudarem (ex: ao salvar o Modal)
    useEffect(() => { setLeads(initialLeads); }, [initialLeads]);

    // Scroll Horizontal com o Mouse (Wheel)
    useEffect(() => {
        const el = scrollRef.current;
        if (!el) return;
        const onWheel = (e: WheelEvent) => {
            if (e.deltaY === 0) return;
            e.preventDefault();
            el.scrollLeft += e.deltaY;
        };
        el.addEventListener("wheel", onWheel, { passive: false });
        return () => el.removeEventListener("wheel", onWheel);
    }, []);

    const handleDragStart = (e: React.DragEvent, leadId: string) => {
        setDragId(leadId);
        e.dataTransfer.effectAllowed = "move";
        e.dataTransfer.setData("text/plain", leadId);
    };

    const handleDrop = (e: React.DragEvent, newStatus: LeadStatus) => {
        e.preventDefault();
        const id = dragId || e.dataTransfer.getData("text/plain");
        setDragOverCol(null);
        setDragId(null);

        if (!id) return;
        const lead = leads.find(l => l.id === id);
        if (!lead || lead.status === newStatus) return;

        // Atualização Otimista na UI
        setLeads((prev) => prev.map(l => l.id === id ? { ...l, status: newStatus, updatedAt: new Date() } : l));

        // Salva no Banco de Dados
        startTransition(async () => {
            try {
                await updateLeadStatus(id, newStatus);
            }
            catch {
                setLeads(initialLeads); // Reverte se der erro
            }
        });
    };

    const visibleColumns = showFinal
        ? COLUMNS
        : COLUMNS.filter(c => DEFAULT_VISIBLE.includes(c.id) || leads.some(l => l.status === c.id));

    return (
        <div className="flex flex-col h-[calc(100vh-140px)] animate-fade-in">
            {/* Header do Funil */}
            <div className="flex items-center justify-between mb-6 flex-wrap gap-4">
                <h1 className="text-xl font-black text-white flex items-center gap-2 tracking-tight">
                    <Sparkles className="h-5 w-5 text-cyan-400" /> MEU FUNIL
                </h1>

                <div className="flex items-center gap-3">
                    <button
                        onClick={() => setShowFinal(!showFinal)}
                        className="text-[10px] font-bold text-cyan-400 border border-cyan-500/30 px-4 py-2 rounded-lg bg-cyan-500/5 uppercase tracking-widest hover:bg-cyan-500/10 hover:border-cyan-500/50 transition-colors"
                    >
                        {showFinal ? "Focar em Vendas Ativas" : "Mostrar Funil Completo"}
                    </button>

                    <button
                        onClick={openCreate}
                        className="flex items-center gap-1.5 text-xs font-bold text-black bg-cyan-400 px-5 py-2.5 rounded-lg shadow-[0_0_15px_rgba(6,182,212,0.4)] hover:bg-cyan-300 hover:shadow-[0_0_20px_rgba(6,182,212,0.6)] uppercase tracking-wide transition-all active:scale-95"
                    >
                        <Plus className="h-4 w-4" />
                        Novo Lead
                    </button>
                </div>
            </div>

            {/* Quadro Kanban (Colunas) */}
            <div
                ref={scrollRef}
                className="flex-1 overflow-x-auto pb-4 scrollbar-thin scrollbar-thumb-white/10 scrollbar-track-transparent"
            >
                <div className="flex gap-5 h-full min-w-max px-1">
                    {visibleColumns.map((col) => (
                        <div
                            key={col.id}
                            className="flex flex-col w-[300px] shrink-0"
                            onDragOver={(e) => { e.preventDefault(); setDragOverCol(col.id); }}
                            onDragLeave={() => setDragOverCol(null)}
                            onDrop={(e) => handleDrop(e, col.id)}
                        >
                            {/* Cabeçalho da Coluna */}
                            <div
                                className="flex items-center justify-between p-3 border-t-[3px] bg-[#0d0d0d] rounded-t-xl"
                                style={{ borderTopColor: col.color }}
                            >
                                <span className="text-[11px] font-black text-slate-200 uppercase tracking-widest">
                                    {col.label}
                                </span>
                                <span className="flex items-center justify-center bg-white/5 px-2 py-0.5 rounded text-[10px] font-bold text-slate-400 border border-white/10">
                                    {leads.filter(l => l.status === col.id).length}
                                </span>
                            </div>

                            {/* Corpo da Coluna */}
                            <div
                                className={`flex-1 space-y-3 p-3 border-x border-b border-white/[0.04] bg-[#050505] rounded-b-xl transition-all duration-200 overflow-y-auto scrollbar-none
                                    ${dragOverCol === col.id ? "bg-cyan-500/5 border-cyan-500/30 shadow-[inset_0_0_20px_rgba(6,182,212,0.05)]" : ""}`
                                }
                            >
                                {leads.filter(l => l.status === col.id).map((lead) => (
                                    <LeadCard
                                        key={lead.id}
                                        lead={lead}
                                        onDragStart={handleDragStart}
                                        onEdit={openEdit}
                                    />
                                ))}

                                {/* Placeholder quando a coluna está vazia */}
                                {leads.filter(l => l.status === col.id).length === 0 && (
                                    <div className="h-24 rounded-xl border border-dashed border-white/10 flex items-center justify-center text-[10px] font-medium text-slate-600 uppercase tracking-widest">
                                        Soltar Lead Aqui
                                    </div>
                                )}
                            </div>
                        </div>
                    ))}
                </div>
            </div>
        </div>
    );
}