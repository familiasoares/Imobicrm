"use server";

import { revalidatePath } from "next/cache";
import { prisma } from "@/lib/prisma";
import { getServerAuthSession } from "@/lib/auth";
// LeadStatus defined inline to avoid Prisma client regeneration race
type LeadStatus =
    | "NOVO_LEAD"
    | "EM_ATENDIMENTO"
    | "VISITA"
    | "AGENDAMENTO"
    | "PROPOSTA"
    | "VENDA_FECHADA"
    | "VENDA_PERDIDA";


// -----------------------------------------------------------------------
// Helpers
// -----------------------------------------------------------------------

/** Throws if no session or no tenantId — guards every action */
async function requireSession() {
    const session = await getServerAuthSession();
    if (!session?.user?.tenantId) {
        throw new Error("Não autorizado. Faça login novamente.");
    }
    return session;
}

// -----------------------------------------------------------------------
// getLeads — lista leads não-arquivados do tenant logado
// -----------------------------------------------------------------------
export async function getLeads() {
    const session = await requireSession();

    const leads = await prisma.lead.findMany({
        where: {
            tenantId: session.user.tenantId,
            isArquivado: false,
        },
        orderBy: { criadoEm: "desc" },
        include: {
            corretor: {
                select: { id: true, nome: true, email: true },
            },
        },
    });

    return leads;
}

// -----------------------------------------------------------------------
// updateLead — edita os campos de um lead existente
// -----------------------------------------------------------------------
export type UpdateLeadData = {
    nome?: string;
    telefone?: string;
    ddd?: string;
    cidade?: string;
    interesse?: string;
};

export async function updateLead(leadId: string, data: UpdateLeadData) {
    const session = await requireSession();

    await prisma.lead.updateMany({
        where: { id: leadId, tenantId: session.user.tenantId },
        data: { ...data },
    });

    revalidatePath("/leads");
    revalidatePath("/kanban");
    revalidatePath("/");
}




// -----------------------------------------------------------------------
// createLead — cria novo lead para o tenant logado
// -----------------------------------------------------------------------
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
            userId: session.user.id,   // criador = responsável inicial
            nome: data.nome,
            telefone: data.telefone,
            ddd: data.ddd,
            cidade: data.cidade,
            interesse: data.interesse,
            status: "NOVO_LEAD",
        },
    });

    revalidatePath("/leads");
    revalidatePath("/kanban");
    revalidatePath("/");           // dashboard stats

    return lead;
}

// -----------------------------------------------------------------------
// updateLeadStatus — drag-and-drop do Kanban / mudança de coluna
// -----------------------------------------------------------------------
export async function updateLeadStatus(leadId: string, newStatus: LeadStatus) {
    const session = await requireSession();

    // Read current status first (needed for LeadHistory)
    const current = await prisma.lead.findFirst({
        where: { id: leadId, tenantId: session.user.tenantId },
        select: { status: true },
    });

    if (!current) throw new Error("Lead não encontrado ou sem permissão.");
    if (current.status === newStatus) return; // noop

    // Update status + record history in a transaction
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

    revalidatePath("/kanban");
    revalidatePath("/leads");
    revalidatePath("/");
}


// -----------------------------------------------------------------------
// archiveLead — soft-delete
// -----------------------------------------------------------------------
export async function archiveLead(leadId: string) {
    const session = await requireSession();

    await prisma.lead.updateMany({
        where: { id: leadId, tenantId: session.user.tenantId },
        data: { isArquivado: true },
    });

    revalidatePath("/leads");
    revalidatePath("/kanban");
    revalidatePath("/");
}


// -----------------------------------------------------------------------
// getArchivedLeads — lista leads arquivados do tenant
// -----------------------------------------------------------------------
export async function getArchivedLeads() {
    const session = await requireSession();

    return prisma.lead.findMany({
        where: {
            tenantId: session.user.tenantId,
            isArquivado: true,
        },
        orderBy: { updatedAt: "desc" },
    });
}

// -----------------------------------------------------------------------
// reactivateLead — tira do arquivo
// -----------------------------------------------------------------------
export async function reactivateLead(leadId: string) {
    const session = await requireSession();

    await prisma.lead.updateMany({
        where: { id: leadId, tenantId: session.user.tenantId },
        data: { isArquivado: false },
    });

    revalidatePath("/arquivados");
    revalidatePath("/kanban");
    revalidatePath("/");
}


// -----------------------------------------------------------------------
// deleteLeadForever — exclusão permanente (apenas arquivados)
// -----------------------------------------------------------------------
export async function deleteLeadForever(leadId: string) {
    const session = await requireSession();

    await prisma.lead.deleteMany({
        where: {
            id: leadId,
            tenantId: session.user.tenantId,
            isArquivado: true,  // safety: só pode excluir leads já arquivados
        },
    });

    revalidatePath("/arquivados");
    revalidatePath("/");
}

