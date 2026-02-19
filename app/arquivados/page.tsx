"use client";

import React, { useState, useCallback } from "react";
import { Search, SlidersHorizontal, Printer, Archive } from "lucide-react";
import { ARCHIVED_LEADS, leadsToCSV, downloadCSV, Lead } from "@/lib/mock-leads";
import { LeadTable } from "@/components/leads/LeadTable";
import { FilterDrawer, FilterValues } from "@/components/leads/FilterDrawer";
import { MassActionToolbar } from "@/components/leads/MassActionToolbar";
import { DeleteConfirmModal } from "@/components/leads/DeleteConfirmModal";

const EMPTY_FILTERS: FilterValues = {
    ddd: "", cidade: "", interesse: "", dataInicio: "", dataFim: "",
};

export default function ArquivadosPage() {
    const [leads, setLeads] = useState<Lead[]>(ARCHIVED_LEADS);
    const [search, setSearch] = useState("");
    const [filters, setFilters] = useState<FilterValues>(EMPTY_FILTERS);
    const [drawerOpen, setDrawerOpen] = useState(false);
    const [selected, setSelected] = useState<Set<string>>(new Set());
    const [showDeleteModal, setShowDeleteModal] = useState(false);

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

    // ---- Mass actions ----
    const handleReactivate = () => {
        setLeads((prev) => prev.filter((l) => !selected.has(l.id)));
        setSelected(new Set());
    };

    const handleDeleteForever = () => {
        setLeads((prev) => prev.filter((l) => !selected.has(l.id)));
        setSelected(new Set());
        setShowDeleteModal(false);
    };

    const handlePrint = () => window.print();

    return (
        <>
            <div className="space-y-5 max-w-7xl mx-auto animate-fade-in" id="print-area">

                {/* ---- Page header ---- */}
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 print:hidden">
                    <div>
                        <h1 className="text-xl font-bold text-white flex items-center gap-2">
                            <Archive className="h-5 w-5 text-slate-400" />
                            Leads Arquivados
                        </h1>
                        <p className="text-sm text-slate-400 mt-0.5">
                            {leads.length} leads arquivados — use "Reativar" para trazê-los de volta ao funil
                        </p>
                    </div>
                    <button
                        onClick={handlePrint}
                        className="btn-ghost border border-white/[0.08] self-start sm:self-auto"
                    >
                        <Printer className="h-4 w-4" />
                        Imprimir Lista
                    </button>
                </div>

                {/* ---- Print-only header ---- */}
                <div className="hidden print:block mb-4">
                    <h1 className="text-2xl font-bold text-black">Leads Arquivados</h1>
                    <p className="text-sm text-gray-500">
                        Gerado em {new Date().toLocaleDateString("pt-BR")}
                    </p>
                    <hr className="my-3 border-gray-300" />
                </div>

                {/* ---- Warning banner ---- */}
                <div
                    className="rounded-xl px-4 py-3 flex items-center gap-3 print:hidden"
                    style={{
                        background: "rgba(239, 68, 68, 0.07)",
                        border: "1px solid rgba(239, 68, 68, 0.15)",
                    }}
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
                        className={`btn-ghost border whitespace-nowrap relative ${activeFilterCount > 0
                                ? "border-indigo-500/40 text-indigo-400"
                                : "border-white/[0.08]"
                            }`}
                    >
                        <SlidersHorizontal className="h-4 w-4" />
                        Filtros
                        {activeFilterCount > 0 && (
                            <span className="absolute -top-1.5 -right-1.5 flex h-4 w-4 items-center justify-center rounded-full bg-indigo-500 text-[10px] font-bold text-white">
                                {activeFilterCount}
                            </span>
                        )}
                    </button>
                </div>

                {/* ---- Active filters summary ---- */}
                {activeFilterCount > 0 && (
                    <div className="flex flex-wrap gap-2 print:hidden">
                        {Object.entries(filters).map(([key, val]) => {
                            if (!val) return null;
                            const labels: Record<string, string> = {
                                ddd: "DDD", cidade: "Cidade", interesse: "Interesse",
                                dataInicio: "De", dataFim: "Até",
                            };
                            return (
                                <span key={key} className="badge badge-info">
                                    {labels[key]}: {val}
                                </span>
                            );
                        })}
                    </div>
                )}

                {/* ---- Table ---- */}
                <LeadTable
                    leads={leads}
                    selectedIds={selected}
                    onToggleSelect={toggleSelect}
                    onToggleAll={toggleAll}
                    searchQuery={search}
                    filters={filters}
                    showStatus={true}
                />
            </div>

            {/* ---- Filter Drawer ---- */}
            <FilterDrawer
                isOpen={drawerOpen}
                onClose={() => setDrawerOpen(false)}
                filters={filters}
                onChange={setFilters}
                onClear={() => setFilters(EMPTY_FILTERS)}
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
