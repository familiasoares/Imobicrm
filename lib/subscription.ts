// -----------------------------------------------------------------------
// lib/subscription.ts
// Tipos, constantes e helpers para o módulo de assinatura
// -----------------------------------------------------------------------

export type SubscriptionStatus = "ATIVA" | "ATRASADA" | "BLOQUEADA";

// Cookie name read by middleware.ts on every request (Edge Runtime)
export const SUBSCRIPTION_COOKIE = "mock_subscription_status" as const;

// Rotas bloqueadas quando assinatura está BLOQUEADA
// (usadas também no middleware.ts)
export const BLOCKED_ROUTES = ["/kanban", "/leads", "/arquivados", "/equipe"] as const;

export interface SubscriptionData {
    status: SubscriptionStatus;
    plano: string;
    valor: number;          // em reais
    vencimento: string;     // ISO date string
    diasAtraso: number;
    linkBoleto?: string;
    nomeImobiliaria: string;
}

// -----------------------------------------------------------------------
// Mock data — substituir por chamada à DB (Prisma) em produção
// -----------------------------------------------------------------------
export function getMockSubscription(
    status: SubscriptionStatus = "ATRASADA"
): SubscriptionData {
    const hoje = new Date();
    const vencimento = new Date(hoje.getTime() - 3 * 24 * 60 * 60 * 1000); // 3 dias atrás

    const diasAtraso =
        status === "ATIVA"
            ? 0
            : Math.floor((hoje.getTime() - vencimento.getTime()) / (1000 * 60 * 60 * 24));

    return {
        status,
        plano: "ImobiCRM Pro",
        valor: 197.0,
        vencimento: vencimento.toISOString(),
        diasAtraso,
        nomeImobiliaria: "Imobiliária Horizonte Ltda.",
        linkBoleto:
            status !== "ATIVA"
                ? "https://sandbox.asaas.com/pagamento/simulado"
                : undefined,
    };
}

/** Formata valor em Real brasileiro */
export function formatBRL(value: number): string {
    return new Intl.NumberFormat("pt-BR", {
        style: "currency",
        currency: "BRL",
    }).format(value);
}

/** Formata data ISO para pt-BR */
export function formatDateBR(iso: string): string {
    return new Date(iso).toLocaleDateString("pt-BR", {
        day: "2-digit",
        month: "long",
        year: "numeric",
    });
}

// Config de cada status para uso na UI
export const STATUS_CONFIG: Record<
    SubscriptionStatus,
    {
        label: string;
        color: string;      // cor do badge/gradiente
        glow: string;       // sombra colorida
        icon: string;       // emoji de apoio
        badgeClass: string; // CSS class
    }
> = {
    ATIVA: {
        label: "Ativa",
        color: "linear-gradient(135deg,#10b981,#34d399)",
        glow: "rgba(16,185,129,0.3)",
        icon: "✅",
        badgeClass: "badge-active",
    },
    ATRASADA: {
        label: "Atrasada",
        color: "linear-gradient(135deg,#f59e0b,#fbbf24)",
        glow: "rgba(245,158,11,0.3)",
        icon: "⚠️",
        badgeClass: "badge-warning",
    },
    BLOQUEADA: {
        label: "Bloqueada",
        color: "linear-gradient(135deg,#ef4444,#f87171)",
        glow: "rgba(239,68,68,0.35)",
        icon: "🔒",
        badgeClass: "badge-danger",
    },
};
