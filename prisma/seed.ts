import { PrismaClient, LeadStatus } from "@prisma/client";

const prisma = new PrismaClient();

async function main() {
    console.log("🌱 Iniciando seed do banco de dados...\n");

    // ── 1. TENANT ──────────────────────────────────────────────────────────
    const tenant = await prisma.tenant.upsert({
        where: { id: "tenant_001" },
        update: {},
        create: {
            id: "tenant_001",
            nome: "Imobiliária Horizonte Ltda.",
            cnpj: "12.345.678/0001-90",
        },
    });
    console.log(`✅ Tenant: ${tenant.nome} (${tenant.id})`);

    // ── 2. SUBSCRIPTION ─────────────────────────────────────────────────────
    await prisma.subscription.upsert({
        where: { tenantId: "tenant_001" },
        update: {},
        create: {
            tenantId: "tenant_001",
            status: "ATIVA",
            dataVencimento: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000), // +30 days
        },
    });
    console.log("✅ Subscription: ATIVA");

    // ── 3. USERS ─────────────────────────────────────────────────────────────
    // NOTE: In production, use bcrypt to hash passwords.
    // For seed/dev we store the plain string as a placeholder.

    const admin = await prisma.user.upsert({
        where: { email: "admin@imobicrm.com" },
        update: {},
        create: {
            id: "user_001",
            tenantId: "tenant_001",
            nome: "Carlos Admin",
            email: "admin@imobicrm.com",
            senha: "HASHED_IN_PROD_123456",   // TODO: bcrypt.hash("123456", 10)
            role: "GERENTE",
        },
    });
    console.log(`✅ User: ${admin.nome} (${admin.role})`);

    const corretor = await prisma.user.upsert({
        where: { email: "ana@imobicrm.com" },
        update: {},
        create: {
            id: "user_002",
            tenantId: "tenant_001",
            nome: "Ana Corretora",
            email: "ana@imobicrm.com",
            senha: "HASHED_IN_PROD_123456",
            role: "CORRETOR",
        },
    });
    console.log(`✅ User: ${corretor.nome} (${corretor.role})`);

    // ── 4. LEADS ─────────────────────────────────────────────────────────────
    const leadsData = [
        {
            id: "lead_001",
            tenantId: "tenant_001",
            userId: "user_001",
            nome: "Roberto Ferreira",
            telefone: "11 99876-5432",
            ddd: "11",
            cidade: "São Paulo",
            interesse: "Compra",
            status: "NOVO_LEAD" as LeadStatus,
            isArquivado: false,
        },
        {
            id: "lead_002",
            tenantId: "tenant_001",
            userId: "user_002",
            nome: "Mariana Costa",
            telefone: "21 98765-4321",
            ddd: "21",
            cidade: "Rio de Janeiro",
            interesse: "Locação",
            status: "EM_ATENDIMENTO" as LeadStatus,
            isArquivado: false,
        },
        {
            id: "lead_003",
            tenantId: "tenant_001",
            userId: "user_001",
            nome: "Pedro Alves",
            telefone: "47 97654-3210",
            ddd: "47",
            cidade: "Joinville",
            interesse: "Compra",
            status: "VISITA" as LeadStatus,
            isArquivado: false,
        },
        {
            id: "lead_004",
            tenantId: "tenant_001",
            userId: "user_002",
            nome: "Juliana Santos",
            telefone: "11 96543-2109",
            ddd: "11",
            cidade: "São Paulo",
            interesse: "Investimento",
            status: "PROPOSTA" as LeadStatus,
            isArquivado: false,
        },
    ];

    for (const lead of leadsData) {
        await prisma.lead.upsert({
            where: { id: lead.id },
            update: { status: lead.status },
            create: lead,
        });
        console.log(`✅ Lead: ${lead.nome} → ${lead.status}`);
    }

    console.log("\n🎉 Seed concluído com sucesso!");
}

main()
    .catch((e) => {
        console.error("❌ Erro no seed:", e);
        process.exit(1);
    })
    .finally(async () => {
        await prisma.$disconnect();
    });
