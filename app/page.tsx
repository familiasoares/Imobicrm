import React from "react";
import {
    Users,
    TrendingUp,
    CheckCircle2,
    XCircle,
    Activity,
    CalendarCheck,
    AlertCircle,
    Clock,
    Circle,
    MessageCircle,
    Phone,
    Home
} from "lucide-react";
import { getDashboardData } from "@/app/actions/dashboard.actions";
import { getTasks, toggleTaskCompletion } from "@/app/actions/task.actions"; // 👈 Nossas novas ações da agenda
import { DashboardHeader } from "./DashboardHeader";
import Link from "next/link";

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

// Ícones dinâmicos para as tarefas
const getTaskIcon = (tipo: string) => {
    switch (tipo) {
        case "LIGAR": return <Phone className="h-3.5 w-3.5 text-emerald-400" />;
        case "VISITA": return <Home className="h-3.5 w-3.5 text-blue-400" />;
        case "ENVIAR_IMOVEIS": return <MessageCircle className="h-3.5 w-3.5 text-purple-400" />;
        default: return <Clock className="h-3.5 w-3.5 text-cyan-400" />;
    }
};

export default async function DashboardPage() {
    // Busca dados simultaneamente
    const [data, tasks] = await Promise.all([
        getDashboardData(),
        getTasks()
    ]);

    // Lógica das Tarefas (Foco no Hoje e Atrasadas)
    const hoje = new Date();
    hoje.setHours(0, 0, 0, 0);

    const amanhã = new Date(hoje);
    amanhã.setDate(amanhã.getDate() + 1);

    const pendentes = tasks.filter((t: any) => !t.concluida);
    const tarefasAtrasadas = pendentes.filter((t: any) => new Date(t.dataAgendada) < hoje);
    const tarefasHoje = pendentes.filter((t: any) => new Date(t.dataAgendada) >= hoje && new Date(t.dataAgendada) < amanhã);

    // Junta as atrasadas com as de hoje e pega as 4 mais urgentes
    const tarefasUrgentes = [...tarefasAtrasadas, ...tarefasHoje].slice(0, 4);

    // Lógica do Funil e Cards (Seu código original mantido intacto)
    const STATUS_CONFIG: any = {
        NOVO_LEAD: { label: "Novo Lead", color: "#6366f1" },
        EM_ATENDIMENTO: { label: "Em Atendimento", color: "#3b82f6" },
        VISITA: { label: "Visita", color: "#8b5cf6" },
        AGENDAMENTO: { label: "Agendado", color: "#f59e0b" },
        PROPOSTA: { label: "Proposta", color: "#ec4899" },
    };

    const funnelStages = Object.keys(STATUS_CONFIG).map(key => {
        const found = data.funnel.find((f: any) => f.status === key);
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
        <div className="space-y-8 max-w-7xl mx-auto p-4 sm:p-0 animate-fade-in">
            <DashboardHeader />

            {/* 1. CARDS DE ESTATÍSTICA */}
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
                {cards.map(c => <StatCard key={c.label} {...c} />)}
            </div>

            {/* 2. WIDGET: MEU DIA (TAREFAS URGENTES) */}
            <div className="glass-card p-6 border-l-4 border-l-cyan-500 flex flex-col gap-4 relative overflow-hidden">
                <div className="absolute top-0 right-0 p-16 bg-cyan-500/5 blur-3xl rounded-full pointer-events-none" />

                <div className="flex items-center justify-between z-10">
                    <div className="flex items-center gap-3">
                        <CalendarCheck className="h-5 w-5 text-cyan-400" />
                        <h3 className="text-sm font-bold text-white uppercase tracking-widest">Meu Dia</h3>

                        {(tarefasAtrasadas.length > 0 || tarefasHoje.length > 0) && (
                            <div className="flex gap-2 ml-2">
                                {tarefasAtrasadas.length > 0 && (
                                    <span className="flex items-center gap-1 text-[10px] bg-red-500/10 text-red-400 px-2 py-0.5 rounded border border-red-500/20 font-bold">
                                        <AlertCircle className="h-3 w-3" /> {tarefasAtrasadas.length} Atrasadas
                                    </span>
                                )}
                                {tarefasHoje.length > 0 && (
                                    <span className="flex items-center gap-1 text-[10px] bg-cyan-500/10 text-cyan-400 px-2 py-0.5 rounded border border-cyan-500/20 font-bold">
                                        <Clock className="h-3 w-3" /> {tarefasHoje.length} Para Hoje
                                    </span>
                                )}
                            </div>
                        )}
                    </div>
                    <Link href="/agenda" className="text-[10px] font-bold text-cyan-400 hover:text-cyan-300 transition-colors uppercase tracking-widest bg-cyan-500/5 px-3 py-1.5 rounded-lg border border-cyan-500/10">
                        Ver Agenda Completa
                    </Link>
                </div>

                <div className="z-10 mt-2">
                    {tarefasUrgentes.length === 0 ? (
                        <div className="flex flex-col items-center justify-center py-6 bg-white/[0.02] rounded-xl border border-white/[0.05] border-dashed">
                            <CheckCircle2 className="h-8 w-8 text-emerald-500/50 mb-2" />
                            <p className="text-sm text-slate-300 font-bold">Tudo limpo por hoje!</p>
                            <p className="text-xs text-slate-500">Inbox Zero alcançado com sucesso.</p>
                        </div>
                    ) : (
                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                            {tarefasUrgentes.map((task: any) => {
                                const isAtrasada = new Date(task.dataAgendada) < hoje;
                                return (
                                    <div key={task.id} className="flex items-center justify-between p-3 bg-[#0a0a0a] border border-white/10 rounded-xl hover:bg-white/[0.03] transition-colors group">
                                        <div className="flex items-start gap-3 min-w-0 w-full">

                                            {/* Botão de concluir direto da dashboard */}
                                            <form action={toggleTaskCompletion.bind(null, task.id, true)} className="mt-0.5">
                                                <button type="submit" className="text-slate-600 hover:text-emerald-400 transition-colors">
                                                    <Circle className="h-5 w-5" />
                                                </button>
                                            </form>

                                            <div className="flex flex-col flex-1 min-w-0">
                                                <div className="flex items-center gap-2">
                                                    {/* Ícone da Tarefa pequeno ao lado do nome */}
                                                    <span className="opacity-80 shrink-0">{getTaskIcon(task.tipo)}</span>

                                                    {/* NOME DO CLIENTE EM DESTAQUE */}
                                                    <p className="text-sm font-black text-white truncate">
                                                        {task.lead.nome}
                                                    </p>
                                                </div>

                                                {/* A anotação que você fez */}
                                                <p className="text-[11px] text-slate-400 truncate mt-1">
                                                    {task.titulo}
                                                </p>

                                                {/* Badge de status (Hoje/Atrasada) */}
                                                <p className="text-[10px] mt-1.5 flex items-center gap-1">
                                                    <span className={`font-bold px-1.5 py-0.5 rounded-sm bg-white/5 border ${isAtrasada ? "text-red-400 border-red-500/20" : "text-cyan-400 border-cyan-500/20"}`}>
                                                        {isAtrasada ? "⚠️ Atrasada" : "⚡ Hoje"}
                                                    </span>
                                                </p>
                                            </div>
                                        </div>
                                    </div>
                                );
                            })}
                        </div>
                    )}
                </div>
            </div>

            {/* 3. FUNIL E ATIVIDADES */}
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