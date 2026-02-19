"use client";

import React, {
    createContext,
    useCallback,
    useContext,
    useEffect,
    useRef,
    useState,
} from "react";
import { CheckCircle2, XCircle, AlertTriangle, X } from "lucide-react";

// -----------------------------------------------------------------------
// Types
// -----------------------------------------------------------------------
export type ToastVariant = "success" | "error" | "warning";

type Toast = {
    id: string;
    message: string;
    variant: ToastVariant;
};

type ToastContextType = {
    toast: (message: string, variant?: ToastVariant) => void;
};

const ToastContext = createContext<ToastContextType | null>(null);

export function useToast() {
    const ctx = useContext(ToastContext);
    if (!ctx) throw new Error("useToast must be inside <ToastProvider>");
    return ctx;
}

// -----------------------------------------------------------------------
// Individual toast item
// -----------------------------------------------------------------------
const ICONS: Record<ToastVariant, React.ElementType> = {
    success: CheckCircle2,
    error: XCircle,
    warning: AlertTriangle,
};
const COLORS: Record<ToastVariant, { bg: string; border: string; icon: string }> = {
    success: { bg: "rgba(16,185,129,0.08)", border: "rgba(16,185,129,0.25)", icon: "#10b981" },
    error: { bg: "rgba(239,68,68,0.08)", border: "rgba(239,68,68,0.25)", icon: "#ef4444" },
    warning: { bg: "rgba(245,158,11,0.08)", border: "rgba(245,158,11,0.25)", icon: "#f59e0b" },
};

function ToastItem({
    toast,
    onRemove,
}: {
    toast: Toast;
    onRemove: (id: string) => void;
}) {
    const timerRef = useRef<ReturnType<typeof setTimeout> | undefined>(undefined);
    const [visible, setVisible] = useState(false);

    // Animate in
    useEffect(() => {
        requestAnimationFrame(() => setVisible(true));
        timerRef.current = setTimeout(() => {
            setVisible(false);
            setTimeout(() => onRemove(toast.id), 300);
        }, 4000);
        return () => clearTimeout(timerRef.current);
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, []);

    const handleDismiss = () => {
        clearTimeout(timerRef.current);
        setVisible(false);
        setTimeout(() => onRemove(toast.id), 300);
    };

    const color = COLORS[toast.variant];
    const Icon = ICONS[toast.variant];

    return (
        <div
            role="alert"
            className="flex items-start gap-3 rounded-xl px-4 py-3 shadow-2xl transition-all duration-300"
            style={{
                background: color.bg,
                border: `1px solid ${color.border}`,
                backdropFilter: "blur(16px)",
                WebkitBackdropFilter: "blur(16px)",
                maxWidth: "340px",
                width: "100%",
                opacity: visible ? 1 : 0,
                transform: visible ? "translateX(0)" : "translateX(100%)",
            }}
        >
            <Icon className="h-4 w-4 flex-shrink-0 mt-0.5" style={{ color: color.icon }} />
            <p className="flex-1 text-sm text-slate-200">{toast.message}</p>
            <button
                onClick={handleDismiss}
                className="text-slate-500 hover:text-slate-300 transition-colors flex-shrink-0"
                aria-label="Fechar"
            >
                <X className="h-3.5 w-3.5" />
            </button>
        </div>
    );
}

// -----------------------------------------------------------------------
// Provider + renderer
// -----------------------------------------------------------------------
export function ToastProvider({ children }: { children: React.ReactNode }) {
    const [toasts, setToasts] = useState<Toast[]>([]);

    const toast = useCallback((message: string, variant: ToastVariant = "success") => {
        const id = Math.random().toString(36).slice(2);
        setToasts((prev) => [...prev, { id, message, variant }]);
    }, []);

    const remove = useCallback((id: string) => {
        setToasts((prev) => prev.filter((t) => t.id !== id));
    }, []);

    return (
        <ToastContext.Provider value={{ toast }}>
            {children}

            {/* Fixed toast container — bottom-right */}
            <div
                aria-live="polite"
                className="fixed bottom-5 right-5 z-[100] flex flex-col gap-2 pointer-events-none"
            >
                {toasts.map((t) => (
                    <div key={t.id} className="pointer-events-auto">
                        <ToastItem toast={t} onRemove={remove} />
                    </div>
                ))}
            </div>
        </ToastContext.Provider>
    );
}
