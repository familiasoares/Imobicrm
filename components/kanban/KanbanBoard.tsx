"use client";

import React, { useEffect, useState, useTransition, useRef } from "react";
import { Kanban, GripVertical, Sparkles, Plus } from "lucide-react";
import { updateLeadStatus } from "@/app/actions/lead.actions";
import { useModal } from "@/components/providers/ModalProvider";

// ... (Tipagens e COLUMNS)
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

function LeadCard({ lead, onDragStart, onEdit }: any) {
    return (
        <div
            draggable
            onDragStart={(e) => onDragStart(e, lead.id)}
            className="rounded-xl border border-white/[0.06] bg-white/[0.02] p-3 cursor-grab active:cursor-grabbing hover:border-cyan-500/50 hover:bg-white/[0.04] group transition-colors shadow-lg"
        >
            <div className="flex items-start gap-2 select-none">
                <GripVertical className="h-4 w-4 text-slate-600 mt-0.5 group-hover:text-cyan-400" />
                <div className="flex-1 min-w-0" onClick={() => onEdit(lead)}>
                    <p className="text-sm font-bold text-slate-100 truncate">{lead.nome}</p>
                    <p className="text-[11px] text-cyan-500/80 font-medium">{lead.telefone}</p>
                </div>
            </div>
            <div className="mt-3 pl-6 flex justify-between items-center">
                <span className="rounded bg-cyan-500/10 px-1.5 py-0.5 text-[9px] font-bold text-cyan-400 uppercase border border-cyan-500/20">
                    {lead.interesse}
                </span>
                <button onClick={() => onEdit(lead)} className="text-[10px] text-slate-500 hover:text-white uppercase font-bold">
                    Ver
                </button>
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

    // Adicionamos o openCreate aqui
    const { openEdit, openCreate } = useModal();
    const scrollRef = useRef<HTMLDivElement>(null);

    useEffect(() => { setLeads(initialLeads); }, [initialLeads]);

    // Scroll Horizontal Desktop
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

        setLeads((prev) => prev.map(l => l.id === id ? { ...l, status: newStatus, updatedAt: new Date() } : l));

        startTransition(async () => {
            try { await updateLeadStatus(id, newStatus); }
            catch { setLeads(initialLeads); }
        });
    };

    const visibleColumns = showFinal ? COLUMNS : COLUMNS.filter(c => DEFAULT_VISIBLE.includes(c.id) || leads.some(l => l.status === c.id));

    return (
        <div className="flex flex-col h-[calc(100vh-140px)]">
            <div className="flex items-center justify-between mb-6 flex-wrap gap-4">
                <h1 className="text-xl font-black text-white flex items-center gap-2">
                    <Sparkles className="h-5 w-5 text-cyan-400" /> FUNIL
                </h1>

                {/* Aqui estão os botões ajustados */}
                <div className="flex items-center gap-3">
                    <button
                        onClick={() => setShowFinal(!showFinal)}
                        className="text-[10px] font-bold text-cyan-400 border border-cyan-500/30 px-3 py-2 rounded-lg bg-cyan-500/5 uppercase hover:bg-cyan-500/10 transition-colors"
                    >
                        {showFinal ? "Focar" : "Ver Tudo"}
                    </button>

                    <button
                        onClick={openCreate}
                        className="flex items-center gap-1.5 text-xs font-bold text-white bg-gradient-to-r from-cyan-500 to-blue-600 px-4 py-2 rounded-lg shadow-[0_0_15px_rgba(6,182,212,0.3)] hover:shadow-[0_0_20px_rgba(6,182,212,0.5)] transition-all active:scale-95"
                    >
                        <Plus className="h-4 w-4" />
                        Novo Lead
                    </button>
                </div>
            </div>

            <div ref={scrollRef} className="flex-1 overflow-x-auto pb-4">
                <div className="flex gap-4 h-full min-w-max">
                    {visibleColumns.map((col) => (
                        <div
                            key={col.id}
                            className="flex flex-col w-[280px] shrink-0"
                            onDragOver={(e) => { e.preventDefault(); setDragOverCol(col.id); }}
                            onDrop={(e) => handleDrop(e, col.id)}
                        >
                            <div className="flex items-center justify-between p-3 border-t-2 bg-[#0a0a0a]" style={{ borderTopColor: col.color }}>
                                <span className="text-[10px] font-black text-slate-300 uppercase">{col.label}</span>
                                <span className="text-[10px] text-slate-600">{leads.filter(l => l.status === col.id).length}</span>
                            </div>
                            <div className={`flex-1 space-y-3 p-2 border border-white/[0.04] bg-[#050505] transition-colors ${dragOverCol === col.id ? "bg-cyan-500/5 border-cyan-500/20" : ""}`}>
                                {leads.filter(l => l.status === col.id).map((lead) => (
                                    <LeadCard key={lead.id} lead={lead} onDragStart={handleDragStart} onEdit={openEdit} />
                                ))}
                            </div>
                        </div>
                    ))}
                </div>
            </div>
        </div>
    );
}