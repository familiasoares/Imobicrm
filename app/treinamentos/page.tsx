import { GraduationCap } from "lucide-react";

export default function TreinamentosPage() {
    return (
        <div className="flex h-[60vh] items-center justify-center animate-fade-in">
            <div className="glass-card p-10 text-center space-y-4">
                <div className="mx-auto flex h-14 w-14 items-center justify-center rounded-2xl"
                    style={{ background: "linear-gradient(135deg,#8b5cf6,#a78bfa)" }}>
                    <GraduationCap className="h-7 w-7 text-white" />
                </div>
                <h2 className="text-xl font-bold text-white">Treinamentos</h2>
                <p className="text-slate-400 text-sm max-w-xs">
                    Vídeos e tutoriais sobre como utilizar a plataforma serão disponibilizados aqui.
                </p>
            </div>
        </div>
    );
}
