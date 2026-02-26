"use client";

import React, { useState, useCallback, useEffect, useTransition } from "react";
import { Search, SlidersHorizontal, Printer, Archive, Loader2 } from "lucide-react";
import { getArchivedLeads, reactivateLead, deleteLeadForever } from "@/app/actions/lead.actions";
import { LeadTable } from "@/components/leads/LeadTable";
import { FilterDrawer, FilterValues } from "@/components/leads/FilterDrawer";
import { MassActionToolbar } from "@/components/leads/MassActionToolbar";
import { DeleteConfirmModal } from "@/components/leads/DeleteConfirmModal";

const EMPTY_FILTERS: FilterValues = {
    ddd: "", cidade: "", interesse: "", dataInicio: "", dataFim: "",
};

export default function ArquivadosPage() {
    const [leads, setLeads] = useState<any[]>([]);
    const [search, setSearch] = useState("");
    const [filters, setFilters] = useState<FilterValues>(EMPTY_FILTERS);
    const [drawerOpen, setDrawerOpen] = useState(false);
    const [selected, setSelected] = useState<Set<string>>(new Set());
    const [showDeleteModal, setShowDeleteModal] = useState(false);
    const [isLoading, setIsLoading] = useState(true);
    const [isPending, startTransition] = useTransition();

    // 1. Busca os Leads Arquivados reais do banco de dados ao carregar a página
    useEffect(() => {
        getArchivedLeads().then((data) => {
            setLeads(data);
            setIsLoading(false);
        }).catch(() => {
            setIsLoading(false);
        });
    }, []);

    const activeFilterCount = Object.values(filters).filter(Boolean).length;

    // ---- Selection handlers ----
    const toggleSelect = useCallback((id: string) => {
        setSelected((prev) => {
            const next = new Set(prev);
            next.has(id) ? next.delete(id) : next.add(id);
            return next;
        });
    }, []);

    const toggleAll = useCallback((pageIds: string[]) => {
        setSelected((prev) => {
            const allSelected = pageIds.every((id) => prev.has(id));
            const next = new Set(prev);
            if (allSelected) pageIds.forEach((id) => next.delete(id));
            else pageIds.forEach((id) => next.add(id));
            return next;
        });
    }, []);

    // ---- Mass actions (Conectadas ao Banco de Dados) ----
    const handleReactivate = () => {
        startTransition(async () => {
            const idsToReactivate = Array.from(selected);

            // Atualização Otimista: remove da tela na hora para dar fluidez
            setLeads((prev) => prev.filter((l) => !selected.has(l.id)));
            setSelected(new Set());

            // Processa no banco de dados em segundo plano
            await Promise.all(idsToReactivate.map(id => reactivateLead(id)));
        });
    };

    const handleDeleteForever = () => {
        startTransition(async () => {
            const idsToDelete = Array.from(selected);

            // Atualização Otimista
            setLeads((prev) => prev.filter((l) => !selected.has(l.id)));
            setSelected(new Set());
            setShowDeleteModal(false);

            // Processa exclusão permanente no banco
            await Promise.all(idsToDelete.map(id => deleteLeadForever(id)));
        });
    };

    const handlePrint = () => window.print();

    return (
        <>
            <div className="space-y-5 max-w-7xl mx-auto animate-fade-in" id="print-area">
                {/* ---- Page header ---- */}
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 print:hidden">
                    <div>
                        <h1 className="text-xl font-bold text-white flex items-center gap-2">
                            <Archive className="h-5 w-5 text-cyan-500" />
                            Leads Arquivados
                        </h1>
                        <p className="text-sm text-slate-400 mt-0.5">
                            {isLoading ? "Buscando dados..." : `${leads.length} leads arquivados — use "Reativar" para trazê-los de volta ao funil`}
                        </p>
                    </div>
                    <button
                        onClick={handlePrint}
                        className="btn-ghost border border-white/[0.08] self-start sm:self-auto text-cyan-400 hover:bg-cyan-500/10"
                    >
                        <Printer className="h-4 w-4" />
                        Imprimir Lista
                    </button>
                </div>

                {/* ---- Warning banner ---- */}
                <div
                    className="rounded-xl px-4 py-3 flex items-center gap-3 print:hidden"
                    style={{ background: "rgba(239, 68, 68, 0.07)", border: "1px solid rgba(239, 68, 68, 0.15)" }}
                >
                    <Archive className="h-4 w-4 text-red-400 flex-shrink-0" />
                    <p className="text-xs text-red-300/80">
                        Leads arquivados não aparecem no funil de vendas nem no Dashboard.
                        A exclusão definitiva remove todos os dados associados permanentemente.
                    </p>
                </div>

                {/* ---- Search + filter bar ---- */}
                <div className="flex gap-3 print:hidden">
                    <div className="relative flex-1">
                        <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-500 pointer-events-none" />
                        <input
                            type="search"
                            placeholder="Pesquisar por nome ou telefone…"
                            value={search}
                            onChange={(e) => setSearch(e.target.value)}
                            className="glass-input pl-10"
                        />
                    </div>
                    <button
                        onClick={() => setDrawerOpen(true)}
                        className={`btn-ghost border whitespace-nowrap relative ${activeFilterCount > 0 ? "border-cyan-500/40 text-cyan-400" : "border-white/[0.08]"}`}
                    >
                        <SlidersHorizontal className="h-4 w-4" />
                        Filtros
                        {activeFilterCount > 0 && (
                            <span className="absolute -top-1.5 -right-1.5 flex h-4 w-4 items-center justify-center rounded-full bg-cyan-500 text-[10px] font-bold text-black">
                                {activeFilterCount}
                            </span>
                        )}
                    </button>
                </div>

                {/* ---- Loader / Table ---- */}
                {isLoading ? (
                    <div className="flex flex-col items-center justify-center py-20">
                        <Loader2 className="h-8 w-8 text-cyan-500 animate-spin mb-4" />
                        <p className="text-slate-400 text-sm font-medium">Carregando arquivo...</p>
                    </div>
                ) : (
                    <LeadTable
                        leads={leads}
                        selectedIds={selected}
                        onToggleSelect={toggleSelect}
                        onToggleAll={toggleAll}
                        searchQuery={search}
                        filters={filters}
                        showStatus={true}
                    />
                )}
            </div>

            {/* ---- Filter Drawer ---- */}
            <FilterDrawer
                isOpen={drawerOpen}
                onClose={() => setDrawerOpen(false)}
                filters={filters}
                onChange={setFilters}
                onClear={() => setFilters(EMPTY_FILTERS)}
                leads={leads} // <--- MÁGICA ADICIONADA AQUI!
            />

            {/* ---- Mass Action Toolbar ---- */}
            <MassActionToolbar
                selectedCount={selected.size}
                mode="archived"
                onClearSelection={() => setSelected(new Set())}
                onReactivate={handleReactivate}
                onDeleteForever={() => setShowDeleteModal(true)}
            />

            {/* ---- Delete Confirmation Modal ---- */}
            <DeleteConfirmModal
                isOpen={showDeleteModal}
                count={selected.size}
                onConfirm={handleDeleteForever}
                onCancel={() => setShowDeleteModal(false)}
            />
        </>
    );
}