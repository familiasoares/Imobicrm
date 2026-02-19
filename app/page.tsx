import React from "react";
import {
    Users,
    TrendingUp,
    CheckCircle2,
    XCircle,
    Clock,
    ArrowUpRight,
    Activity
} from "lucide-react";
import { getDashboardData } from "@/app/actions/dashboard.actions";

function timeAgo(date: Date) {
    const seconds = Math.floor((new Date().getTime() - date.getTime()) / 1000);
    if (seconds < 60) return "agora";
    const minutes = Math.floor(seconds / 60);
    if (minutes < 60) return `${minutes}m`;
    const hours = Math.floor(minutes / 60);
    if (hours < 24) return `${hours}h`;
    return date.toLocaleDateString("pt-BR");
}

function StatCard({ icon: Icon, label, value, sub, color }: any) {
    return (
        <div className="glass-card p-5 flex flex-col gap-4">
            <div className="flex items-start justify-between">
                <div className="flex h-10 w-10 items-center justify-center rounded-xl" style={{ background: color }}>
                    <Icon className="h-5 w-5 text-white" />
                </div>
                <span className="badge badge-info text-[10px]">Realtime</span>
            </div>
            <div>
                <p className="text-3xl font-bold text-white tracking-tight">{value}</p>
                <p className="text-xs text-slate-400 mt-1 uppercase tracking-wider font-semibold">{label}</p>
            </div>
            <p className="text-[10px] text-slate-600 border-t border-white/[0.05] pt-3">{sub}</p>
        </div>
    );
}

export default async function DashboardPage() {
    const data = await getDashboardData();

    const STATUS_CONFIG: any = {
        NOVO_LEAD: { label: "Novo Lead", color: "#6366f1" },
        EM_ATENDIMENTO: { label: "Em Atendimento", color: "#3b82f6" },
        VISITA: { label: "Visita", color: "#8b5cf6" },
        AGENDAMENTO: { label: "Agendado", color: "#f59e0b" },
        PROPOSTA: { label: "Proposta", color: "#ec4899" },
    };

    const funnelStages = Object.keys(STATUS_CONFIG).map(key => {
        const found = data.funnel.find(f => f.status === key);
        return { key, ...STATUS_CONFIG[key], count: found?.count || 0 };
    });

    const maxCount = Math.max(...funnelStages.map(s => s.count), 1);

    const cards = [
        { icon: Users, label: "Leads Ativos", value: data.metrics.activeCount, sub: "Negociações em curso", color: "#6366f1" },
        { icon: CheckCircle2, label: "Vendas", value: data.metrics.wonCount, sub: "Conversões totais", color: "#10b981" },
        { icon: XCircle, label: "Perdidos", value: data.metrics.lostCount, sub: "Leads arquivados", color: "#ef4444" },
        { icon: TrendingUp, label: "Conversão", value: `${data.metrics.conversionRate}%`, sub: "Win rate atual", color: "#f59e0b" },
    ];

    return (
        <div className="space-y-8 max-w-7xl mx-auto p-4 sm:p-0">
            <header>
                <h1 className="text-2xl font-bold text-white tracking-tight">Dashboard Executivo</h1>
                <p className="text-sm text-slate-500 mt-1">Resumo do desempenho de vendas em tempo real.</p>
            </header>

            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
                {cards.map(c => <StatCard key={c.label} {...c} />)}
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                <div className="glass-card p-6 flex flex-col gap-6">
                    <h3 className="text-xs font-bold text-white uppercase tracking-widest">Funil de Vendas</h3>
                    <div className="space-y-5">
                        {funnelStages.map(stage => (
                            <div key={stage.key} className="space-y-1.5">
                                <div className="flex justify-between text-[10px] uppercase font-bold text-slate-500">
                                    <span>{stage.label}</span>
                                    <span className="text-white">{stage.count}</span>
                                </div>
                                <div className="h-1.5 w-full bg-white/[0.03] rounded-full overflow-hidden">
                                    <div
                                        className="h-full rounded-full transition-all duration-1000"
                                        style={{ width: `${(stage.count / maxCount) * 100}%`, background: stage.color }}
                                    />
                                </div>
                            </div>
                        ))}
                    </div>
                </div>

                <div className="glass-card lg:col-span-2 p-6 flex flex-col gap-6">
                    <div className="flex items-center justify-between">
                        <h3 className="text-xs font-bold text-white uppercase tracking-widest">Atividades Recentes</h3>
                        <Activity className="h-4 w-4 text-slate-600" />
                    </div>
                    <div className="space-y-1">
                        {data.recentLeads.map((lead: any) => (
                            <div key={lead.id} className="flex items-center justify-between py-3 border-b border-white/[0.05] last:border-0 group">
                                <div className="flex items-center gap-3">
                                    <div className="h-8 w-8 rounded-full bg-indigo-500/10 flex items-center justify-center text-xs font-bold text-indigo-400 border border-indigo-500/20">
                                        {lead.nome.charAt(0)}
                                    </div>
                                    <div>
                                        <p className="text-sm font-medium text-slate-200 group-hover:text-white transition-colors">{lead.nome}</p>
                                        <p className="text-[10px] text-slate-500 uppercase">{lead.cidade}</p>
                                    </div>
                                </div>
                                <div className="flex flex-col items-end gap-1">
                                    <span className="text-[10px] px-2 py-0.5 rounded-full bg-white/[0.05] text-slate-400 border border-white/[0.05]">
                                        {lead.status.replace('_', ' ')}
                                    </span>
                                    <span className="text-[10px] text-slate-600">{timeAgo(lead.updatedAt)}</span>
                                </div>
                            </div>
                        ))}
                    </div>
                    <a href="/kanban" className="text-center text-[10px] font-bold text-indigo-400 hover:text-indigo-300 transition-colors py-2 uppercase tracking-widest bg-indigo-500/5 rounded-lg border border-indigo-500/10">
                        Ver Pipeline Completo
                    </a>
                </div>
            </div>
        </div>
    );
}