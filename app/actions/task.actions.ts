"use server";

import { revalidatePath } from "next/cache";
import { prisma } from "@/lib/prisma";
import { getServerAuthSession } from "@/lib/auth";

// Busca todas as tarefas da imobiliária (Tenant)
export async function getTasks() {
    const session = await getServerAuthSession();
    if (!session?.user?.tenantId) throw new Error("Não autorizado.");

    return prisma.task.findMany({
        where: {
            tenantId: session.user.tenantId,
        },
        include: {
            // Traz os dados do Lead junto para podermos chamar no WhatsApp
            lead: { select: { id: true, nome: true, ddd: true, telefone: true } }
        },
        orderBy: { dataAgendada: "asc" }, // Ordena da mais antiga/urgente para a mais no futuro
    });
}

// Marca a tarefa como concluída ou pendente
export async function toggleTaskCompletion(taskId: string, concluida: boolean) {
    const session = await getServerAuthSession();
    if (!session?.user?.tenantId) throw new Error("Não autorizado.");

    await prisma.task.update({
        where: {
            id: taskId,
            tenantId: session.user.tenantId
        },
        data: { concluida },
    });

    revalidatePath("/agenda");
}