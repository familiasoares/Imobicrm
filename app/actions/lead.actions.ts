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
            history: {
                orderBy: { criadoEm: "desc" },
                include: { usuario: { select: { nome: true } } }
            }
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
    tipoImovel?: string;
    valorPretendido?: string;
    perfilFinanceiro?: string;
    caracteristicasDesejadas?: string;
};

// 🚀 FUNÇÃO DE ATUALIZAÇÃO CORRIGIDA (AUDITORIA BLINDADA)
export async function updateLead(leadId: string, data: UpdateLeadData) {
    const session = await requireSession();

    // 1. Busca o estado atual para comparação
    const existing = await prisma.lead.findFirst({
        where: { id: leadId, tenantId: session.user.tenantId }
    });

    if (!existing) throw new Error("Lead não encontrado.");

    // 2. Mapeia o que mudou
    const mudancas: string[] = [];
    const camposParaMonitorar: (keyof UpdateLeadData)[] = [
        "nome", "telefone", "ddd", "cidade", "interesse",
        "tipoImovel", "valorPretendido", "perfilFinanceiro", "caracteristicasDesejadas", "observacoes"
    ];

    const formatLabel = (label: string) => {
        const labels: Record<string, string> = {
            tipoImovel: "Tipo de Imóvel",
            valorPretendido: "Valor Pretendido",
            perfilFinanceiro: "Perfil Financeiro",
            caracteristicasDesejadas: "Características",
            observacoes: "Observações Fixas"
        };
        return labels[label] || label.charAt(0).toUpperCase() + label.slice(1);
    };

    camposParaMonitorar.forEach((campo) => {
        const valorNovo = data[campo]?.toString().trim() || "";
        const valorAntigo = existing[campo as keyof typeof existing]?.toString().trim() || "";

        // Só loga se houver mudança real de conteúdo
        if (data[campo] !== undefined && valorNovo !== valorAntigo) {
            mudancas.push(`${formatLabel(campo)}: de "${valorAntigo || "Vazio"}" para "${valorNovo || "Vazio"}"`);
        }
    });

    // 3. Gravação em transação (segurança total)
    if (mudancas.length > 0) {
        // CORREÇÃO: Pega o nome correto da sessão para evitar 'undefined'
        const userName = session.user.name || session.user.nome || "Corretor";
        const descricaoLog = `${userName} alterou: ${mudancas.join(" | ")}`;

        await prisma.$transaction([
            prisma.lead.update({
                where: { id: leadId },
                data: {
                    nome: data.nome,
                    ddd: data.ddd,
                    telefone: data.telefone,
                    cidade: data.cidade,
                    interesse: data.interesse,
                    observacoes: data.observacoes,
                    tipoImovel: data.tipoImovel,
                    valorPretendido: data.valorPretendido,
                    perfilFinanceiro: data.perfilFinanceiro,
                    caracteristicasDesejadas: data.caracteristicasDesejadas,
                },
            }),
            prisma.leadHistory.create({
                data: {
                    leadId,
                    userId: session.user.id,
                    statusAntes: existing.status,
                    statusDepois: existing.status, // 🚀 REMOVIDO statusAfter QUE DAVA ERRO
                    observacao: descricaoLog,
                },
            }),
        ]);
    }

    revalidatePath("/leads");
    revalidatePath("/kanban");
    revalidatePath("/");
}

// --- RESTANTE DAS FUNÇÕES MANTIDAS E REVISADAS ---

export type CreateLeadData = {
    nome: string;
    telefone: string;
    ddd: string;
    cidade: string;
    interesse: string;
    tipoImovel?: string;
    valorPretendido?: string;
    perfilFinanceiro?: string;
    caracteristicasDesejadas?: string;
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
            tipoImovel: data.tipoImovel,
            valorPretendido: data.valorPretendido,
            perfilFinanceiro: data.perfilFinanceiro,
            caracteristicasDesejadas: data.caracteristicasDesejadas,
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

    if (!current) throw new Error("Lead não encontrado.");
    if (current.status === newStatus) return;

    await prisma.$transaction([
        prisma.lead.update({
            where: { id: leadId },
            data: { status: newStatus },
        }),
        prisma.leadHistory.create({
            data: {
                leadId,
                userId: session.user.id,
                statusAntes: current.status,
                statusDepois: newStatus,
                observacao: `${session.user.name || session.user.nome} moveu o lead para ${newStatus.replace('_', ' ')}`,
            },
        }),
    ]);

    revalidatePath("/leads");
    revalidatePath("/kanban");
    revalidatePath("/");
}

export async function addLeadNote(leadId: string, observacao: string) {
    const session = await requireSession();

    const current = await prisma.lead.findFirst({
        where: { id: leadId, tenantId: session.user.tenantId },
        select: { status: true, tenantId: true },
    });

    if (!current) throw new Error("Lead não encontrado.");

    await prisma.leadHistory.create({
        data: {
            leadId,
            userId: session.user.id,
            statusAntes: current.status,
            statusDepois: current.status,
            observacao,
        },
    });

    const acaoDetectada = identificarAcao(observacao);
    const dataDetectada = calcularDataAgendamento(observacao);

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
            history: {
                orderBy: { criadoEm: "desc" },
                include: { usuario: { select: { nome: true } } }
            }
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

function calcularDataAgendamento(texto: string): Date | null {
    const hoje = new Date();
    hoje.setHours(0, 0, 0, 0);
    let dataAlvo = new Date(hoje);
    let horaAlvo = 14;
    let minutoAlvo = 30;

    const textoLower = texto.toLowerCase();

    if (textoLower.match(/\b(manhã|manha|cedo)\b/)) {
        horaAlvo = 9; minutoAlvo = 0;
    } else if (textoLower.match(/\b(tarde)\b/)) {
        horaAlvo = 14; minutoAlvo = 30;
    } else if (textoLower.match(/\b(noite)\b/)) {
        horaAlvo = 19; minutoAlvo = 30;
    }

    const matchDia = textoLower.match(/\bdia\s*(\d{1,2})\b/);
    if (matchDia) {
        const dia = parseInt(matchDia[1], 10);
        if (dia >= 1 && dia <= 31) {
            dataAlvo.setDate(dia);
            if (dataAlvo < hoje) dataAlvo.setMonth(dataAlvo.getMonth() + 1);
            dataAlvo.setHours(horaAlvo, minutoAlvo, 0, 0);
            return dataAlvo;
        }
    }

    if (textoLower.match(/\b(hoje)\b/)) { }
    else if (textoLower.match(/\b(amanhã|amanha)\b/)) dataAlvo.setDate(hoje.getDate() + 1);
    else if (textoLower.match(/\b(depois de amanhã|depois de amanha)\b/)) dataAlvo.setDate(hoje.getDate() + 2);
    else {
        const diasSemana: Record<string, number> = {
            'domingo': 0, 'segunda': 1, 'terça': 2, 'terca': 2,
            'quarta': 3, 'quinta': 4, 'sexta': 5, 'sábado': 6, 'sabado': 6
        };
        let diaEncontrado = -1;
        for (const [chave, valor] of Object.entries(diasSemana)) {
            if (textoLower.includes(chave)) { diaEncontrado = valor; break; }
        }
        if (diaEncontrado !== -1) {
            const diaAtual = hoje.getDay();
            let diasParaAdicionar = diaEncontrado - diaAtual;
            if (diasParaAdicionar <= 0) diasParaAdicionar += 7;
            dataAlvo.setDate(hoje.getDate() + diasParaAdicionar);
        } else return null;
    }

    dataAlvo.setHours(horaAlvo, minutoAlvo, 0, 0);
    return dataAlvo;
}

function identificarAcao(texto: string): string | null {
    const t = texto.toLowerCase();
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