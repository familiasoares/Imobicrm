"use client";

import React, { useEffect, useState } from "react";
import { AlertTriangle, X, CreditCard } from "lucide-react";
import { useRouter } from "next/navigation";

/**
 * SubscriptionBanner
 *
 * Shown site-wide when the subscription status is ATRASADA (overdue).
 * Reads the `crm_show_overdue_banner` cookie set by middleware.ts.
 * Dismissible per session (state only, banner reappears on next page load).
 */
export function SubscriptionBanner() {
    const [visible, setVisible] = useState(false);
    const router = useRouter();

    useEffect(() => {
        // Read the cookie that the middleware sets on every request when ATRASADA
        const hasCookie = document.cookie
            .split("; ")
            .some((row) => row.startsWith("crm_show_overdue_banner=1"));
        setVisible(hasCookie);
    }, []);

    if (!visible) return null;

    return (
        <div
            className="fixed top-0 left-0 right-0 z-[100] flex items-center justify-between gap-4 px-5 py-2.5"
            style={{
                background:
                    "linear-gradient(90deg, rgba(180,83,9,0.95) 0%, rgba(245,158,11,0.92) 100%)",
                borderBottom: "1px solid rgba(251,191,36,0.4)",
                backdropFilter: "blur(8px)",
                WebkitBackdropFilter: "blur(8px)",
            }}
            role="alert"
            aria-live="polite"
        >
            {/* Icon + message */}
            <div className="flex items-center gap-2.5 min-w-0">
                <AlertTriangle className="h-4 w-4 text-amber-100 flex-shrink-0" />
                <p className="text-sm font-medium text-amber-50 truncate">
                    <span className="font-bold">Atenção:</span> Sua assinatura está com pagamento em
                    atraso. Regularize agora para evitar o bloqueio do sistema.
                </p>
            </div>

            {/* Actions */}
            <div className="flex items-center gap-2 flex-shrink-0">
                <button
                    onClick={() => router.push("/assinatura")}
                    className="flex items-center gap-1.5 rounded-lg bg-white/20 px-3 py-1 text-xs font-semibold text-white transition-colors hover:bg-white/30"
                >
                    <CreditCard className="h-3.5 w-3.5" />
                    Regularizar
                </button>
                <button
                    onClick={() => setVisible(false)}
                    className="rounded-lg p-1 text-amber-100/70 transition-colors hover:bg-amber-900/30 hover:text-white"
                    aria-label="Dispensar alerta"
                >
                    <X className="h-4 w-4" />
                </button>
            </div>
        </div>
    );
}
