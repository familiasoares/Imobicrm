"use client";

import React, { useState, useEffect } from "react";
import {
    ShieldCheck,
    AlertTriangle,
    Lock,
    CreditCard,
    Smartphone,
    Calendar,
    CheckCircle2,
    Zap,
    Clock,
    RotateCcw,
    ChevronRight,
    Copy,
    ExternalLink,
} from "lucide-react";
import {
    getMockSubscription,
    STATUS_CONFIG,
    formatBRL,
    formatDateBR,
    SUBSCRIPTION_COOKIE,
} from "@/lib/subscription";
import type { SubscriptionStatus } from "@/lib/subscription";

// -----------------------------------------------------------------------
// Cookie helper (no external lib needed)
// -----------------------------------------------------------------------
function getCookie(name: string): string | undefined {
    if (typeof document === "undefined") return undefined;
    return document.cookie
        .split("; ")
        .find((row) => row.startsWith(`${name}=`))
        ?.split("=")[1];
}

function setCookie(name: string, value: string, days = 30) {
    const expires = new Date(Date.now() + days * 864e5).toUTCString();
    document.cookie = `${name}=${value};path=/;expires=${expires};samesite=strict`;
}

// -----------------------------------------------------------------------
// Dev-only status switcher — writes REAL cookie so middleware picks it up
// -----------------------------------------------------------------------
function DevStatusSwitcher({
    current,
    onChange,
}: {
    current: SubscriptionStatus;
    onChange: (s: SubscriptionStatus) => void;
}) {
    const STATUSES: SubscriptionStatus[] = ["ATIVA", "ATRASADA", "BLOQUEADA"];

    const handleChange = (s: SubscriptionStatus) => {
        // 1. Write the real cookie (middleware reads this on next navigation)
        setCookie(SUBSCRIPTION_COOKIE, s);

        // 2. Also manage the banner cookie consistently
        if (s === "ATRASADA") {
            setCookie("crm_show_overdue_banner", "1", 0.042); // ~1h
        } else {
            document.cookie = "crm_show_overdue_banner=;path=/;max-age=0";
        }

        // 3. Update local UI immediately
        onChange(s);
    };

    return (
        <div
            className="rounded-xl px-4 py-3 flex flex-col sm:flex-row sm:items-center gap-3"
            style={{
                background: "rgba(99,102,241,0.06)",
                border: "1px solid rgba(99,102,241,0.15)",
            }}
        >
            <span className="text-xs font-mono text-indigo-400 flex-shrink-0">
                🛠 Simulador de status (dev) — persiste via cookie:
            </span>
            <div className="flex gap-2 flex-wrap">
                {STATUSES.map((s) => (
                    <button
                        key={s}
                        onClick={() => handleChange(s)}
                        className={`rounded-lg px-3 py-1.5 text-xs font-semibold transition-all ${current === s
                                ? "text-white"
                                : "text-slate-500 hover:text-slate-300"
                            }`}
                        style={
                            current === s
                                ? {
                                    background: STATUS_CONFIG[s].color,
                                    boxShadow: `0 0 12px ${STATUS_CONFIG[s].glow}`,
                                }
                                : { background: "rgba(255,255,255,0.04)" }
                        }
                    >
                        {STATUS_CONFIG[s].icon} {STATUS_CONFIG[s].label}
                    </button>
                ))}
            </div>
            <p className="text-[10px] text-slate-600 sm:ml-auto">
                Mude o status e navegue para /leads ou /kanban para testar o bloqueio.
            </p>
        </div>
    );
}

// -----------------------------------------------------------------------
// Pix modal (simulated)
// -----------------------------------------------------------------------
function PixModal({ valor, onClose }: { valor: number; onClose: () => void }) {
    const [copied, setCopied] = useState(false);
    const fakeKey =
        "00020126580014BR.GOV.BCB.PIX0136a5e8b7c2-imobicrm-simulation5204000053039865802BR5920IMOBICRM SAAS LTDA6009SAO PAULO62070503***6304ABCD";

    const copy = () => {
        navigator.clipboard.writeText(fakeKey).then(() => {
            setCopied(true);
            setTimeout(() => setCopied(false), 2000);
        });
    };

    return (
        <div className="fixed inset-0 z-[70] flex items-center justify-center p-4">
            <div
                className="absolute inset-0 bg-black/60 backdrop-blur-sm"
                onClick={onClose}
            />
            <div
                className="relative w-full max-w-sm rounded-2xl p-6 animate-fade-in space-y-5"
                style={{
                    background: "rgba(9,15,36,0.97)",
                    border: "1px solid rgba(255,255,255,0.08)",
                    backdropFilter: "blur(24px)",
                    boxShadow: "0 24px 48px rgba(0,0,0,0.6)",
                }}
            >
                <div className="text-center space-y-1">
                    <div
                        className="mx-auto mb-3 flex h-12 w-12 items-center justify-center rounded-2xl"
                        style={{ background: "linear-gradient(135deg,#10b981,#34d399)" }}
                    >
                        <Smartphone className="h-6 w-6 text-white" />
                    </div>
                    <h3 className="font-bold text-white text-lg">Pagar com Pix</h3>
                    <p className="text-slate-400 text-sm">Escaneie ou copie o código abaixo</p>
                </div>

                <div
                    className="mx-auto flex h-36 w-36 items-center justify-center rounded-2xl text-slate-600 text-xs text-center"
                    style={{
                        background: "rgba(255,255,255,0.04)",
                        border: "1px dashed rgba(255,255,255,0.1)",
                    }}
                >
                    QR Code
                    <br />
                    (demo)
                </div>

                <div className="space-y-2">
                    <p className="text-xs text-slate-500">Chave Pix copia e cola:</p>
                    <div
                        className="rounded-xl p-3 font-mono text-[10px] text-slate-400 break-all"
                        style={{
                            background: "rgba(255,255,255,0.03)",
                            border: "1px solid rgba(255,255,255,0.06)",
                        }}
                    >
                        {fakeKey.slice(0, 60)}…
                    </div>
                    <button onClick={copy} className="btn-brand w-full justify-center">
                        {copied ? (
                            <>
                                <CheckCircle2 className="h-4 w-4" /> Copiado!
                            </>
                        ) : (
                            <>
                                <Copy className="h-4 w-4" /> Copiar Código Pix
                            </>
                        )}
                    </button>
                </div>

                <p className="text-center text-xs text-slate-600">
                    Valor: <span className="font-semibold text-slate-400">{formatBRL(valor)}</span>
                    {" · "}Vence em 30 minutos
                </p>
            </div>
        </div>
    );
}

// -----------------------------------------------------------------------
// Main page
// -----------------------------------------------------------------------
export default function AssinaturaPage() {
    // Read initial status FROM COOKIE on mount — guarantees persistence across navigation
    const [status, setStatus] = useState<SubscriptionStatus>("ATIVA");
    const [hydrated, setHydrated] = useState(false);
    const [showPix, setShowPix] = useState(false);

    useEffect(() => {
        // Read the real cookie value (set by the dev switcher or middleware tests)
        const cookieVal = getCookie(SUBSCRIPTION_COOKIE) as SubscriptionStatus | undefined;

        // If redirected here with ?bloqueado=1, force BLOQUEADA display
        const params = new URLSearchParams(window.location.search);
        if (params.get("bloqueado") === "1") {
            setStatus("BLOQUEADA");
        } else if (cookieVal && ["ATIVA", "ATRASADA", "BLOQUEADA"].includes(cookieVal)) {
            setStatus(cookieVal);
        } else {
            // No cookie yet → default to ATIVA, write it so middleware has something to read
            setCookie(SUBSCRIPTION_COOKIE, "ATIVA");
            setStatus("ATIVA");
        }
        setHydrated(true);
    }, []);

    const sub = getMockSubscription(status);
    const cfg = STATUS_CONFIG[status];

    const planFeatures = [
        "Leads ilimitados por tenant",
        "Kanban de funil de vendas",
        "Relatórios e exportação CSV",
        "Gestão da equipe de corretores",
        "Histórico completo de leads",
        "Suporte prioritário por WhatsApp",
    ];

    // Avoid hydration mismatch — render nothing until cookie is read
    if (!hydrated) {
        return (
            <div className="flex h-48 items-center justify-center">
                <div className="h-8 w-8 animate-spin rounded-full border-2 border-indigo-500 border-t-transparent" />
            </div>
        );
    }

    return (
        <>
            <div className="max-w-4xl mx-auto space-y-6 animate-fade-in">

                {/* ---- Dev switcher ---- */}
                <DevStatusSwitcher current={status} onChange={setStatus} />

                {/* ---- Blocked alert ---- */}
                {status === "BLOQUEADA" && (
                    <div
                        className="rounded-2xl px-5 py-4 flex items-start gap-4"
                        style={{
                            background: "rgba(239,68,68,0.08)",
                            border: "1px solid rgba(239,68,68,0.2)",
                        }}
                    >
                        <Lock className="h-5 w-5 text-red-400 flex-shrink-0 mt-0.5" />
                        <div>
                            <p className="font-semibold text-red-300 text-sm">Sistema Bloqueado</p>
                            <p className="text-sm text-red-400/70 mt-0.5">
                                O acesso ao Kanban, Lista de Leads e Equipe está suspenso. Regularize
                                o pagamento abaixo para restaurar o acesso imediatamente.
                            </p>
                        </div>
                    </div>
                )}

                {/* ---- Main status card ---- */}
                <div
                    className="rounded-2xl p-6 relative overflow-hidden"
                    style={{
                        background: "rgba(9,15,36,0.8)",
                        border: "1px solid rgba(255,255,255,0.07)",
                        backdropFilter: "blur(20px)",
                        boxShadow: `0 0 60px ${cfg.glow}, 0 4px 24px rgba(0,0,0,0.4)`,
                    }}
                >
                    <div
                        className="pointer-events-none absolute inset-0 opacity-10"
                        style={{
                            background: `radial-gradient(ellipse at 10% 50%, ${cfg.glow} 0%, transparent 60%)`,
                        }}
                    />

                    <div className="relative flex flex-col sm:flex-row sm:items-center justify-between gap-6">
                        <div className="flex items-start gap-4">
                            <div
                                className="flex h-14 w-14 flex-shrink-0 items-center justify-center rounded-2xl text-white"
                                style={{
                                    background: cfg.color,
                                    boxShadow: `0 0 24px ${cfg.glow}`,
                                }}
                            >
                                {status === "ATIVA" && <ShieldCheck className="h-7 w-7" />}
                                {status === "ATRASADA" && <AlertTriangle className="h-7 w-7" />}
                                {status === "BLOQUEADA" && <Lock className="h-7 w-7" />}
                            </div>
                            <div>
                                <p className="text-xs font-semibold uppercase tracking-widest text-slate-500 mb-1">
                                    Status da Assinatura
                                </p>
                                <span className={`badge ${cfg.badgeClass} text-sm px-3 py-1`}>
                                    {cfg.icon} {cfg.label}
                                </span>
                                <p className="text-sm text-slate-400 mt-2">{sub.nomeImobiliaria}</p>
                                <p className="text-xs text-slate-600 mt-0.5">
                                    Plano:{" "}
                                    <span className="text-slate-400 font-medium">{sub.plano}</span>
                                </p>
                            </div>
                        </div>

                        <div className="grid grid-cols-2 gap-4 sm:text-right">
                            <div>
                                <p className="text-xs text-slate-600 uppercase tracking-wider mb-0.5">
                                    Mensalidade
                                </p>
                                <p className="text-2xl font-bold text-white">{formatBRL(sub.valor)}</p>
                                <p className="text-xs text-slate-500">por mês</p>
                            </div>
                            <div>
                                <p className="text-xs text-slate-600 uppercase tracking-wider mb-0.5">
                                    {status === "ATIVA" ? "Próx. Vencimento" : "Vencimento"}
                                </p>
                                <p className="text-sm font-semibold text-white">
                                    {formatDateBR(sub.vencimento)}
                                </p>
                                {sub.diasAtraso > 0 && (
                                    <p className="text-xs text-red-400 mt-0.5 font-medium">
                                        {sub.diasAtraso} {sub.diasAtraso === 1 ? "dia" : "dias"} em atraso
                                    </p>
                                )}
                            </div>
                        </div>
                    </div>
                </div>

                {/* ---- Payment methods (only when not ATIVA) ---- */}
                {status !== "ATIVA" && (
                    <div className="space-y-3">
                        <p className="text-sm font-semibold text-white flex items-center gap-2">
                            <Zap className="h-4 w-4 text-indigo-400" />
                            Regularize agora — acesso restaurado em instantes
                        </p>

                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                            <button
                                onClick={() => setShowPix(true)}
                                className="glass-card p-5 text-left group transition-all hover:-translate-y-0.5 w-full"
                                style={{ boxShadow: "none", borderColor: "rgba(16,185,129,0.2)" }}
                            >
                                <div className="flex items-start gap-4">
                                    <div
                                        className="flex h-10 w-10 flex-shrink-0 items-center justify-center rounded-xl"
                                        style={{ background: "rgba(16,185,129,0.12)" }}
                                    >
                                        <Smartphone className="h-5 w-5 text-emerald-400" />
                                    </div>
                                    <div className="flex-1">
                                        <p className="font-semibold text-white group-hover:text-emerald-300 transition-colors">
                                            Pagar com Pix
                                        </p>
                                        <p className="text-xs text-slate-400 mt-0.5">
                                            Compensação instantânea · Acesso em &lt;2 min
                                        </p>
                                        <p className="text-lg font-bold text-emerald-400 mt-2">
                                            {formatBRL(sub.valor)}
                                        </p>
                                    </div>
                                    <ChevronRight className="h-4 w-4 text-slate-600 group-hover:text-emerald-400 transition-colors mt-1" />
                                </div>
                            </button>

                            <button
                                className="glass-card p-5 text-left group transition-all hover:-translate-y-0.5 w-full"
                                style={{ boxShadow: "none", borderColor: "rgba(99,102,241,0.2)" }}
                                onClick={() =>
                                    alert("(Demo) Integração com formulário de cartão do Asaas.")
                                }
                            >
                                <div className="flex items-start gap-4">
                                    <div
                                        className="flex h-10 w-10 flex-shrink-0 items-center justify-center rounded-xl"
                                        style={{ background: "rgba(99,102,241,0.12)" }}
                                    >
                                        <CreditCard className="h-5 w-5 text-indigo-400" />
                                    </div>
                                    <div className="flex-1">
                                        <p className="font-semibold text-white group-hover:text-indigo-300 transition-colors">
                                            Cartão de Crédito
                                        </p>
                                        <p className="text-xs text-slate-400 mt-0.5">
                                            Débito automático · Parcelamento disponível
                                        </p>
                                        <p className="text-lg font-bold text-indigo-400 mt-2">
                                            {formatBRL(sub.valor)}
                                        </p>
                                    </div>
                                    <ChevronRight className="h-4 w-4 text-slate-600 group-hover:text-indigo-400 transition-colors mt-1" />
                                </div>
                            </button>
                        </div>

                        {sub.linkBoleto && (
                            <a
                                href={sub.linkBoleto}
                                target="_blank"
                                rel="noopener noreferrer"
                                className="btn-ghost border border-white/[0.06] w-full justify-center mt-1"
                            >
                                <ExternalLink className="h-4 w-4" />
                                Ver fatura no portal Asaas
                            </a>
                        )}
                    </div>
                )}

                {/* ---- Features + Timeline ---- */}
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                    <div className="glass-card p-6 space-y-4">
                        <h3 className="text-sm font-semibold text-white flex items-center gap-2">
                            <ShieldCheck className="h-4 w-4 text-indigo-400" />
                            Incluído no ImobiCRM Pro
                        </h3>
                        <ul className="space-y-2.5">
                            {planFeatures.map((f) => (
                                <li key={f} className="flex items-center gap-2.5 text-sm text-slate-300">
                                    <CheckCircle2 className="h-4 w-4 text-emerald-400 flex-shrink-0" />
                                    {f}
                                </li>
                            ))}
                        </ul>
                    </div>

                    <div className="glass-card p-6 space-y-4">
                        <h3 className="text-sm font-semibold text-white flex items-center gap-2">
                            <Clock className="h-4 w-4 text-amber-400" />
                            Cronograma de Cobrança
                        </h3>
                        <ol className="relative border-l border-white/[0.07] space-y-4 ml-2">
                            {[
                                { icon: Calendar, color: "#6366f1", label: "Vencimento", desc: formatDateBR(sub.vencimento) },
                                { icon: AlertTriangle, color: "#f59e0b", label: "Período de Graça (3 dias)", desc: "Acesso mantido com banner de alerta" },
                                { icon: Lock, color: "#ef4444", label: "Bloqueio do Sistema", desc: "Acesso suspenso até regularização" },
                                { icon: RotateCcw, color: "#10b981", label: "Restauração Imediata", desc: "Pix compensado → acesso liberado em &lt;2 min" },
                            ].map((step, i) => (
                                <li key={i} className="ml-4">
                                    <span
                                        className="absolute -left-1.5 h-3 w-3 rounded-full"
                                        style={{ background: step.color }}
                                    />
                                    <p className="text-xs font-semibold text-slate-300">{step.label}</p>
                                    <p className="text-xs text-slate-500 mt-0.5" dangerouslySetInnerHTML={{ __html: step.desc }} />
                                </li>
                            ))}
                        </ol>
                    </div>
                </div>

                {/* ---- Support ---- */}
                <div
                    className="rounded-2xl px-5 py-4 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4"
                    style={{
                        background: "rgba(99,102,241,0.06)",
                        border: "1px solid rgba(99,102,241,0.12)",
                    }}
                >
                    <div>
                        <p className="text-sm font-semibold text-white">Precisa de ajuda?</p>
                        <p className="text-xs text-slate-400 mt-0.5">
                            Nossa equipe responde em até 2h via WhatsApp.
                        </p>
                    </div>
                    <a
                        href="https://wa.me/5511999999999?text=Olá, preciso de suporte com minha assinatura ImobiCRM."
                        target="_blank"
                        rel="noopener noreferrer"
                        className="btn-brand flex-shrink-0"
                    >
                        <Smartphone className="h-4 w-4" />
                        Falar no WhatsApp
                    </a>
                </div>
            </div>

            {showPix && (
                <PixModal valor={sub.valor} onClose={() => setShowPix(false)} />
            )}
        </>
    );
}
