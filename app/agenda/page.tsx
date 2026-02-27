import React from "react";
import { getTasks, toggleTaskCompletion } from "@/app/actions/task.actions";
import { CalendarCheck, Clock, Phone, Home, MessageCircle, CheckCircle2, Circle, AlertCircle } from "lucide-react";

export const dynamic = "force-dynamic";

export default async function AgendaPage() {
    const tasks = await getTasks();

    // Filtros lógicos para os KPIs
    const hoje = new Date();
    hoje.setHours(0, 0, 0, 0);

    const amanhã = new Date(hoje);
    amanhã.setDate(amanhã.getDate() + 1);

    const pendentes = tasks.filter(t => !t.concluida);
    const concluidas = tasks.filter(t => t.concluida);

    const tarefasAtrasadas = pendentes.filter(t => new Date(t.dataAgendada) < hoje);
    const tarefasHoje = pendentes.filter(t => new Date(t.dataAgendada) >= hoje && new Date(t.dataAgendada) < amanhã);

    // Função auxiliar para renderizar o ícone certo dependendo do tipo da tarefa
    const getTaskIcon = (tipo: string) => {
        switch (tipo) {
            case "LIGAR": return <Phone className="h-4 w-4 text-emerald-400" />;
            case "VISITA": return <Home className="h-4 w-4 text-blue-400" />;
            case "ENVIAR_IMOVEIS": return <MessageCircle className="h-4 w-4 text-purple-400" />;
            default: return <Clock className="h-4 w-4 text-cyan-400" />;
        }
    };

    return (
        <div className="p-6 sm:p-10 max-w-5xl mx-auto animate-fade-in">
            <div className="flex items-center gap-3 mb-8">
                <CalendarCheck className="h-8 w-8 text-cyan-400" />
                <h1 className="text-2xl sm:text-3xl font-black text-white tracking-tight">Minha Agenda</h1>
            </div>

            {/* KPIs - Resumo de Produtividade */}
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 mb-10">
                <div className="bg-red-500/10 border border-red-500/20 rounded-xl p-5 flex flex-col justify-center">
                    <span className="text-red-400 text-xs font-bold uppercase tracking-widest mb-1 flex items-center gap-1.5">
                        <AlertCircle className="h-3.5 w-3.5" /> Atrasadas
                    </span>
                    <span className="text-3xl font-black text-white">{tarefasAtrasadas.length}</span>
                </div>
                <div className="bg-cyan-500/10 border border-cyan-500/20 rounded-xl p-5 flex flex-col justify-center">
                    <span className="text-cyan-400 text-xs font-bold uppercase tracking-widest mb-1 flex items-center gap-1.5">
                        <Clock className="h-3.5 w-3.5" /> Para Hoje
                    </span>
                    <span className="text-3xl font-black text-white">{tarefasHoje.length}</span>
                </div>
                <div className="bg-[#0a0a0a] border border-white/10 rounded-xl p-5 flex flex-col justify-center">
                    <span className="text-slate-400 text-xs font-bold uppercase tracking-widest mb-1 flex items-center gap-1.5">
                        <CheckCircle2 className="h-3.5 w-3.5" /> Concluídas
                    </span>
                    <span className="text-3xl font-black text-white">{concluidas.length}</span>
                </div>
            </div>

            {/* Lista de Tarefas (Inbox Zero) */}
            <div className="bg-[#050505] border border-white/10 rounded-2xl overflow-hidden shadow-2xl">
                <div className="bg-[#0a0a0a] p-4 border-b border-white/10">
                    <h2 className="text-sm font-bold text-slate-200 uppercase tracking-widest">Caixa de Entrada (Pendentes)</h2>
                </div>

                <div className="divide-y divide-white/[0.04]">
                    {pendentes.length === 0 ? (
                        <div className="p-10 text-center flex flex-col items-center justify-center">
                            <div className="h-16 w-16 bg-emerald-500/10 rounded-full flex items-center justify-center mb-4">
                                <CheckCircle2 className="h-8 w-8 text-emerald-400" />
                            </div>
                            <p className="text-slate-300 font-bold">Inbox Zero!</p>
                            <p className="text-slate-500 text-sm mt-1">Você não tem nenhuma tarefa pendente.</p>
                        </div>
                    ) : (
                        pendentes.map((task) => {
                            const dataFormatada = new Date(task.dataAgendada).toLocaleDateString("pt-BR", { day: '2-digit', month: 'short', hour: '2-digit', minute: '2-digit' });
                            const isAtrasada = new Date(task.dataAgendada) < hoje;

                            return (
                                <div key={task.id} className="p-4 sm:p-5 flex items-center justify-between gap-4 hover:bg-white/[0.02] transition-colors group">
                                    <div className="flex items-center gap-4 flex-1 min-w-0">

                                        {/* Botão de Concluir Tarefa (Server Action Inline) */}
                                        <form action={toggleTaskCompletion.bind(null, task.id, true)}>
                                            <button type="submit" className="text-slate-600 hover:text-emerald-400 transition-colors">
                                                <Circle className="h-6 w-6" />
                                            </button>
                                        </form>

                                        <div className="flex items-center justify-center h-10 w-10 rounded-full bg-white/5 border border-white/10 shrink-0">
                                            {getTaskIcon(task.tipo)}
                                        </div>

                                        <div className="flex-1 min-w-0">
                                            <p className="text-slate-200 font-bold text-sm sm:text-base truncate">
                                                {task.titulo}
                                            </p>
                                            <div className="flex items-center gap-2 mt-0.5 text-xs font-medium">
                                                <span className="text-slate-500 truncate">{task.lead.nome}</span>
                                                <span className="text-slate-700">•</span>
                                                <span className={isAtrasada ? "text-red-400" : "text-cyan-500/80"}>
                                                    {dataFormatada}
                                                </span>
                                            </div>
                                        </div>
                                    </div>

                                    {/* Botão de Ação Rápida: WhatsApp */}
                                    <a
                                        href={`https://wa.me/55${task.lead.ddd}${task.lead.telefone.replace(/\D/g, "")}?text=Olá ${encodeURIComponent(task.lead.nome)}, tudo bem?`}
                                        target="_blank"
                                        rel="noopener noreferrer"
                                        className="hidden sm:flex items-center gap-2 bg-[#0a0a0a] border border-white/10 text-slate-300 text-xs font-bold px-4 py-2.5 rounded-lg hover:bg-emerald-500/10 hover:border-emerald-500/30 hover:text-emerald-400 transition-all shrink-0"
                                    >
                                        <MessageCircle className="h-4 w-4" />
                                        WhatsApp
                                    </a>
                                </div>
                            );
                        })
                    )}
                </div>
            </div>
        </div>
    );
}