"use server";

import { revalidatePath } from "next/cache";
import { prisma } from "@/lib/prisma";
import { getServerAuthSession } from "@/lib/auth";

type LeadStatus =
    | "NOVO_LEAD"
    | "EM_ATENDIMENTO"
    | "VISITA"
    | "AGENDAMENTO"
    | "PROPOSTA"
    | "VENDA_FECHADA"
    | "VENDA_PERDIDA";

async function requireSession() {
    const session = await getServerAuthSession();
    if (!session?.user?.tenantId) {
        throw new Error("Não autorizado. Faça login novamente.");
    }
    return session;
}

export async function getLeads() {
    const session = await requireSession();

    return prisma.lead.findMany({
        where: {
            tenantId: session.user.tenantId,
            isArquivado: false,
        },
        orderBy: { criadoEm: "desc" },
        include: {
            corretor: { select: { id: true, nome: true, email: true } },
            history: { orderBy: { criadoEm: "desc" } }
        },
    });
}

export type UpdateLeadData = {
    nome?: string;
    telefone?: string;
    ddd?: string;
    cidade?: string;
    interesse?: string;
    observacoes?: string;
};

export async function updateLead(leadId: string, data: UpdateLeadData) {
    const session = await requireSession();

    await prisma.lead.updateMany({
        where: { id: leadId, tenantId: session.user.tenantId },
        data: { ...data },
    });

    // 🚀 Super F5 que limpa o cache de toda a aplicação
    revalidatePath("/", "layout");
}

export type CreateLeadData = {
    nome: string;
    telefone: string;
    ddd: string;
    cidade: string;
    interesse: string;
};

export async function createLead(data: CreateLeadData) {
    const session = await requireSession();

    const lead = await prisma.lead.create({
        data: {
            tenantId: session.user.tenantId,
            userId: session.user.id,
            nome: data.nome,
            telefone: data.telefone,
            ddd: data.ddd,
            cidade: data.cidade,
            interesse: data.interesse,
            status: "NOVO_LEAD",
        },
    });

    revalidatePath("/", "layout");
    return lead;
}

export async function updateLeadStatus(leadId: string, newStatus: LeadStatus) {
    const session = await requireSession();

    const current = await prisma.lead.findFirst({
        where: { id: leadId, tenantId: session.user.tenantId },
        select: { status: true },
    });

    if (!current) throw new Error("Lead não encontrado ou sem permissão.");
    if (current.status === newStatus) return;

    await prisma.$transaction([
        prisma.lead.update({
            where: { id: leadId },
            data: { status: newStatus },
        }),
        prisma.leadHistory.create({
            data: {
                leadId,
                statusAntes: current.status,
                statusDepois: newStatus,
            },
        }),
    ]);

    revalidatePath("/", "layout");
}

export async function addLeadNote(leadId: string, observacao: string) {
    const session = await requireSession();

    const current = await prisma.lead.findFirst({
        where: { id: leadId, tenantId: session.user.tenantId },
        select: { status: true },
    });

    if (!current) throw new Error("Lead não encontrado ou sem permissão.");

    await prisma.leadHistory.create({
        data: {
            leadId,
            statusAntes: current.status,
            statusDepois: current.status,
            observacao,
        },
    });

    revalidatePath("/", "layout");
}

export async function archiveLead(leadId: string) {
    const session = await requireSession();

    await prisma.lead.updateMany({
        where: { id: leadId, tenantId: session.user.tenantId },
        data: { isArquivado: true },
    });

    revalidatePath("/", "layout");
}

export async function getArchivedLeads() {
    const session = await requireSession();

    return prisma.lead.findMany({
        where: {
            tenantId: session.user.tenantId,
            isArquivado: true,
        },
        orderBy: { updatedAt: "desc" },
        include: {
            history: { orderBy: { criadoEm: "desc" } }
        }
    });
}

export async function reactivateLead(leadId: string) {
    const session = await requireSession();

    await prisma.lead.updateMany({
        where: { id: leadId, tenantId: session.user.tenantId },
        data: { isArquivado: false },
    });

    revalidatePath("/", "layout");
}

export async function deleteLeadForever(leadId: string) {
    const session = await requireSession();

    await prisma.lead.deleteMany({
        where: {
            id: leadId,
            tenantId: session.user.tenantId,
            isArquivado: true,
        },
    });

    revalidatePath("/", "layout");
}