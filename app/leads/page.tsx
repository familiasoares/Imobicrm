import { Users } from "lucide-react";
import { getLeads } from "@/app/actions/lead.actions";
import { LeadsClient } from "@/components/leads/LeadsClient";

// 🚀 TRAVA ANTI-CACHE DA VERCEL
export const dynamic = "force-dynamic";
export const revalidate = 0;

export default async function LeadsPage() {
    let dbLeads: Awaited<ReturnType<typeof getLeads>> = [];
    try {
        dbLeads = await getLeads();
    } catch {
        dbLeads = [];
    }

    // Pedágio com os novos campos liberados
    const leads: any[] = dbLeads.map((l: any) => ({
        id: l.id,
        nome: l.nome,
        telefone: l.telefone,
        ddd: l.ddd,
        cidade: l.cidade,
        interesse: l.interesse,
        status: l.status,
        corretor: l.corretor?.nome ?? "—",
        isArquivado: l.isArquivado,
        updatedAt: l.updatedAt.toISOString(),
        criadoEm: l.criadoEm.toISOString(),
        observacoes: l.observacoes || "",
        history: l.history || [],
    }));

    return (
        <div className="space-y-5 max-w-7xl mx-auto animate-fade-in">
            <div className="flex items-center gap-2 print:hidden sr-only">
                <Users className="h-5 w-5 text-indigo-400" />
                <h1 className="text-xl font-bold text-white">Lista de Leads</h1>
            </div>
            <LeadsClient initialLeads={leads} />
        </div>
    );
}