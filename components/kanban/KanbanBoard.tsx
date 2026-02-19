"use client";

import React, { useEffect, useState, useTransition } from "react";
import { Kanban, GripVertical, User2, ChevronDown } from "lucide-react";
import { updateLeadStatus } from "@/app/actions/lead.actions";
import { useModal, type LeadForModal } from "@/components/providers/ModalProvider";

// -----------------------------------------------------------------------
// Local types — mirrors Prisma Lead shape without importing @prisma/client
// (avoids IDE resolution issues before first prisma generate in the session)
// -----------------------------------------------------------------------
type LeadStatus =
    | "NOVO_LEAD" | "EM_ATENDIMENTO" | "VISITA"
    | "AGENDAMENTO" | "PROPOSTA" | "VENDA_FECHADA" | "VENDA_PERDIDA";

type Lead = {
    id: string;
    tenantId: string;
    userId: string | null;
    nome: string;
    telefone: string;
    ddd: string;
    cidade: string;
    interesse: string;
    status: LeadStatus;
    isArquivado: boolean;
    criadoEm: Date;
    updatedAt: Date;
};
type LeadWithCorretor = Lead & {
    corretor?: { id: string; nome: string; email: string } | null;
};

// -----------------------------------------------------------------------
// Kanban column definitions — order matches the funnel
// -----------------------------------------------------------------------
const COLUMNS: { id: LeadStatus; label: string; color: string }[] = [
    { id: "NOVO_LEAD", label: "Novo Lead", color: "#6366f1" },
    { id: "EM_ATENDIMENTO", label: "Em Atendimento", color: "#3b82f6" },
    { id: "VISITA", label: "Visita", color: "#8b5cf6" },
    { id: "AGENDAMENTO", label: "Agendamento", color: "#f59e0b" },
    { id: "PROPOSTA", label: "Proposta", color: "#ec4899" },
    { id: "VENDA_FECHADA", label: "Venda Fechada", color: "#10b981" },
    { id: "VENDA_PERDIDA", label: "Venda Perdida", color: "#ef4444" },
];

const DEFAULT_VISIBLE: LeadStatus[] = [
    "NOVO_LEAD", "EM_ATENDIMENTO", "VISITA", "AGENDAMENTO", "PROPOSTA",
];

// -----------------------------------------------------------------------
// Lead Card — click to edit, drag to move
// -----------------------------------------------------------------------
function LeadCard({
    lead,
    onDragStart,
    onEdit,
}: {
    lead: Lead;
    onDragStart: (e: React.DragEvent, leadId: string) => void;
    onEdit: (lead: Lead) => void;
}) {
    return (
        <div
            draggable
            onDragStart={(e) => onDragStart(e, lead.id)}
            onClick={() => onEdit(lead)}
            className="rounded-xl border cursor-pointer select-none transition-all hover:-translate-y-0.5 hover:shadow-lg group"
            style={{
                background: "rgba(15,23,42,0.7)",
                borderColor: "rgba(255,255,255,0.07)",
                backdropFilter: "blur(8px)",
                boxShadow: "0 2px 12px rgba(0,0,0,0.3)",
            }}
            title="Clique para editar · Arraste para mover"
        >
            <div className="px-3 py-3 space-y-2">
                {/* Drag handle + name */}
                <div className="flex items-start gap-2">
                    <GripVertical className="h-4 w-4 text-slate-600 flex-shrink-0 mt-0.5 group-hover:text-slate-400 transition-colors" />
                    <div className="flex-1 min-w-0">
                        <p className="text-sm font-semibold text-slate-200 truncate">{lead.nome}</p>
                        <p className="text-[11px] text-slate-500 truncate">{lead.telefone}</p>
                    </div>
                </div>
                {/* Metadata pills */}
                <div className="flex flex-wrap gap-1.5 pl-6">
                    <span className="rounded-md bg-white/[0.04] px-1.5 py-0.5 text-[10px] text-slate-400">{lead.cidade}</span>
                    <span className="rounded-md bg-white/[0.04] px-1.5 py-0.5 text-[10px] text-slate-400">{lead.interesse}</span>
                </div>
                <p className="pl-6 text-[10px] text-slate-600">
                    {new Date(lead.updatedAt).toLocaleDateString("pt-BR")}
                </p>
            </div>
        </div>
    );
}

// -----------------------------------------------------------------------
// Column
// -----------------------------------------------------------------------
function KanbanColumn({
    colDef, leads, onDragStart, onDrop, onDragOver, dragOverColumn, onEdit,
}: {
    colDef: (typeof COLUMNS)[0];
    leads: Lead[];
    onDragStart: (e: React.DragEvent, leadId: string) => void;
    onDrop: (e: React.DragEvent, status: LeadStatus) => void;
    onDragOver: (e: React.DragEvent, status: LeadStatus) => void;
    dragOverColumn: LeadStatus | null;
    onEdit: (lead: Lead) => void;
}) {
    const isTarget = dragOverColumn === colDef.id;

    return (
        <div
            className="flex flex-col min-w-[220px] w-[220px] flex-shrink-0"
            onDragOver={(e) => onDragOver(e, colDef.id)}
            onDrop={(e) => onDrop(e, colDef.id)}
        >
            {/* Column header */}
            <div
                className="flex items-center justify-between rounded-xl px-3 py-2.5 mb-3"
                style={{
                    background: `linear-gradient(135deg, ${colDef.color}22 0%, ${colDef.color}11 100%)`,
                    border: `1px solid ${colDef.color}33`,
                }}
            >
                <div className="flex items-center gap-2">
                    <span className="h-2.5 w-2.5 rounded-full flex-shrink-0"
                        style={{ background: colDef.color, boxShadow: `0 0 6px ${colDef.color}` }} />
                    <p className="text-xs font-semibold text-slate-200">{colDef.label}</p>
                </div>
                <span className="rounded-full px-1.5 py-0.5 text-[10px] font-bold"
                    style={{ background: `${colDef.color}33`, color: colDef.color }}>
                    {leads.length}
                </span>
            </div>

            {/* Drop zone */}
            <div
                className="flex-1 space-y-2 rounded-xl p-2 min-h-[120px] transition-all duration-150"
                style={{
                    background: isTarget ? `${colDef.color}12` : "rgba(255,255,255,0.01)",
                    border: isTarget ? `1px dashed ${colDef.color}66` : "1px dashed transparent",
                }}
            >
                {leads.length === 0 ? (
                    <div className="flex h-20 items-center justify-center">
                        <p className="text-[11px] text-slate-700">Solte aqui</p>
                    </div>
                ) : (
                    leads.map((lead) => (
                        <LeadCard key={lead.id} lead={lead} onDragStart={onDragStart} onEdit={onEdit} />
                    ))
                )}
            </div>
        </div>
    );
}

// -----------------------------------------------------------------------
// KanbanBoard — main Client Component
// -----------------------------------------------------------------------
export function KanbanBoard({ initialLeads }: { initialLeads: LeadWithCorretor[] }) {
    const [leads, setLeads] = useState<LeadWithCorretor[]>(initialLeads);
    const [dragId, setDragId] = useState<string | null>(null);
    const [dragOverCol, setDragOverCol] = useState<LeadStatus | null>(null);
    const [isPending, startTransition] = useTransition();
    const [showFinal, setShowFinal] = useState(false);
    const { openEdit } = useModal();

    // ── KEY FIX ──────────────────────────────────────────────────────────
    // useState(initialLeads) only reads the prop on first mount.
    // When router.refresh() in the modal triggers the Server Component to
    // re-fetch from the DB, React passes updated initialLeads down here.
    // This useEffect detects that change and re-syncs the local state,
    // causing the board to reflect the new lead without a full page reload.
    useEffect(() => {
        setLeads(initialLeads);
    }, [initialLeads]);
    // ─────────────────────────────────────────────────────────────────────

    const visibleColumns = showFinal
        ? COLUMNS
        : COLUMNS.filter(
            (c) => DEFAULT_VISIBLE.includes(c.id) || leads.some((l) => l.status === c.id)
        );

    // ---- Drag handlers ----
    const handleDragStart = (e: React.DragEvent, leadId: string) => {
        setDragId(leadId);
        e.dataTransfer.effectAllowed = "move";
    };
    const handleDragOver = (e: React.DragEvent, status: LeadStatus) => {
        e.preventDefault();
        e.dataTransfer.dropEffect = "move";
        setDragOverCol(status);
    };
    const handleDrop = (e: React.DragEvent, newStatus: LeadStatus) => {
        e.preventDefault();
        setDragOverCol(null);
        if (!dragId) return;
        const lead = leads.find((l) => l.id === dragId);
        if (!lead || lead.status === newStatus) { setDragId(null); return; }

        // Optimistic update
        setLeads((prev) => prev.map((l) =>
            l.id === dragId ? { ...l, status: newStatus, updatedAt: new Date() } : l
        ));
        setDragId(null);

        startTransition(async () => {
            try {
                await updateLeadStatus(dragId, newStatus);
            } catch (err) {
                console.error("Falha ao actualizar status:", err);
                // Rollback
                setLeads((prev) => prev.map((l) =>
                    l.id === dragId ? { ...l, status: lead.status, updatedAt: lead.updatedAt } : l
                ));
            }
        });
    };

    // ---- Edit handler — opens EditLeadModal ----
    const handleEdit = (lead: Lead) => {
        const forModal: LeadForModal = {
            id: lead.id,
            nome: lead.nome,
            telefone: lead.telefone,
            ddd: lead.ddd,
            cidade: lead.cidade,
            interesse: lead.interesse,
            status: lead.status,
            isArquivado: lead.isArquivado,
        };
        openEdit(forModal);
    };

    const totalLeads = leads.length;
    const closedLeads = leads.filter((l) => l.status === "VENDA_FECHADA").length;

    return (
        <div className="flex flex-col h-full animate-fade-in">

            {/* ---- Page header ---- */}
            <div className="flex items-center justify-between mb-5 flex-wrap gap-3">
                <div>
                    <h1 className="text-xl font-bold text-white flex items-center gap-2">
                        <Kanban className="h-5 w-5 text-indigo-400" />
                        Kanban — Funil de Vendas
                    </h1>
                    <p className="text-sm text-slate-400 mt-0.5">
                        {totalLeads} leads · {closedLeads} vendas fechadas
                        {isPending && (
                            <span className="ml-2 text-indigo-400 text-xs animate-pulse">Salvando…</span>
                        )}
                    </p>
                </div>
                <button onClick={() => setShowFinal((v) => !v)} className="btn-ghost border border-white/[0.08] text-xs">
                    <ChevronDown className={`h-4 w-4 transition-transform ${showFinal ? "rotate-180" : ""}`} />
                    {showFinal ? "Ocultar" : "Mostrar"} Venda Fechada / Perdida
                </button>
            </div>

            {/* ---- Empty state ---- */}
            {leads.length === 0 && (
                <div className="glass-card flex flex-col items-center justify-center py-20 text-center">
                    <User2 className="h-10 w-10 text-slate-700 mb-3" />
                    <p className="font-semibold text-slate-400">Nenhum lead encontrado</p>
                    <p className="text-sm text-slate-600 mt-1">
                        Clique em <strong>"Novo Lead"</strong> na barra superior para criar o primeiro.
                    </p>
                </div>
            )}

            {/* ---- Board — horizontal scroll ---- */}
            {leads.length > 0 && (
                <div className="flex gap-4 overflow-x-auto pb-4 flex-1">
                    {visibleColumns.map((col) => (
                        <KanbanColumn
                            key={col.id}
                            colDef={col}
                            leads={leads.filter((l) => l.status === col.id)}
                            onDragStart={handleDragStart}
                            onDrop={handleDrop}
                            onDragOver={handleDragOver}
                            dragOverColumn={dragOverCol}
                            onEdit={handleEdit}
                        />
                    ))}
                </div>
            )}
        </div>
    );
}
