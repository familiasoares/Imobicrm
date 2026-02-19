// -----------------------------------------------------------------------
// lib/mock-leads.ts
// Dados falsos para desenvolvimento/protótipo da Lista de Leads
// -----------------------------------------------------------------------

export type LeadStatus =
    | "NOVO_LEAD"
    | "EM_ATENDIMENTO"
    | "VISITA"
    | "AGENDAMENTO"
    | "PROPOSTA"
    | "VENDA_FECHADA"
    | "VENDA_PERDIDA";

export interface Lead {
    id: string;
    nome: string;
    telefone: string;
    ddd: string;
    cidade: string;
    interesse: string;
    status: LeadStatus;
    corretor: string;
    isArquivado: boolean;
    updatedAt: string; // ISO string
    criadoEm: string;
}

export const MOCK_LEADS: Lead[] = [
    {
        id: "1",
        nome: "Carlos Eduardo Souza",
        telefone: "99182-3344",
        ddd: "11",
        cidade: "São Paulo",
        interesse: "Compra",
        status: "EM_ATENDIMENTO",
        corretor: "Juliana Mendes",
        isArquivado: false,
        updatedAt: "2026-02-18T10:30:00Z",
        criadoEm: "2026-02-10T08:00:00Z",
    },
    {
        id: "2",
        nome: "Ana Beatriz Lima",
        telefone: "98877-5566",
        ddd: "19",
        cidade: "Campinas",
        interesse: "Locação",
        status: "VISITA",
        corretor: "Ricardo Alves",
        isArquivado: false,
        updatedAt: "2026-02-17T15:00:00Z",
        criadoEm: "2026-02-08T09:15:00Z",
    },
    {
        id: "3",
        nome: "Marcos Antônio Pereira",
        telefone: "97654-1122",
        ddd: "21",
        cidade: "Rio de Janeiro",
        interesse: "Compra",
        status: "PROPOSTA",
        corretor: "Juliana Mendes",
        isArquivado: false,
        updatedAt: "2026-02-16T11:45:00Z",
        criadoEm: "2026-02-05T10:00:00Z",
    },
    {
        id: "4",
        nome: "Júlia Costa Ferreira",
        telefone: "96543-7788",
        ddd: "48",
        cidade: "Florianópolis",
        interesse: "Investimento",
        status: "NOVO_LEAD",
        corretor: "Pedro Santos",
        isArquivado: false,
        updatedAt: "2026-02-19T08:00:00Z",
        criadoEm: "2026-02-19T08:00:00Z",
    },
    {
        id: "5",
        nome: "Rafael Nunes Oliveira",
        telefone: "95432-9900",
        ddd: "31",
        cidade: "Belo Horizonte",
        interesse: "Compra",
        status: "VENDA_FECHADA",
        corretor: "Ricardo Alves",
        isArquivado: false,
        updatedAt: "2026-02-14T16:20:00Z",
        criadoEm: "2026-01-28T07:30:00Z",
    },
    {
        id: "6",
        nome: "Fernanda Almeida Castro",
        telefone: "94321-6677",
        ddd: "47",
        cidade: "Joinville",
        interesse: "Locação",
        status: "AGENDAMENTO",
        corretor: "Pedro Santos",
        isArquivado: false,
        updatedAt: "2026-02-15T09:10:00Z",
        criadoEm: "2026-02-01T11:00:00Z",
    },
    {
        id: "7",
        nome: "Lucas Gabriel Martins",
        telefone: "93210-4455",
        ddd: "51",
        cidade: "Porto Alegre",
        interesse: "Investimento",
        status: "EM_ATENDIMENTO",
        corretor: "Juliana Mendes",
        isArquivado: false,
        updatedAt: "2026-02-13T14:00:00Z",
        criadoEm: "2026-02-03T12:00:00Z",
    },
    {
        id: "8",
        nome: "Camila Rodrigues Dias",
        telefone: "92109-3344",
        ddd: "85",
        cidade: "Fortaleza",
        interesse: "Compra",
        status: "NOVO_LEAD",
        corretor: "Ricardo Alves",
        isArquivado: false,
        updatedAt: "2026-02-19T06:45:00Z",
        criadoEm: "2026-02-19T06:45:00Z",
    },
    {
        id: "9",
        nome: "Diego Henrique Barbosa",
        telefone: "91098-2233",
        ddd: "81",
        cidade: "Recife",
        interesse: "Locação",
        status: "VENDA_PERDIDA",
        corretor: "Pedro Santos",
        isArquivado: true,
        updatedAt: "2026-02-12T13:30:00Z",
        criadoEm: "2026-01-20T10:00:00Z",
    },
    {
        id: "10",
        nome: "Isabela Rocha Mendonça",
        telefone: "90987-1122",
        ddd: "41",
        cidade: "Curitiba",
        interesse: "Investimento",
        status: "VISITA",
        corretor: "Juliana Mendes",
        isArquivado: true,
        updatedAt: "2026-02-11T10:00:00Z",
        criadoEm: "2026-01-25T09:00:00Z",
    },
    {
        id: "11",
        nome: "Thiago Ferreira Lima",
        telefone: "89876-0011",
        ddd: "62",
        cidade: "Goiânia",
        interesse: "Compra",
        status: "VENDA_PERDIDA",
        corretor: "Ricardo Alves",
        isArquivado: true,
        updatedAt: "2026-02-09T17:00:00Z",
        criadoEm: "2026-01-15T08:00:00Z",
    },
];

// Helpers
export const ACTIVE_LEADS = MOCK_LEADS.filter((l) => !l.isArquivado);
export const ARCHIVED_LEADS = MOCK_LEADS.filter((l) => l.isArquivado);

export const STATUS_LABELS: Record<LeadStatus, string> = {
    NOVO_LEAD: "Novo Lead",
    EM_ATENDIMENTO: "Em Atendimento",
    VISITA: "Visita",
    AGENDAMENTO: "Agendamento",
    PROPOSTA: "Proposta",
    VENDA_FECHADA: "Venda Fechada",
    VENDA_PERDIDA: "Venda Perdida",
};

export const STATUS_BADGE: Record<LeadStatus, string> = {
    NOVO_LEAD: "badge-info",
    EM_ATENDIMENTO: "badge-warning",
    VISITA: "badge-warning",
    AGENDAMENTO: "badge-warning",
    PROPOSTA: "badge-info",
    VENDA_FECHADA: "badge-active",
    VENDA_PERDIDA: "badge-danger",
};

export const CIDADES = [...new Set(MOCK_LEADS.map((l) => l.cidade))].sort();
export const DDDS = [...new Set(MOCK_LEADS.map((l) => l.ddd))].sort();
export const INTERESSES = ["Compra", "Locação", "Investimento"];

/** Formata data para localidade brasileira */
export function formatDate(iso: string) {
    return new Date(iso).toLocaleDateString("pt-BR", {
        day: "2-digit",
        month: "2-digit",
        year: "numeric",
        hour: "2-digit",
        minute: "2-digit",
    });
}

/** Gera CSV a partir de um array de leads */
export function leadsToCSV(leads: Lead[]): string {
    const header = "Nome,Telefone,DDD,Cidade,Interesse,Status,Corretor,Última Atualização\n";
    const rows = leads
        .map((l) =>
            [
                `"${l.nome}"`,
                l.ddd + l.telefone,
                l.ddd,
                `"${l.cidade}"`,
                l.interesse,
                STATUS_LABELS[l.status],
                `"${l.corretor}"`,
                formatDate(l.updatedAt),
            ].join(",")
        )
        .join("\n");
    return header + rows;
}

/** Dispara download de um CSV no browser */
export function downloadCSV(content: string, filename: string) {
    const blob = new Blob([content], { type: "text/csv;charset=utf-8;" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = filename;
    a.click();
    URL.revokeObjectURL(url);
}
