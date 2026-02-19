import type { Config } from "tailwindcss";

const config: Config = {
    content: [
        "./app/**/*.{js,ts,jsx,tsx,mdx}",
        "./components/**/*.{js,ts,jsx,tsx,mdx}",
    ],
    darkMode: "class",
    theme: {
        extend: {
            fontFamily: {
                sans: ["Inter", "sans-serif"],
            },
            colors: {
                // Design system tokens — glassmorphism dark CRM
                glass: {
                    bg: "rgba(15, 23, 42, 0.6)",
                    border: "rgba(255, 255, 255, 0.08)",
                    hover: "rgba(255, 255, 255, 0.05)",
                },
                brand: {
                    50: "#f0f4ff",
                    100: "#e0eaff",
                    400: "#818cf8",
                    500: "#6366f1",
                    600: "#4f46e5",
                    700: "#4338ca",
                    900: "#1e1b4b",
                },
                surface: {
                    900: "#020617",  // background base
                    800: "#0f172a",  // sidebar / cards
                    700: "#1e293b",  // borders / dividers
                    600: "#334155",  // muted elements
                },
            },
            backgroundImage: {
                "brand-gradient": "linear-gradient(135deg, #6366f1 0%, #8b5cf6 100%)",
                "glow-brand": "radial-gradient(circle at 50% 0%, rgba(99,102,241,0.18) 0%, transparent 70%)",
            },
            boxShadow: {
                glass: "0 4px 24px rgba(0,0,0,0.4), inset 0 1px 0 rgba(255,255,255,0.07)",
                brand: "0 0 24px rgba(99,102,241,0.35)",
                glow: "0 0 40px rgba(99,102,241,0.25)",
            },
            backdropBlur: {
                xs: "2px",
            },
            keyframes: {
                fadeIn: {
                    from: { opacity: "0", transform: "translateY(8px)" },
                    to: { opacity: "1", transform: "translateY(0)" },
                },
                slideInLeft: {
                    from: { opacity: "0", transform: "translateX(-100%)" },
                    to: { opacity: "1", transform: "translateX(0)" },
                },
                pulseGlow: {
                    "0%, 100%": { boxShadow: "0 0 20px rgba(99,102,241,0.3)" },
                    "50%": { boxShadow: "0 0 40px rgba(99,102,241,0.6)" },
                },
            },
            animation: {
                "fade-in": "fadeIn 0.35s ease forwards",
                "slide-in-left": "slideInLeft 0.3s ease forwards",
                "pulse-glow": "pulseGlow 2.5s ease-in-out infinite",
            },
        },
    },
    plugins: [],
};

export default config;
