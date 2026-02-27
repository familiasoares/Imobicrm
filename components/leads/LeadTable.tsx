"use client";

import React, { useState, useMemo } from "react";
import {
    ChevronLeft,
    ChevronRight,
    ChevronUp,
    ChevronDown,
    ChevronsUpDown,
    Phone,
    MapPin,
    Calendar,
    UserCircle2,
} from "lucide-react";
import {
    Lead,
    STATUS_LABELS,
    STATUS_BADGE,
    formatDate,
} from "@/lib/mock-leads";
import type { FilterValues } from "@/components/leads/FilterDrawer";
import { useModal } from "@/components/providers/ModalProvider"; // 👈 Importamos o provedor de Modal

// -----------------------------------------------------------------------
// Types
// -----------------------------------------------------------------------
type SortField = "nome" | "cidade" | "interesse" | "updatedAt";
type SortDir = "asc" | "desc";

interface LeadTableProps {
    leads: Lead[];
    selectedIds: Set<string>;
    onToggleSelect: (id: string) => void;
    onToggleAll: (allIds: string[]) => void;
    searchQuery: string;
    filters: FilterValues;
    /** Extra last column header label e.g. "Status" */
    showStatus?: boolean;
}

const PAGE_SIZE_OPTIONS = [5, 10, 20];

// -----------------------------------------------------------------------
// Sort icon helper
// -----------------------------------------------------------------------
function SortIcon({
    field,
    current,
    dir,
}: {
    field: SortField;
    current: SortField;
    dir: SortDir;
}) {
    if (field !== current) return <ChevronsUpDown className="h-3.5 w-3.5 text-slate-600" />;
    return dir === "asc"
        ? <ChevronUp className="h-3.5 w-3.5 text-cyan-400" />
        : <ChevronDown className="h-3.5 w-3.5 text-cyan-400" />;
}

// -----------------------------------------------------------------------
// LeadTable
// -----------------------------------------------------------------------
export function LeadTable({
    leads,
    selectedIds,
    onToggleSelect,
    onToggleAll,
    searchQuery,
    filters,
    showStatus = true,
}: LeadTableProps) {
    const [sortField, setSortField] = useState<SortField>("updatedAt");
    const [sortDir, setSortDir] = useState<SortDir>("desc");
    const [page, setPage] = useState(1);
    const [pageSize, setPageSize] = useState(10);

    // 👈 Hook do Modal para podermos chamar o openEdit
    const { openEdit } = useModal();

    // ---- Filter + Search ----
    const filtered = useMemo(() => {
        const q = searchQuery.toLowerCase().trim();
        return leads.filter((l) => {
            if (q && !l.nome.toLowerCase().includes(q) && !(l.ddd + l.telefone).includes(q)) {
                return false;
            }
            if (filters.ddd && l.ddd !== filters.ddd) return false;
            if (filters.cidade && l.cidade !== filters.cidade) return false;
            if (filters.interesse && l.interesse !== filters.interesse) return false;
            if (filters.dataInicio) {
                if (new Date(l.criadoEm) < new Date(filters.dataInicio)) return false;
            }
            if (filters.dataFim) {
                if (new Date(l.criadoEm) > new Date(filters.dataFim + "T23:59:59Z")) return false;
            }
            return true;
        });
    }, [leads, searchQuery, filters]);

    // ---- Sort ----
    const sorted = useMemo(() => {
        return [...filtered].sort((a, b) => {
            let valA: string = String(a[sortField]);
            let valB: string = String(b[sortField]);
            const cmp = valA.localeCompare(valB, "pt-BR", { sensitivity: "base" });
            return sortDir === "asc" ? cmp : -cmp;
        });
    }, [filtered, sortField, sortDir]);

    // ---- Pagination ----
    const totalPages = Math.max(1, Math.ceil(sorted.length / pageSize));
    const safePage = Math.min(page, totalPages);
    const paginated = sorted.slice((safePage - 1) * pageSize, safePage * pageSize);

    const toggleSort = (field: SortField) => {
        if (sortField === field) {
            setSortDir((d) => (d === "asc" ? "desc" : "asc"));
        } else {
            setSortField(field);
            setSortDir("asc");
        }
        setPage(1);
    };

    const pageIds = paginated.map((l) => l.id);
    const allPageSelected = pageIds.length > 0 && pageIds.every((id) => selectedIds.has(id));
    const someSelected = pageIds.some((id) => selectedIds.has(id));

    const thClass =
        "px-4 py-3 text-left text-xs font-semibold uppercase tracking-wider text-slate-500 select-none";
    const thSortableClass = `${thClass} cursor-pointer hover:text-cyan-400 transition-colors`;

    return (
        <div className="space-y-3">
            {/* ---- Table ---- */}
            <div
                className="rounded-2xl overflow-hidden"
                style={{
                    background: "rgba(15, 23, 42, 0.6)",
                    border: "1px solid rgba(255,255,255,0.07)",
                    backdropFilter: "blur(16px)",
                    WebkitBackdropFilter: "blur(16px)",
                    boxShadow: "0 4px 24px rgba(0,0,0,0.35)",
                }}
            >
                <div className="overflow-x-auto">
                    <table className="w-full text-sm print:text-xs" id="leads-table">
                        <thead>
                            <tr style={{ borderBottom: "1px solid rgba(255,255,255,0.06)" }}>
                                {/* Checkbox header */}
                                <th className="px-4 py-3 w-10 print:hidden">
                                    <input
                                        type="checkbox"
                                        checked={allPageSelected}
                                        ref={(el) => {
                                            if (el) el.indeterminate = !allPageSelected && someSelected;
                                        }}
                                        onChange={() => onToggleAll(pageIds)}
                                        className="h-4 w-4 rounded border-slate-600 bg-transparent accent-cyan-500 cursor-pointer"
                                        aria-label="Selecionar todos desta página"
                                    />
                                </th>
                                {/* Sortable columns */}
                                <th
                                    className={thSortableClass}
                                    onClick={() => toggleSort("nome")}
                                >
                                    <div className="flex items-center gap-1.5">
                                        Nome
                                        <SortIcon field="nome" current={sortField} dir={sortDir} />
                                    </div>
                                </th>
                                <th className={thClass}>Telefone</th>
                                <th
                                    className={thSortableClass}
                                    onClick={() => toggleSort("cidade")}
                                >
                                    <div className="flex items-center gap-1.5">
                                        Cidade
                                        <SortIcon field="cidade" current={sortField} dir={sortDir} />
                                    </div>
                                </th>
                                <th
                                    className={thSortableClass}
                                    onClick={() => toggleSort("interesse")}
                                >
                                    <div className="flex items-center gap-1.5">
                                        Interesse
                                        <SortIcon field="interesse" current={sortField} dir={sortDir} />
                                    </div>
                                </th>
                                {showStatus && <th className={thClass}>Status</th>}
                                <th
                                    className={thSortableClass}
                                    onClick={() => toggleSort("updatedAt")}
                                >
                                    <div className="flex items-center gap-1.5">
                                        Última Atualização
                                        <SortIcon field="updatedAt" current={sortField} dir={sortDir} />
                                    </div>
                                </th>
                            </tr>
                        </thead>
                        <tbody>
                            {paginated.length === 0 ? (
                                <tr>
                                    <td
                                        colSpan={showStatus ? 7 : 6}
                                        className="px-4 py-16 text-center text-slate-500"
                                    >
                                        <div className="space-y-1">
                                            <p className="text-base font-medium text-slate-400">
                                                Nenhum lead encontrado
                                            </p>
                                            <p className="text-xs">Tente ajustar os filtros ou a busca.</p>
                                        </div>
                                    </td>
                                </tr>
                            ) : (
                                paginated.map((lead, idx) => {
                                    const isSelected = selectedIds.has(lead.id);
                                    return (
                                        <tr
                                            key={lead.id}
                                            onClick={() => openEdit(lead)} // 👈 AQUI ABRIMOS O MODAL DE EDIÇÃO
                                            className={`group transition-colors cursor-pointer hover:bg-white/[0.04] ${isSelected
                                                ? "bg-cyan-500/10 hover:bg-cyan-500/15" // 👈 Atualizado para a cor Cyan
                                                : idx % 2 === 0
                                                    ? "bg-white/[0.01]"
                                                    : ""
                                                }`}
                                            style={{ borderBottom: "1px solid rgba(255,255,255,0.04)" }}
                                        >
                                            {/* Checkbox */}
                                            <td
                                                className="px-4 py-3 print:hidden"
                                                onClick={(e) => e.stopPropagation()} // 👈 AQUI BLINDAMOS O CLIQUE DO CHECKBOX
                                            >
                                                <input
                                                    type="checkbox"
                                                    checked={isSelected}
                                                    onChange={() => onToggleSelect(lead.id)}
                                                    className="h-4 w-4 rounded border-slate-600 bg-transparent accent-cyan-500 cursor-pointer"
                                                    aria-label={`Selecionar ${lead.nome}`}
                                                />
                                            </td>

                                            {/* Nome + Corretor */}
                                            <td className="px-4 py-3">
                                                <div className="flex items-center gap-3">
                                                    <div
                                                        className="flex h-8 w-8 flex-shrink-0 items-center justify-center rounded-full text-xs font-bold text-black print:hidden"
                                                        style={{ background: "linear-gradient(135deg,#22d3ee,#06b6d4)" }}
                                                    >
                                                        {lead.nome.charAt(0)}
                                                    </div>
                                                    <div>
                                                        <p className="font-medium text-slate-100 leading-tight group-hover:text-cyan-400 transition-colors">
                                                            {lead.nome}
                                                        </p>
                                                        <p className="text-xs text-slate-500 flex items-center gap-1 mt-0.5">
                                                            <UserCircle2 className="h-3 w-3 print:hidden" />
                                                            {lead.corretor}
                                                        </p>
                                                    </div>
                                                </div>
                                            </td>

                                            {/* Telefone */}
                                            <td className="px-4 py-3">
                                                <span className="flex items-center gap-1.5 text-slate-300 whitespace-nowrap">
                                                    <Phone className="h-3.5 w-3.5 text-slate-500 print:hidden" />
                                                    ({lead.ddd}) {lead.telefone}
                                                </span>
                                            </td>

                                            {/* Cidade */}
                                            <td className="px-4 py-3">
                                                <span className="flex items-center gap-1.5 text-slate-300">
                                                    <MapPin className="h-3.5 w-3.5 text-slate-500 print:hidden" />
                                                    {lead.cidade}
                                                </span>
                                            </td>

                                            {/* Interesse */}
                                            <td className="px-4 py-3">
                                                <span
                                                    className={`badge ${lead.interesse === "Compra"
                                                        ? "badge-active"
                                                        : lead.interesse === "Locação"
                                                            ? "badge-info"
                                                            : "badge-warning"
                                                        }`}
                                                >
                                                    {lead.interesse}
                                                </span>
                                            </td>

                                            {/* Status */}
                                            {showStatus && (
                                                <td className="px-4 py-3">
                                                    <span className={`badge ${STATUS_BADGE[lead.status]}`}>
                                                        {STATUS_LABELS[lead.status]}
                                                    </span>
                                                </td>
                                            )}

                                            {/* Última Atualização */}
                                            <td className="px-4 py-3">
                                                <span className="flex items-center gap-1.5 text-slate-400 text-xs whitespace-nowrap">
                                                    <Calendar className="h-3.5 w-3.5 text-slate-600 print:hidden" />
                                                    {formatDate(lead.updatedAt)}
                                                </span>
                                            </td>
                                        </tr>
                                    );
                                })
                            )}
                        </tbody>
                    </table>
                </div>
            </div>

            {/* ---- Pagination ---- */}
            <div className="flex flex-col sm:flex-row items-center justify-between gap-3 px-1 print:hidden">
                {/* Left: count + page size */}
                <div className="flex items-center gap-3 text-xs text-slate-500">
                    <span>
                        {filtered.length === 0
                            ? "Nenhum resultado"
                            : `${(safePage - 1) * pageSize + 1}–${Math.min(safePage * pageSize, filtered.length)} de ${filtered.length} leads`}
                    </span>
                    <select
                        value={pageSize}
                        onChange={(e) => { setPageSize(Number(e.target.value)); setPage(1); }}
                        className="rounded-lg border border-white/[0.07] bg-white/[0.04] px-2 py-1 text-xs text-slate-400 outline-none"
                    >
                        {PAGE_SIZE_OPTIONS.map((n) => (
                            <option key={n} value={n} className="bg-slate-900">{n} por página</option>
                        ))}
                    </select>
                </div>

                {/* Right: page controls */}
                <div className="flex items-center gap-1">
                    <button
                        onClick={() => setPage((p) => Math.max(1, p - 1))}
                        disabled={safePage === 1}
                        className="flex h-8 w-8 items-center justify-center rounded-lg border border-white/[0.07] text-slate-400 transition-colors hover:bg-white/[0.05] disabled:opacity-30 disabled:cursor-not-allowed"
                        aria-label="Página anterior"
                    >
                        <ChevronLeft className="h-4 w-4" />
                    </button>

                    {Array.from({ length: totalPages }, (_, i) => i + 1)
                        .filter((n) => n === 1 || n === totalPages || Math.abs(n - safePage) <= 1)
                        .reduce<(number | "...")[]>((acc, n, i, arr) => {
                            if (i > 0 && n - (arr[i - 1] as number) > 1) acc.push("...");
                            acc.push(n);
                            return acc;
                        }, [])
                        .map((item, i) =>
                            item === "..." ? (
                                <span key={`ellipsis-${i}`} className="px-2 text-slate-600 text-xs">…</span>
                            ) : (
                                <button
                                    key={item}
                                    onClick={() => setPage(item as number)}
                                    className={`flex h-8 min-w-[2rem] items-center justify-center rounded-lg border text-xs font-medium transition-colors ${safePage === item
                                        ? "border-cyan-500/50 bg-cyan-500/15 text-cyan-400" // 👈 Paginação Cyan
                                        : "border-white/[0.07] text-slate-400 hover:bg-white/[0.05]"
                                        }`}
                                >
                                    {item}
                                </button>
                            )
                        )}

                    <button
                        onClick={() => setPage((p) => Math.min(totalPages, p + 1))}
                        disabled={safePage === totalPages}
                        className="flex h-8 w-8 items-center justify-center rounded-lg border border-white/[0.07] text-slate-400 transition-colors hover:bg-white/[0.05] disabled:opacity-30 disabled:cursor-not-allowed"
                        aria-label="Próxima página"
                    >
                        <ChevronRight className="h-4 w-4" />
                    </button>
                </div>
            </div>
        </div>
    );
}