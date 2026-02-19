"use client";

import React, { useState, FormEvent, Suspense } from "react";
import { signIn } from "next-auth/react";
import { useRouter, useSearchParams } from "next/navigation";
import { Sparkles, Mail, Lock, LogIn, AlertCircle, Eye, EyeOff } from "lucide-react";

// 1. Subcomponente que utiliza useSearchParams
function LoginContent() {
    const router = useRouter();
    const searchParams = useSearchParams();
    const callbackUrl = searchParams.get("callbackUrl") ?? "/";

    const [email, setEmail] = useState("admin@imobicrm.com");
    const [password, setPassword] = useState("123456");
    const [showPass, setShowPass] = useState(false);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);

    const handleSubmit = async (e: FormEvent) => {
        e.preventDefault();
        setError(null);
        setLoading(true);

        try {
            const result = await signIn("credentials", {
                redirect: false,
                email,
                password,
            });

            if (result?.error) {
                setError("E-mail ou senha inválidos. Verifique e tente novamente.");
            } else {
                router.push(callbackUrl);
                router.refresh();
            }
        } catch {
            setError("Erro de conexão. Tente novamente.");
        } finally {
            setLoading(false);
        }
    };

    return (
        <div
            className="min-h-screen flex items-center justify-center p-4 relative overflow-hidden"
            style={{
                background: "#020617",
                backgroundImage: `
          radial-gradient(ellipse 70% 50% at 20% 20%, rgba(99,102,241,0.18) 0%, transparent 60%),
          radial-gradient(ellipse 50% 40% at 80% 80%, rgba(139,92,246,0.12) 0%, transparent 60%)
        `,
            }}
        >
            {/* Componentes Decorativos de Fundo */}
            <div
                className="pointer-events-none absolute inset-0 opacity-[0.03]"
                style={{
                    backgroundImage: `
            linear-gradient(rgba(255,255,255,0.8) 1px, transparent 1px),
            linear-gradient(90deg, rgba(255,255,255,0.8) 1px, transparent 1px)
          `,
                    backgroundSize: "60px 60px",
                }}
            />

            <div
                className="pointer-events-none absolute -top-32 -left-32 h-96 w-96 rounded-full opacity-20"
                style={{
                    background: "radial-gradient(circle, rgba(99,102,241,0.8) 0%, transparent 70%)",
                    filter: "blur(40px)",
                }}
            />
            <div
                className="pointer-events-none absolute -bottom-32 -right-32 h-80 w-80 rounded-full opacity-15"
                style={{
                    background: "radial-gradient(circle, rgba(139,92,246,0.8) 0%, transparent 70%)",
                    filter: "blur(40px)",
                }}
            />

            {/* Card de Login principal */}
            <div className="relative w-full max-w-md animate-fade-in" style={{ animationDuration: "0.4s" }}>
                <div
                    className="rounded-3xl p-8 sm:p-10"
                    style={{
                        background: "rgba(9, 15, 36, 0.85)",
                        border: "1px solid rgba(255,255,255,0.07)",
                        backdropFilter: "blur(24px)",
                        WebkitBackdropFilter: "blur(24px)",
                        boxShadow: "0 0 60px rgba(99,102,241,0.12), 0 32px 64px rgba(0,0,0,0.5), inset 0 1px 0 rgba(255,255,255,0.06)",
                    }}
                >
                    <div className="flex flex-col items-center mb-8">
                        <div
                            className="flex h-14 w-14 items-center justify-center rounded-2xl mb-4"
                            style={{
                                background: "linear-gradient(135deg, #6366f1 0%, #8b5cf6 100%)",
                                boxShadow: "0 0 32px rgba(99,102,241,0.5)",
                            }}
                        >
                            <Sparkles className="h-7 w-7 text-white" />
                        </div>
                        <h1 className="text-2xl font-bold text-white tracking-tight">ImobiCRM</h1>
                        <p className="text-sm text-slate-400 mt-1">Entre na sua conta para continuar</p>
                    </div>

                    {error && (
                        <div className="mb-5 rounded-xl px-4 py-3 flex items-start gap-3" style={{ background: "rgba(239,68,68,0.08)", border: "1px solid rgba(239,68,68,0.2)" }}>
                            <AlertCircle className="h-4 w-4 text-red-400 flex-shrink-0 mt-0.5" />
                            <p className="text-sm text-red-400">{error}</p>
                        </div>
                    )}

                    <form onSubmit={handleSubmit} className="space-y-4" noValidate>
                        <div className="space-y-1.5">
                            <label className="block text-xs font-semibold text-slate-400 uppercase tracking-wider">E-mail</label>
                            <div className="relative">
                                <Mail className="pointer-events-none absolute left-3.5 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-500" />
                                <input
                                    type="email"
                                    value={email}
                                    onChange={(e) => setEmail(e.target.value)}
                                    placeholder="seu@email.com"
                                    className="glass-input pl-10"
                                    disabled={loading}
                                />
                            </div>
                        </div>

                        <div className="space-y-1.5">
                            <label className="block text-xs font-semibold text-slate-400 uppercase tracking-wider">Senha</label>
                            <div className="relative">
                                <Lock className="pointer-events-none absolute left-3.5 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-500" />
                                <input
                                    type={showPass ? "text" : "password"}
                                    value={password}
                                    onChange={(e) => setPassword(e.target.value)}
                                    placeholder="••••••••"
                                    className="glass-input pl-10 pr-11"
                                    disabled={loading}
                                />
                                <button
                                    type="button"
                                    onClick={() => setShowPass((p) => !p)}
                                    className="absolute right-3.5 top-1/2 -translate-y-1/2 text-slate-500 hover:text-slate-300 transition-colors"
                                >
                                    {showPass ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                                </button>
                            </div>
                        </div>

                        <button
                            type="submit"
                            disabled={loading}
                            className="btn-brand w-full justify-center mt-2 disabled:opacity-60 disabled:cursor-not-allowed"
                        >
                            {loading ? (
                                <span className="flex items-center gap-2">
                                    <svg className="h-4 w-4 animate-spin" viewBox="0 0 24 24"><circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" fill="none" /><path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" /></svg>
                                    Entrando...
                                </span>
                            ) : (
                                <span className="flex items-center gap-2">
                                    <LogIn className="h-4 w-4" />
                                    Entrar
                                </span>
                            )}
                        </button>
                    </form>

                    <p className="mt-6 text-center text-xs text-slate-600">
                        Demo: <span className="text-slate-500">admin@imobicrm.com / 123456</span>
                    </p>
                </div>

                <p className="mt-5 text-center text-[11px] text-slate-700">
                    © {new Date().getFullYear()} ImobiCRM — Todos os direitos reservados
                </p>
            </div>
        </div>
    );
}

// 2. Export default com Suspense Boundary
export default function LoginPage() {
    return (
        <Suspense fallback={
            <div className="min-h-screen bg-[#020617] flex items-center justify-center">
                <div className="text-white text-center">
                    <div className="h-8 w-8 border-2 border-indigo-500 border-t-transparent rounded-full animate-spin mx-auto mb-4" />
                    <p className="text-sm text-slate-400">Carregando portal...</p>
                </div>
            </div>
        }>
            <LoginContent />
        </Suspense>
    );
}