import { NextRequest, NextResponse } from "next/server";

// -----------------------------------------------------------------------
// Types for Asaas Webhook payload
// Reference: https://docs.asaas.com/reference/webhooks
// -----------------------------------------------------------------------
interface AsaasWebhookPayload {
    event: string;
    payment?: {
        id: string;
        customer: string;          // Asaas customer ID (maps to Subscription.asaasCustomerId)
        value: number;
        netValue: number;
        status: string;
        billingType: string;
        dueDate: string;
        paymentDate?: string;
        description?: string;
        externalReference?: string; // We can put our tenantId here when creating charges
    };
}

// -----------------------------------------------------------------------
// Asaas Webhook signature verification (production)
// -----------------------------------------------------------------------
async function verifyAsaasSignature(request: NextRequest): Promise<boolean> {
    /**
     * In production, Asaas sends a token in the header `asaas-access-token`.
     * Compare it against the secret stored in your env variable.
     *
     * const asaasToken = request.headers.get("asaas-access-token");
     * return asaasToken === process.env.ASAAS_WEBHOOK_TOKEN;
     *
     * For development/mock purposes we skip validation:
     */
    const isDev = process.env.NODE_ENV !== "production";
    if (isDev) return true;

    const asaasToken = request.headers.get("asaas-access-token");
    return asaasToken === process.env.ASAAS_WEBHOOK_TOKEN;
}

// -----------------------------------------------------------------------
// Event handlers — each returns a human-readable log message
// -----------------------------------------------------------------------

/**
 * PAYMENT_RECEIVED
 * Triggered when Asaas confirms a payment (Pix, boleto, card).
 * Action: Set the tenant's subscription to ATIVA.
 */
async function handlePaymentReceived(payload: AsaasWebhookPayload): Promise<string> {
    const payment = payload.payment;
    if (!payment) return "PAYMENT_RECEIVED: payload sem dados de pagamento.";

    const asaasCustomerId = payment.customer;
    const externalReference = payment.externalReference; // tenantId (if set on charge creation)

    /**
     * PRODUCTION TODO — Replace the block below with real Prisma calls:
     *
     * import { prisma } from "@/lib/prisma";
     *
     * const subscription = await prisma.subscription.findFirst({
     *   where: {
     *     OR: [
     *       { asaasCustomerId },
     *       { tenant: { id: externalReference ?? "" } },
     *     ],
     *   },
     * });
     *
     * if (!subscription) {
     *   console.error(`[Webhook] Assinatura não encontrada para customer: ${asaasCustomerId}`);
     *   return "Assinatura não encontrada.";
     * }
     *
     * await prisma.subscription.update({
     *   where: { id: subscription.id },
     *   data: {
     *     status: "ATIVA",
     *     dataVencimento: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000), // +30 days
     *   },
     * });
     */

    console.log(
        `[Webhook] PAYMENT_RECEIVED | customer=${asaasCustomerId} | ref=${externalReference} | value=R$${payment.value}`
    );

    return `OK: Subscription activated for customer ${asaasCustomerId}.`;
}

/**
 * PAYMENT_OVERDUE
 * Triggered when a payment becomes overdue.
 * Action: Set subscription to ATRASADA to enter the grace period.
 */
async function handlePaymentOverdue(payload: AsaasWebhookPayload): Promise<string> {
    const asaasCustomerId = payload.payment?.customer;
    if (!asaasCustomerId) return "PAYMENT_OVERDUE: customer não encontrado.";

    /**
     * PRODUCTION TODO:
     *
     * await prisma.subscription.updateMany({
     *   where: { asaasCustomerId },
     *   data: { status: "ATRASADA" },
     * });
     */

    console.log(`[Webhook] PAYMENT_OVERDUE | customer=${asaasCustomerId}`);
    return `OK: Subscription marked as ATRASADA for customer ${asaasCustomerId}.`;
}

/**
 * PAYMENT_DELETED / PAYMENT_REFUNDED
 * Triggered on cancellations/refunds.
 * Action: Set subscription to BLOQUEADA.
 */
async function handlePaymentCancelled(payload: AsaasWebhookPayload): Promise<string> {
    const asaasCustomerId = payload.payment?.customer;
    if (!asaasCustomerId) return "PAYMENT_CANCELLED: customer não encontrado.";

    /**
     * PRODUCTION TODO:
     *
     * await prisma.subscription.updateMany({
     *   where: { asaasCustomerId },
     *   data: { status: "BLOQUEADA" },
     * });
     */

    console.log(`[Webhook] PAYMENT_CANCELLED | customer=${asaasCustomerId}`);
    return `OK: Subscription BLOQUEADA for customer ${asaasCustomerId}.`;
}

// -----------------------------------------------------------------------
// Route handler
// -----------------------------------------------------------------------
export async function POST(request: NextRequest) {
    // 1. Verify signature
    const isValid = await verifyAsaasSignature(request);
    if (!isValid) {
        return NextResponse.json(
            { error: "Unauthorized: invalid Asaas token." },
            { status: 401 }
        );
    }

    // 2. Parse body
    let payload: AsaasWebhookPayload;
    try {
        payload = await request.json();
    } catch {
        return NextResponse.json({ error: "Invalid JSON payload." }, { status: 400 });
    }

    const { event } = payload;
    console.log(`[Webhook] Received event: ${event}`);

    // 3. Route to correct handler
    let result: string;
    try {
        switch (event) {
            case "PAYMENT_RECEIVED":
                result = await handlePaymentReceived(payload);
                break;
            case "PAYMENT_OVERDUE":
                result = await handlePaymentOverdue(payload);
                break;
            case "PAYMENT_DELETED":
            case "PAYMENT_REFUNDED":
                result = await handlePaymentCancelled(payload);
                break;
            default:
                // Unknown events: log and acknowledge (Asaas retries if we return non-2xx)
                console.log(`[Webhook] Unhandled event: ${event}`);
                result = `Event '${event}' received and acknowledged (no handler).`;
        }
    } catch (err) {
        console.error("[Webhook] Error processing event:", err);
        return NextResponse.json(
            { error: "Internal error processing webhook." },
            { status: 500 }
        );
    }

    // 4. Always return 200 to Asaas to prevent retries on our side
    return NextResponse.json({ received: true, message: result }, { status: 200 });
}

// Health check
export async function GET() {
    return NextResponse.json({
        status: "ok",
        endpoint: "Asaas Webhook Handler",
        supportedEvents: [
            "PAYMENT_RECEIVED",
            "PAYMENT_OVERDUE",
            "PAYMENT_DELETED",
            "PAYMENT_REFUNDED",
        ],
    });
}
