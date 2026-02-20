"use client";

import { Suspense, useState } from "react";
import { signIn } from "next-auth/react";
import { useRouter, useSearchParams } from "next/navigation";

// 1. Separamos o formulário (que usa o useSearchParams) em um subcomponente
function LoginForm() {
    const router = useRouter();
    const searchParams = useSearchParams();
    const error = searchParams?.get("error");

    const [email, setEmail] = useState("");
    const [password, setPassword] = useState("");
    const [loading, setLoading] = useState(false);

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setLoading(true);

        const result = await signIn("credentials", {
            email,
            password,
            redirect: false,
        });

        if (result?.error) {
            setLoading(false);
            // Aqui você poderia colocar um toast de erro
        } else {
            router.push("/");
            router.refresh();
        }
    };

    return (
        <div className="bg-white/10 backdrop-blur-md p-8 rounded-2xl border border-white/20 shadow-2xl w-full max-w-md">
            <div className="text-center mb-8">
                <h1 className="text-3xl font-bold text-white mb-2">ImobiCRM</h1>
                <p className="text-gray-300">Faça login para acessar o painel</p>
            </div>

            {error && (
                <div className="bg-red-500/20 border border-red-500 text-red-100 p-3 rounded-lg mb-6 text-sm text-center">
                    Credenciais inválidas. Tente novamente.
                </div>
            )}

            <form onSubmit={handleSubmit} className="space-y-6">
                <div>
                    <label className="block text-sm font-medium text-gray-200 mb-2">E-mail</label>
                    <input
                        type="email"
                        value={email}
                        onChange={(e) => setEmail(e.target.value)}
                        className="w-full px-4 py-3 bg-black/30 border border-white/10 rounded-lg text-white focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all outline-none"
                        placeholder="admin@imobicrm.com"
                        required
                    />
                </div>

                <div>
                    <label className="block text-sm font-medium text-gray-200 mb-2">Senha</label>
                    <input
                        type="password"
                        value={password}
                        onChange={(e) => setPassword(e.target.value)}
                        className="w-full px-4 py-3 bg-black/30 border border-white/10 rounded-lg text-white focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all outline-none"
                        placeholder="••••••"
                        required
                    />
                </div>

                <button
                    type="submit"
                    disabled={loading}
                    className="w-full bg-blue-600 hover:bg-blue-700 text-white font-medium py-3 rounded-lg transition-colors flex justify-center items-center"
                >
                    {loading ? "Entrando..." : "Entrar no Sistema"}
                </button>
            </form>
        </div>
    );
}

// 2. A página principal agora é apenas uma "sala de espera" (Suspense) que carrega o formulário
export default function LoginPage() {
    return (
        <div className="min-h-screen bg-slate-900 flex items-center justify-center p-4">
            <Suspense fallback={<div className="text-white text-xl animate-pulse">Carregando portaria...</div>}>
                <LoginForm />
            </Suspense>
        </div>
    );
} 