"use client";

import React, { useCallback, useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { Search, SlidersHorizontal, Printer } from "lucide-react";
import type { Lead } from "@/lib/mock-leads";
import { leadsToCSV, downloadCSV } from "@/lib/mock-leads";
import { LeadTable } from "@/components/leads/LeadTable";
import { FilterDrawer, FilterValues } from "@/components/leads/FilterDrawer";
import { MassActionToolbar } from "@/components/leads/MassActionToolbar";
import { useModal } from "@/components/providers/ModalProvider";
import { archiveLead } from "@/app/actions/lead.actions";

const EMPTY_FILTERS: FilterValues = {
    ddd: "", cidade: "", interesse: "", dataInicio: "", dataFim: "",
};

interface LeadsClientProps {
    /** Leads from the DB, mapped to the Lead shape by the Server Component */
    initialLeads: Lead[];
}

export function LeadsClient({ initialLeads }: LeadsClientProps) {
    const router = useRouter();
    const { openCreate } = useModal();

    const [leads, setLeads] = useState<Lead[]>(initialLeads);
    const [search, setSearch] = useState("");
    const [filters, setFilters] = useState<FilterValues>(EMPTY_FILTERS);
    const [drawerOpen, setDrawerOpen] = useState(false);
    const [selected, setSelected] = useState<Set<string>>(new Set());

    // ── Sync with server data ──────────────────────────────────────────
    // When router.refresh() re-renders the Server Component with fresh DB
    // data, this effect re-syncs local state exactly like KanbanBoard does.
    useEffect(() => {
        setLeads(initialLeads);
        setSelected(new Set()); // clear selection on refresh
    }, [initialLeads]);

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
    const handleArchive = async () => {
        // Archive all selected leads via server action (multi-tenant safe)
        await Promise.all([...selected].map((id) => archiveLead(id)));
        setSelected(new Set());
        router.refresh(); // re-fetch DB data → triggers useEffect sync
    };

    const handleExportCSV = () => {
        const toExport = leads.filter((l) => selected.has(l.id));
        downloadCSV(leadsToCSV(toExport), `leads-${new Date().toISOString().slice(0, 10)}.csv`);
    };

    const handlePrint = () => window.print();

    return (
        <>
            <div className="space-y-5 max-w-7xl mx-auto animate-fade-in" id="print-area">

                {/* ---- Page header ---- */}
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 print:hidden">
                    <div>
                        <h1 className="text-xl font-bold text-white flex items-center gap-2">
                            Lista de Leads
                        </h1>
                        <p className="text-sm text-slate-400 mt-0.5">
                            {leads.length} leads ativos no total
                        </p>
                    </div>
                    <div className="flex items-center gap-3 self-start sm:self-auto">
                        <button
                            onClick={() => openCreate()}
                            className="btn-brand"
                            id="btn-novo-lead-lista"
                        >
                            + Novo Lead
                        </button>
                        <button onClick={handlePrint} className="btn-ghost border border-white/[0.08]">
                            <Printer className="h-4 w-4" />
                            Imprimir
                        </button>
                    </div>
                </div>

                {/* ---- Print-only header ---- */}
                <div className="hidden print:block mb-4">
                    <h1 className="text-2xl font-bold text-black">Lista de Leads</h1>
                    <p className="text-sm text-gray-500">
                        Gerado em {new Date().toLocaleDateString("pt-BR")}
                    </p>
                    <hr className="my-3 border-gray-300" />
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
                        Filtros Avançados
                        {activeFilterCount > 0 && (
                            <span className="absolute -top-1.5 -right-1.5 flex h-4 w-4 items-center justify-center rounded-full bg-indigo-500 text-[10px] font-bold text-white">
                                {activeFilterCount}
                            </span>
                        )}
                    </button>
                </div>

                {/* ---- Active filter tags ---- */}
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
                mode="active"
                onClearSelection={() => setSelected(new Set())}
                onArchive={handleArchive}
                onExportCSV={handleExportCSV}
            />
        </>
    );
}
