import { PrismaClient } from "@prisma/client";
import bcrypt from "bcryptjs";

const prisma = new PrismaClient();

async function main() {
    console.log("🌱 Iniciando seed do banco de dados (Neon/PostgreSQL)...");

    // 1. Criar o Tenant
    const tenant = await prisma.tenant.upsert({
        where: { id: "tenant_principal" },
        update: { nome: "Minha Imobiliária" },
        create: {
            id: "tenant_principal",
            nome: "Minha Imobiliária",
            cnpj: "00.000.000/0001-00",
        },
    });

    console.log(`✅ Tenant criado: ${tenant.nome}`);

    // 2. Ativar a Assinatura (para evitar bloqueios do sistema)
    await prisma.subscription.upsert({
        where: { tenantId: tenant.id },
        update: { status: "ATIVA" },
        create: {
            tenantId: tenant.id,
            status: "ATIVA",
            dataVencimento: new Date(new Date().setFullYear(new Date().getFullYear() + 1)),
        },
    });

    console.log("✅ Assinatura ativa configurada.");

    // 3. Criar Usuário Administrador
    const email = "admin@imobicrm.com";
    const passwordRaw = "123456";
    const hashedPassword = await bcrypt.hash(passwordRaw, 10);

    const admin = await prisma.user.upsert({
        where: { email },
        update: { senha: hashedPassword },
        create: {
            id: "user_admin_001",
            tenantId: tenant.id,
            nome: "Administrador Sistema",
            email: email,
            senha: hashedPassword,
            role: "GERENTE",
        },
    });

    console.log(`✅ Usuário Admin criado: ${admin.email}`);
    console.log(`🔑 Senha definida como: ${passwordRaw}`);
}

main()
    .catch((e) => {
        console.error("❌ Erro durante o seed:", e);
        process.exit(1);
    })
    .finally(async () => {
        await prisma.$disconnect();
    });
const tenant2 = await prisma.tenant.create({
    data: {
        nome: "Imobiliária Litoral",
        users: {
            create: {
                nome: "Corretor VIP",
                email: "vip@litoral.com",
                senha: await bcrypt.hash("123456", 10),
                role: "GERENTE",
            },
        },
    },
});