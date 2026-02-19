"use server";

import { prisma } from "@/lib/prisma";
import { getServerAuthSession } from "@/lib/auth";

async function requireSession() {
    const session = await getServerAuthSession();
    if (!session?.user?.tenantId) {
        throw new Error("Não autorizado. Faça login novamente.");
    }
    return session;
}

export async function getDashboardData() {
    const session = await requireSession();
    const tenantId = session.user.tenantId;

    const [activeCount, wonCount, lostCount, funnelData, recentLeads] = await Promise.all([
        // Total de Leads Ativos
        prisma.lead.count({
            where: {
                tenantId,
                isArquivado: false,
                status: { notIn: ["VENDA_FECHADA", "VENDA_PERDIDA"] },
            },
        }),
        // Vendas Fechadas
        prisma.lead.count({
            where: {
                tenantId,
                status: "VENDA_FECHADA",
            },
        }),
        // Vendas Perdidas
        prisma.lead.count({
            where: {
                tenantId,
                status: "VENDA_PERDIDA",
            },
        }),
        // Dados para o Funil
        prisma.lead.groupBy({
            by: ["status"],
            where: { tenantId, isArquivado: false },
            _count: { _all: true },
        }),
        // 5 Leads mais recentes
        prisma.lead.findMany({
            where: { tenantId, isArquivado: false },
            orderBy: { updatedAt: "desc" },
            take: 5,
        }),
    ]);

    const totalFinished = wonCount + lostCount;
    const conversionRate = totalFinished > 0 ? (wonCount / totalFinished) * 100 : 0;

    return {
        metrics: {
            activeCount,
            wonCount,
            lostCount,
            conversionRate: conversionRate.toFixed(1),
        },
        funnel: funnelData.map(f => ({
            status: f.status,
            count: f._count._all
        })),
        recentLeads: recentLeads.map(l => ({
            id: l.id,
            nome: l.nome,
            status: l.status,
            updatedAt: l.updatedAt,
            cidade: l.cidade,
        })),
    };
}