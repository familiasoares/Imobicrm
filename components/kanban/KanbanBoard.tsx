"use client";

import React, { useEffect, useState, useTransition, useRef } from "react";
import { GripVertical, Sparkles, Plus, Clock, ArrowRightLeft } from "lucide-react";
import { updateLeadStatus } from "@/app/actions/lead.actions";
import { useModal } from "@/components/providers/ModalProvider";

type LeadStatus = "NOVO_LEAD" | "EM_ATENDIMENTO" | "VISITA" | "AGENDAMENTO" | "PROPOSTA" | "VENDA_FECHADA" | "VENDA_PERDIDA";

const COLUMNS: { id: LeadStatus; label: string; color: string }[] = [
    { id: "NOVO_LEAD", label: "Novo Lead", color: "#06b6d4" },
    { id: "EM_ATENDIMENTO", label: "Atendimento", color: "#22d3ee" },
    { id: "VISITA", label: "Visita", color: "#0891b2" },
    { id: "AGENDAMENTO", label: "Agendamento", color: "#3b82f6" },
    { id: "PROPOSTA", label: "Proposta", color: "#8b5cf6" },
    { id: "VENDA_FECHADA", label: "Venda Fechada", color: "#10b981" },
    { id: "VENDA_PERDIDA", label: "Venda Perdida", color: "#ef4444" },
];

const DEFAULT_VISIBLE: LeadStatus[] = ["NOVO_LEAD", "EM_ATENDIMENTO", "VISITA", "AGENDAMENTO", "PROPOSTA"];

function LeadCard({ lead, onDragStart, onEdit, onStatusChange }: any) {
    return (
        <div
            draggable
            onDragStart={(e) => onDragStart(e, lead.id)}
            onClick={() => onEdit(lead)}
            className="relative rounded-xl border border-white/[0.08] bg-[#0a0a0a] p-4 cursor-pointer active:cursor-grabbing hover:border-cyan-500/50 hover:bg-[#0d0d0d] hover:shadow-[0_0_20px_rgba(6,182,212,0.15)] group transition-all"
        >
            <div className="flex items-start gap-3 select-none">
                {/* Grip visível apenas no PC para indicar arraste */}
                <div className="mt-1 cursor-grab active:cursor-grabbing hidden sm:block">
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

            <div className="mt-4 pl-0 sm:pl-7 flex justify-between items-center">
                <span className="rounded bg-cyan-500/10 px-2 py-1 text-[9px] font-bold text-cyan-400 uppercase border border-cyan-500/20 tracking-wider">
                    {lead.interesse}
                </span>

                <span className="flex items-center gap-1 text-[10px] text-slate-500 font-medium group-hover:text-cyan-500/80 transition-colors">
                    <Clock className="h-3 w-3" />
                    Abrir
                </span>
            </div>

            {/* 🚀 SELETOR DE STATUS SEMPRE VISÍVEL (Melhora mobile e agiliza PC) */}
            <div
                className="mt-4 pt-3 border-t border-white/[0.06]"
                onClick={(e) => e.stopPropagation()} // Blinda o clique para não abrir o modal
            >
                <div className="relative group/select">
                    <div className="absolute left-3 top-1/2 -translate-y-1/2 flex items-center gap-2 pointer-events-none">
                        <ArrowRightLeft className="h-3.5 w-3.5 text-cyan-500/60" />
                        <span className="text-[9px] font-bold text-slate-500 uppercase tracking-tighter">Etapa:</span>
                    </div>
                    <select
                        value={lead.status}
                        onChange={(e) => onStatusChange(lead.id, e.target.value)}
                        className="w-full bg-[#050505] text-[10px] font-black text-slate-300 border border-white/10 rounded-lg pl-16 pr-8 py-2.5 outline-none focus:border-cyan-500/50 appearance-none cursor-pointer hover:bg-white/[0.02] transition-colors"
                        style={{
                            backgroundImage: `url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' fill='none' viewBox='0 0 24 24' stroke='%23475569'%3E%3Cpath stroke-linecap='round' stroke-linejoin='round' stroke-width='2' d='M19 9l-7 7-7-7'%3E%3C/path%3E%3C/svg%3E")`,
                            backgroundPosition: `right 0.6rem center`,
                            backgroundRepeat: `no-repeat`,
                            backgroundSize: `0.9em 0.9em`
                        }}
                    >
                        {COLUMNS.map(c => (
                            <option key={c.id} value={c.id} className="bg-[#0a0a0a] text-sm">
                                {c.label}
                            </option>
                        ))}
                    </select>
                </div>
            </div>
        </div>
    );
}

export function KanbanBoard({ initialLeads }: { initialLeads: any[] }) {
    const [leads, setLeads] = useState(initialLeads);
    const [dragId, setDragId] = useState<string | null>(null);
    const [dragOverCol, setDragOverCol] = useState<LeadStatus | null>(null);
    const [isPending, startTransition] = useTransition();
    const [showFinal, setShowFinal] = useState(false);

    const { openEdit, openCreate } = useModal();
    const scrollRef = useRef<HTMLDivElement>(null);

    useEffect(() => { setLeads(initialLeads); }, [initialLeads]);

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
        executeStatusChange(id, newStatus);
    };

    const executeStatusChange = (leadId: string, newStatus: LeadStatus) => {
        if (!leadId) return;
        const lead = leads.find(l => l.id === leadId);
        if (!lead || lead.status === newStatus) return;

        setLeads((prev) => prev.map(l => l.id === leadId ? { ...l, status: newStatus, updatedAt: new Date() } : l));

        startTransition(async () => {
            try { await updateLeadStatus(leadId, newStatus); }
            catch { setLeads(initialLeads); }
        });
    };

    const visibleColumns = showFinal
        ? COLUMNS
        : COLUMNS.filter(c => DEFAULT_VISIBLE.includes(c.id) || leads.some(l => l.status === c.id));

    return (
        <div className="flex flex-col h-[calc(100vh-140px)] animate-fade-in">
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
                                        onStatusChange={executeStatusChange}
                                    />
                                ))}

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