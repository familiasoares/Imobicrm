import { getLeads } from "@/app/actions/lead.actions";
import { KanbanBoard } from "@/components/kanban/KanbanBoard";

/**
 * Kanban page — Server Component.
 * Fetches leads on the server (multi-tenant safe via requireSession inside getLeads),
 * then passes them to the interactive KanbanBoard Client Component.
 */
export default async function KanbanPage() {
    const leads = await getLeads();

    return <KanbanBoard initialLeads={leads} />;
}
