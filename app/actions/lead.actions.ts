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

// 🚀 FUNÇÃO BLINDADA: Garante que o lead existe e força a gravação
export async function updateLead(leadId: string, data: UpdateLeadData) {
    const session = await requireSession();

    // 1. Verifica se o lead realmente existe e pertence a esta imobiliária
    const existing = await prisma.lead.findFirst({
        where: { id: leadId, tenantId: session.user.tenantId }
    });

    if (!existing) {
        throw new Error("Lead não encontrado ou sem permissão para editar.");
    }

    // 2. Grava na força (Se falhar aqui, ele joga um Erro Visível)
    await prisma.lead.update({
        where: { id: leadId },
        data: {
            nome: data.nome,
            ddd: data.ddd,
            telefone: data.telefone,
            cidade: data.cidade,
            interesse: data.interesse,
            observacoes: data.observacoes,
        },
    });

    // 3. Limpa o cache das rotas EXATAS (Para a Vercel não se perder)
    revalidatePath("/leads");
    revalidatePath("/kanban");
    revalidatePath("/");
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

    revalidatePath("/leads");
    revalidatePath("/kanban");
    revalidatePath("/");
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

    revalidatePath("/leads");
    revalidatePath("/kanban");
    revalidatePath("/");
}

// ============================================================================
// 🚀 ADD LEAD NOTE + GATILHO DE AUTOMAÇÃO (NLP)
// ============================================================================
export async function addLeadNote(leadId: string, observacao: string) {
    const session = await requireSession();

    const current = await prisma.lead.findFirst({
        where: { id: leadId, tenantId: session.user.tenantId },
        select: { status: true, tenantId: true }, // Adicionado tenantId para usar na Task
    });

    if (!current) throw new Error("Lead não encontrado ou sem permissão.");

    // 1. Salva o histórico normalmente
    await prisma.leadHistory.create({
        data: {
            leadId,
            statusAntes: current.status,
            statusDepois: current.status,
            observacao,
        },
    });

    // 2. Aciona o Cérebro de Automação
    const acaoDetectada = identificarAcao(observacao);
    const dataDetectada = calcularDataAgendamento(observacao);

    // Se encontrou uma intenção clara de tarefa e uma data válida, cria a Task!
    if (acaoDetectada && dataDetectada) {
        await prisma.task.create({
            data: {
                leadId: leadId,
                tenantId: current.tenantId,
                titulo: observacao,
                tipo: acaoDetectada,
                dataAgendada: dataDetectada,
                prioridade: 1,
            }
        });
    }

    revalidatePath("/leads");
    revalidatePath("/kanban");
    revalidatePath("/");
}

export async function archiveLead(leadId: string) {
    const session = await requireSession();

    await prisma.lead.update({
        where: { id: leadId },
        data: { isArquivado: true },
    });

    revalidatePath("/leads");
    revalidatePath("/kanban");
    revalidatePath("/");
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

    await prisma.lead.update({
        where: { id: leadId },
        data: { isArquivado: false },
    });

    revalidatePath("/arquivados");
    revalidatePath("/kanban");
    revalidatePath("/");
}

export async function deleteLeadForever(leadId: string) {
    const session = await requireSession();

    await prisma.lead.delete({
        where: { id: leadId },
    });

    revalidatePath("/arquivados");
    revalidatePath("/");
}

// ============================================================================
// MOTOR DE AUTOMAÇÃO: PROCESSAMENTO DE LINGUAGEM NATURAL (NLP) BASEADO EM REGRAS
// ============================================================================

function calcularDataAgendamento(texto: string): Date | null {
    const hoje = new Date();
    hoje.setHours(0, 0, 0, 0);
    let dataAlvo = new Date(hoje);
    let horaAlvo = 14; // Padrão: 14h30
    let minutoAlvo = 30;

    const textoLower = texto.toLowerCase();

    // 1. Detectar Período do Dia (Horário)
    if (textoLower.match(/\b(manhã|manha|cedo)\b/)) {
        horaAlvo = 9; minutoAlvo = 0;
    } else if (textoLower.match(/\b(tarde)\b/)) {
        horaAlvo = 14; minutoAlvo = 30;
    } else if (textoLower.match(/\b(noite)\b/)) {
        horaAlvo = 19; minutoAlvo = 30;
    }

    // 2. Detectar Dia Exato (Ex: "Dia 20")
    const matchDia = textoLower.match(/\bdia\s*(\d{1,2})\b/);
    if (matchDia) {
        const dia = parseInt(matchDia[1], 10);
        if (dia >= 1 && dia <= 31) {
            dataAlvo.setDate(dia);
            if (dataAlvo < hoje) {
                dataAlvo.setMonth(dataAlvo.getMonth() + 1);
            }
            dataAlvo.setHours(horaAlvo, minutoAlvo, 0, 0);
            return dataAlvo;
        }
    }

    // 3. Detectar Termos Relativos
    if (textoLower.match(/\b(hoje)\b/)) {
        // Mantém hoje
    } else if (textoLower.match(/\b(amanhã|amanha)\b/)) {
        dataAlvo.setDate(hoje.getDate() + 1);
    } else if (textoLower.match(/\b(depois de amanhã|depois de amanha)\b/)) {
        dataAlvo.setDate(hoje.getDate() + 2);
    }
    // 4. Detectar Dias da Semana (0 = Domingo, 1 = Segunda, ...)
    else {
        const diasSemana: Record<string, number> = {
            'domingo': 0, 'segunda': 1, 'terça': 2, 'terca': 2,
            'quarta': 3, 'quinta': 4, 'sexta': 5, 'sábado': 6, 'sabado': 6
        };

        let diaEncontrado = -1;
        for (const [chave, valor] of Object.entries(diasSemana)) {
            if (textoLower.includes(chave)) {
                diaEncontrado = valor;
                break;
            }
        }

        if (diaEncontrado !== -1) {
            const diaAtual = hoje.getDay();
            let diasParaAdicionar = diaEncontrado - diaAtual;

            if (diasParaAdicionar <= 0) {
                diasParaAdicionar += 7;
            }
            dataAlvo.setDate(hoje.getDate() + diasParaAdicionar);
        } else {
            return null;
        }
    }

    dataAlvo.setHours(horaAlvo, minutoAlvo, 0, 0);
    return dataAlvo;
}

function identificarAcao(texto: string): string | null {
    const t = texto.toLowerCase();

    // Ordem de prioridade importa (Enviar imóveis vem antes de Enviar genérico)
    if (t.match(/\b(enviar imoveis|enviar imóveis|mandar imoveis|mandar opções|enviar opcoes)\b/)) return "ENVIAR_IMOVEIS";
    if (t.match(/\b(ligar|call|telefonar)\b/)) return "LIGAR";
    if (t.match(/\b(visita|visitar)\b/)) return "VISITA";
    if (t.match(/\b(reunião|reuniao|conversar)\b/)) return "REUNIAO";
    if (t.match(/\b(retornar|feedback)\b/)) return "RETORNAR";
    if (t.match(/\b(escritura)\b/)) return "ESCRITURA";
    if (t.match(/\b(proposta)\b/)) return "PROPOSTA";
    if (t.match(/\b(enviar|mandar)\b/)) return "ENVIAR";

    return null;
}