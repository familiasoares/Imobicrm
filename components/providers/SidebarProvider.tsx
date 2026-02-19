"use client";

import React, { createContext, useContext, useState, useCallback } from "react";

// -----------------------------------------------------------------------
// Types
// -----------------------------------------------------------------------
export type NavItemId =
    | "dashboard"
    | "kanban"
    | "leads"
    | "arquivados"
    | "equipe"
    | "assinatura"
    | "treinamentos";

interface SidebarContextValue {
    isOpen: boolean;        // mobile drawer state
    activePage: NavItemId;
    open: () => void;
    close: () => void;
    toggle: () => void;
    navigate: (page: NavItemId) => void;
}

// -----------------------------------------------------------------------
// Context
// -----------------------------------------------------------------------
const SidebarContext = createContext<SidebarContextValue | null>(null);

export function SidebarProvider({ children }: { children: React.ReactNode }) {
    const [isOpen, setIsOpen] = useState(false);
    const [activePage, setActivePage] = useState<NavItemId>("dashboard");

    const open = useCallback(() => setIsOpen(true), []);
    const close = useCallback(() => setIsOpen(false), []);
    const toggle = useCallback(() => setIsOpen((v) => !v), []);
    const navigate = useCallback((page: NavItemId) => {
        setActivePage(page);
        setIsOpen(false); // fecha o drawer mobile ao navegar
    }, []);

    return (
        <SidebarContext.Provider value={{ isOpen, activePage, open, close, toggle, navigate }}>
            {children}
        </SidebarContext.Provider>
    );
}

export function useSidebar() {
    const ctx = useContext(SidebarContext);
    if (!ctx) throw new Error("useSidebar must be used within SidebarProvider");
    return ctx;
}
