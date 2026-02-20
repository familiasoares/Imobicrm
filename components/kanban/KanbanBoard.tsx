"use client";

import React, { useEffect, useState, useTransition } from "react";
import { Kanban, GripVertical, User2, ChevronDown, Sparkles } from "lucide-react";
import { updateLeadStatus } from "@/app/actions/lead.actions";
import { useModal, type LeadForModal } from "@/components/providers/ModalProvider";

// -----------------------------------------------------------------------
// Tipagem e Cores Padronizadas (Foco em Cyan e Tons Profissionais)
// -----------------------------------------------------------------------
type LeadStatus =
    | "NOVO_LEAD" | "EM_ATENDIMENTO" | "VISITA"
    | "AGENDAMENTO" | "PROPOSTA" | "VENDA_FECHADA" | "VENDA_PERDIDA";

type Lead = {
    id: string;
    nome: string;
    telefone: string;
    ddd: string;
    cidade: string;
    interesse: string;
    status: LeadStatus;
    isArquivado: boolean;
    updatedAt: Date;
};

// Paleta focada no seu branding: Majoritariamente Preto e Cyan
const COLUMNS: { id: LeadStatus; label: string; color: string }[] = [
    { id: "NOVO_LEAD", label: "Novo Lead", color: "#06b6d4" }, // Cyan
    { id: "EM_ATENDIMENTO", label: "Atendimento", color: "#22d3ee" }, // Cyan Light
    { id: "VISITA", label: "Visita", color: "#0891b2" }, // Cyan Dark
    { id: "AGENDAMENTO", label: "Agendamento", color: "#3b82f6" }, // Blue
    { id: "PROPOSTA", label: "Proposta", color: "#8b5cf6" }, // Purple
    { id: "VENDA_FECHADA", label: "Venda Fechada", color: "#10b981" }, // Green
    { id: "VENDA_PERDIDA", label: "Venda Perdida", color: "#ef4444" }, // Red
];

const DEFAULT_VISIBLE: LeadStatus[] = ["NOVO_LEAD", "EM_ATENDIMENTO", "VISITA", "AGENDAMENTO", "PROPOSTA"];

// -----------------------------------------------------------------------
// Lead Card - Toque Amigável e Visual Cyan
// -----------------------------------------------------------------------
function LeadCard({ lead, onDragStart, onEdit }: { lead: Lead; onDragStart: (e: React.DragEvent, leadId: string) => void; onEdit: (lead: Lead) => void }) {
    return (
        <div
            draggable
            onDragStart={(e) => onDragStart(e, lead.id)}
            onClick={() => onEdit(lead)}
            className="rounded-xl border border-white/[0.06] bg-white/[0.02] p-3 cursor-pointer transition-all hover:border-cyan-500/50 hover:bg-white/[0.04] group shadow-lg"
        >
            <div className="flex items-start gap-2">
                <GripVertical className="h-4 w-4 text-slate-600 mt-0.5 group-hover:text-cyan-400 transition-colors" />
                <div className="flex-1 min-w-0">
                    <p className="text-sm font-bold text-slate-100 truncate">{lead.nome}</p>
                    <p className="text-[11px] text-cyan-500/80 font-medium">{lead.telefone}</p>
                </div>
            </div>
            <div className="flex flex-wrap gap-1 mt-3 pl-6">
                <span className="rounded bg-cyan-500/10 px-1.5 py-0.5 text-[9px] font-bold text-cyan-400 uppercase tracking-tight border border-cyan-500/20">
                    {lead.interesse}
                </span>
            </div>
            <div className="mt-2 pl-6 flex justify-between items-center text-[9px] text-slate-500">
                <span>{lead.cidade}</span>
                <span>{new Date(lead.updatedAt).toLocaleDateString("pt-BR")}</span>
            </div>
        </div>
    );
}

// -----------------------------------------------------------------------
// Column - Largura Fixa no Mobile para permitir Scroll
// -----------------------------------------------------------------------
function KanbanColumn({ colDef, leads, onDragStart, onDrop, onDragOver, dragOverColumn, onEdit }: any) {
    const isTarget = dragOverColumn === colDef.id;

    return (
        <div
            className="flex flex-col w-[280px] md:w-[300px] shrink-0 snap-center"
            onDragOver={(e) => onDragOver(e, colDef.id)}
            onDrop={(e) => onDrop(e, colDef.id)}
        >
            <div
                className="flex items-center justify-between p-3 rounded-t-xl border-t border-x border-white/[0.06] bg-[#0d0d0d]"
                style={{ borderTopColor: isTarget ? '#06b6d4' : `${colDef.color}44` }}
            >
                <div className="flex items-center gap-2">
                    <div className="h-2 w-2 rounded-full" style={{ background: colDef.color, boxShadow: `0 0 8px ${colDef.color}` }} />
                    <span className="text-xs font-bold text-slate-200 uppercase tracking-wider">{colDef.label}</span>
                </div>
                <span className="text-[10px] font-bold text-slate-500 bg-white/5 px-2 py-0.5 rounded-full">{leads.length}</span>
            </div>

            <div
                className={`flex-1 space-y-3 p-3 border border-white/[0.06] bg-[#070707]/50 min-h-[150px] transition-all
                ${isTarget ? "bg-cyan-500/5 border-cyan-500/30" : ""}`}
            >
                {leads.map((lead: any) => (
                    <LeadCard key={lead.id} lead={lead} onDragStart={onDragStart} onEdit={onEdit} />
                ))}
                {leads.length === 0 && (
                    <div className="h-20 flex items-center justify-center border border-dashed border-white/5 rounded-xl text-[10px] text-slate-700">
                        Solte aqui
                    </div>
                )}
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
    const { openEdit } = useModal();

    useEffect(() => { setLeads(initialLeads); }, [initialLeads]);

    const visibleColumns = showFinal ? COLUMNS : COLUMNS.filter(c => DEFAULT_VISIBLE.includes(c.id) || leads.some(l => l.status === c.id));

    const handleDragStart = (e: React.DragEvent, leadId: string) => { e.dataTransfer.effectAllowed = "move"; setDragId(leadId); };
    const handleDragOver = (e: React.DragEvent, status: LeadStatus) => { e.preventDefault(); setDragOverCol(status); };

    const handleDrop = (e: React.DragEvent, newStatus: LeadStatus) => {
        e.preventDefault();
        setDragOverCol(null);
        if (!dragId) return;
        const lead = leads.find(l => l.id === dragId);
        if (!lead || lead.status === newStatus) return;

        setLeads((prev: any[]) => prev.map(l => l.id === dragId ? { ...l, status: newStatus, updatedAt: new Date() } : l));

        startTransition(async () => {
            try { await updateLeadStatus(dragId, newStatus); }
            catch (err) { setLeads(initialLeads); }
        });
    };

    const handleEdit = (lead: any) => { openEdit(lead); };

    return (
        <div className="flex flex-col h-[calc(100vh-140px)]">
            {/* Header do Kanban */}
            <div className="flex items-center justify-between mb-6">
                <div>
                    <h1 className="text-xl font-black text-white flex items-center gap-2">
                        <Sparkles className="h-5 w-5 text-cyan-400" />
                        FUNIL DE VENDAS
                    </h1>
                    <p className="text-[11px] text-slate-500 font-medium uppercase tracking-widest">
                        {leads.length} Leads Ativos {isPending && "• Salvando..."}
                    </p>
                </div>
                <button
                    onClick={() => setShowFinal(!showFinal)}
                    className="text-[10px] font-bold text-cyan-400 border border-cyan-500/30 px-3 py-1.5 rounded-lg bg-cyan-500/5 hover:bg-cyan-500/10 transition-all uppercase tracking-tighter"
                >
                    {showFinal ? "Ocultar Finalizados" : "Ver Funil Completo"}
                </button>
            </div>

            {/* AREA DO QUADRO - O segredo da rolagem está aqui */}
            <div className="flex-1 overflow-x-auto overflow-y-hidden scrollbar-thin scrollbar-thumb-white/10 pb-4">
                <div className="flex gap-4 h-full min-w-max px-1">
                    {visibleColumns.map((col) => (
                        <KanbanColumn
                            key={col.id}
                            colDef={col}
                            leads={leads.filter((l: any) => l.status === col.id)}
                            onDragStart={handleDragStart}
                            onDrop={handleDrop}
                            onDragOver={handleDragOver}
                            dragOverColumn={dragOverCol}
                            onEdit={handleEdit}
                        />
                    ))}
                </div>
            </div>
        </div>
    );
}