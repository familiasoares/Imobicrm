// app/leads/page.tsx
// Server Component — fetches leads from the database via Server Action
// and maps them to the Lead shape expected by LeadTable / LeadsClient.
// No "use client" — this runs on the server on every request after revalidatePath().

import { Users } from "lucide-react";
import { getLeads } from "@/app/actions/lead.actions";
import { LeadsClient } from "@/components/leads/LeadsClient";
import type { Lead } from "@/lib/mock-leads";

export default async function LeadsPage() {
    // Fetch active leads for the logged-in tenant directly from DB
    let dbLeads: Awaited<ReturnType<typeof getLeads>> = [];
    try {
        dbLeads = await getLeads();
    } catch {
        // Not authenticated — middleware will redirect to /login before this runs,
        // but we handle it defensively to avoid an unhandled error.
        dbLeads = [];
    }

    // Map Prisma Lead → lib/mock-leads Lead shape so LeadTable works unchanged
    const leads: Lead[] = dbLeads.map((l: (typeof dbLeads)[0]) => ({

        id: l.id,
        nome: l.nome,
        telefone: l.telefone,
        ddd: l.ddd,
        cidade: l.cidade,
        interesse: l.interesse,
        status: l.status as Lead["status"],
        corretor: l.corretor?.nome ?? "—",       // flatten nested object → string
        isArquivado: l.isArquivado,
        updatedAt: l.updatedAt.toISOString(),      // Date → ISO string
        criadoEm: l.criadoEm.toISOString(),
    }));

    return (
        <div className="space-y-5 max-w-7xl mx-auto animate-fade-in">
            {/* Page header (server-rendered for SEO) */}
            <div className="flex items-center gap-2 print:hidden sr-only">
                <Users className="h-5 w-5 text-indigo-400" />
                <h1 className="text-xl font-bold text-white">Lista de Leads</h1>
            </div>

            {/* Client shell handles all interactivity, stays in sync via useEffect */}
            <LeadsClient initialLeads={leads} />
        </div>
    );
}
