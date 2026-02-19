"use client";

import React from "react";
import {
    Users,
    TrendingUp,
    CheckCircle2,
    Clock,
    ArrowUpRight,
    Activity,
} from "lucide-react";

// -----------------------------------------------------------------------
// Stat card component
// -----------------------------------------------------------------------
function StatCard({
    icon: Icon,
    label,
    value,
    sub,
    color,
}: {
    icon: React.ElementType;
    label: string;
    value: string;
    sub: string;
    color: string;
}) {
    return (
        <div className="glass-card p-5 flex flex-col gap-4 animate-fade-in">
            <div className="flex items-start justify-between">
                <div
                    className="flex h-10 w-10 items-center justify-center rounded-xl"
                    style={{ background: color }}
                >
                    <Icon className="h-5 w-5 text-white" />
                </div>
                <span className="badge badge-info">
                    <ArrowUpRight className="h-3 w-3 mr-0.5" />
                    Live
                </span>
            </div>
            <div>
                <p className="text-3xl font-bold text-white">{value}</p>
                <p className="text-sm text-slate-400 mt-0.5">{label}</p>
            </div>
            <p className="text-xs text-slate-600 border-t border-white/[0.06] pt-3">{sub}</p>
        </div>
    );
}

// -----------------------------------------------------------------------
// Pipeline progress bar
// -----------------------------------------------------------------------
function PipelineBar({
    stage,
    count,
    total,
    color,
}: {
    stage: string;
    count: number;
    total: number;
    color: string;
}) {
    const pct = total > 0 ? Math.round((count / total) * 100) : 0;
    return (
        <div className="space-y-1.5">
            <div className="flex justify-between text-xs">
                <span className="text-slate-400">{stage}</span>
                <span className="text-slate-500">{count} leads</span>
            </div>
            <div className="h-1.5 w-full rounded-full bg-white/[0.05]">
                <div
                    className="h-1.5 rounded-full transition-all duration-700"
                    style={{ width: `${pct}%`, background: color }}
                />
            </div>
        </div>
    );
}

// -----------------------------------------------------------------------
// Page
// -----------------------------------------------------------------------
export default function DashboardPage() {
    const stats = [
        {
            icon: Users,
            label: "Total de Leads",
            value: "142",
            sub: "+12 nos últimos 7 dias",
            color: "linear-gradient(135deg,#6366f1,#8b5cf6)",
        },
        {
            icon: Activity,
            label: "Em Atendimento",
            value: "38",
            sub: "26% do total activo",
            color: "linear-gradient(135deg,#0ea5e9,#38bdf8)",
        },
        {
            icon: TrendingUp,
            label: "Propostas Enviadas",
            value: "17",
            sub: "Taxa de conversão estimada 23%",
            color: "linear-gradient(135deg,#f59e0b,#fbbf24)",
        },
        {
            icon: CheckCircle2,
            label: "Vendas Fechadas",
            value: "9",
            sub: "Este mês — meta: 15",
            color: "linear-gradient(135deg,#10b981,#34d399)",
        },
    ];

    const pipeline = [
        { stage: "Novo Lead", count: 48, color: "#6366f1" },
        { stage: "Em Atendimento", count: 38, color: "#0ea5e9" },
        { stage: "Visita", count: 22, color: "#f59e0b" },
        { stage: "Proposta", count: 17, color: "#8b5cf6" },
        { stage: "Venda Fechada", count: 9, color: "#10b981" },
        { stage: "Venda Perdida", count: 8, color: "#ef4444" },
    ];
    const totalPipeline = pipeline.reduce((s, p) => s + p.count, 0);

    const recentLeads = [
        { nome: "Carlos Souza", cidade: "São Paulo", status: "Em Atendimento", time: "há 10 min" },
        { nome: "Ana Lima", cidade: "Campinas", status: "Visita", time: "há 45 min" },
        { nome: "Marcos Pereira", cidade: "Rio", status: "Proposta", time: "há 2h" },
        { nome: "Julia Costa", cidade: "Floripa", status: "Novo Lead", time: "há 3h" },
        { nome: "Rafael Nunes", cidade: "Belo Horizonte", status: "Venda Fechada", time: "ontem" },
    ];

    const statusColor: Record<string, string> = {
        "Novo Lead": "badge-info",
        "Em Atendimento": "badge-warning",
        "Visita": "badge-warning",
        "Proposta": "badge-info",
        "Venda Fechada": "badge-active",
        "Venda Perdida": "badge-danger",
    };

    return (
        <div className="space-y-8 max-w-7xl mx-auto">

            {/* ---- Welcome strip ---- */}
            <div className="glass-card px-6 py-5 flex items-center justify-between"
                style={{ background: "linear-gradient(135deg, rgba(99,102,241,0.12) 0%, rgba(139,92,246,0.05) 100%)" }}>
                <div>
                    <h2 className="text-lg font-semibold text-white">Bem-vindo de volta 👋</h2>
                    <p className="text-sm text-slate-400 mt-0.5">
                        Aqui está o resumo do seu funil de vendas hoje.
                    </p>
                </div>
                <Clock className="h-8 w-8 text-indigo-400 opacity-60" />
            </div>

            {/* ---- Stats grid ---- */}
            <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-4 gap-4">
                {stats.map((s) => (
                    <StatCard key={s.label} {...s} />
                ))}
            </div>

            {/* ---- Pipeline + Recent Leads ---- */}
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">

                {/* Pipeline status */}
                <div className="glass-card p-6 space-y-4">
                    <h3 className="text-sm font-semibold text-white">Distribuição do Funil</h3>
                    <div className="space-y-3">
                        {pipeline.map((p) => (
                            <PipelineBar key={p.stage} total={totalPipeline} {...p} />
                        ))}
                    </div>
                </div>

                {/* Recent leads table */}
                <div className="glass-card p-6 lg:col-span-2">
                    <h3 className="text-sm font-semibold text-white mb-4">Leads Recentes</h3>
                    <div className="space-y-2">
                        {recentLeads.map((lead) => (
                            <div
                                key={lead.nome}
                                className="flex items-center justify-between rounded-xl px-4 py-3 transition-colors hover:bg-white/[0.03]"
                                style={{ borderBottom: "1px solid rgba(255,255,255,0.04)" }}
                            >
                                <div className="flex items-center gap-3">
                                    <div
                                        className="flex h-8 w-8 flex-shrink-0 items-center justify-center rounded-full text-xs font-bold text-white"
                                        style={{ background: "linear-gradient(135deg,#6366f1,#8b5cf6)" }}
                                    >
                                        {lead.nome.charAt(0)}
                                    </div>
                                    <div>
                                        <p className="text-sm font-medium text-slate-200">{lead.nome}</p>
                                        <p className="text-xs text-slate-500">{lead.cidade}</p>
                                    </div>
                                </div>
                                <div className="flex items-center gap-3">
                                    <span className={`badge ${statusColor[lead.status] ?? "badge-info"}`}>
                                        {lead.status}
                                    </span>
                                    <span className="text-xs text-slate-600 hidden sm:block">{lead.time}</span>
                                </div>
                            </div>
                        ))}
                    </div>
                </div>
            </div>
        </div>
    );
}
