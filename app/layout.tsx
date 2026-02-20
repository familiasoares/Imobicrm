import type { Metadata } from "next";
import "./globals.css";
import { NextAuthSessionProvider } from "@/components/providers/NextAuthSessionProvider";
import { ModalProvider } from "@/components/providers/ModalProvider";
import { ToastProvider } from "@/components/ui/Toast";
import { LayoutShell } from "@/components/layout/LayoutShell";
import { CreateLeadModal } from "@/components/leads/CreateLeadModal";
import { EditLeadModal } from "@/components/leads/EditLeadModal";

export const metadata: Metadata = {
    title: "ImobiCRM — Gestão de Leads Imobiliários",
    description: "CRM SaaS multi-tenant para gestão de leads imobiliários.",
};

export default function RootLayout({
    children,
}: {
    children: React.ReactNode;
}) {
    return (
        <html lang="pt-BR" className="dark">
            <head>
                <link rel="preconnect" href="https://fonts.googleapis.com" />
                <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="anonymous" />
            </head>
            <body className="bg-black">
                <NextAuthSessionProvider>
                    <ModalProvider>
                        <ToastProvider>
                            <LayoutShell>
                                {children}
                            </LayoutShell>

                            {/* Modais Globais */}
                            <CreateLeadModal />
                            <EditLeadModal />
                        </ToastProvider>
                    </ModalProvider>
                </NextAuthSessionProvider>
            </body>
        </html>
    );
}