"use client";

import React, {
    createContext,
    useCallback,
    useContext,
    useState,
} from "react";

// -----------------------------------------------------------------------
// Types
// -----------------------------------------------------------------------
export type LeadForModal = {
    id: string;
    nome: string;
    telefone: string;
    ddd: string;
    cidade: string;
    interesse: string;
    status: string;
    isArquivado: boolean;
};

type ModalState =
    | { type: "none" }
    | { type: "create" }
    | { type: "edit"; lead: LeadForModal };

type ModalContextType = {
    modal: ModalState;
    openCreate: () => void;
    openEdit: (lead: LeadForModal) => void;
    close: () => void;
};

// -----------------------------------------------------------------------
// Context
// -----------------------------------------------------------------------
const ModalContext = createContext<ModalContextType | null>(null);

export function useModal() {
    const ctx = useContext(ModalContext);
    if (!ctx) throw new Error("useModal must be used inside <ModalProvider>");
    return ctx;
}

// -----------------------------------------------------------------------
// Provider
// -----------------------------------------------------------------------
export function ModalProvider({ children }: { children: React.ReactNode }) {
    const [modal, setModal] = useState<ModalState>({ type: "none" });

    const openCreate = useCallback(() => setModal({ type: "create" }), []);
    const openEdit = useCallback((lead: LeadForModal) => setModal({ type: "edit", lead }), []);
    const close = useCallback(() => setModal({ type: "none" }), []);

    return (
        <ModalContext.Provider value={{ modal, openCreate, openEdit, close }}>
            {children}
        </ModalContext.Provider>
    );
}
