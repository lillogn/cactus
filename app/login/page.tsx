"use client";
// app/login/page.tsx
import { useState } from "react";
import { useRouter } from "next/navigation";
import { createClient } from "@/lib/supabase";
import { Eye, EyeOff, Loader2, Leaf } from "lucide-react";

export default function LoginPage() {
  const router = useRouter();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPw, setShowPw] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  async function handleLogin(e: React.FormEvent) {
    e.preventDefault();
    setLoading(true);
    setError("");

    const supabase = createClient();
    const { error: authErr } = await supabase.auth.signInWithPassword({ email, password });

    if (authErr) {
      setError(
        authErr.message === "Invalid login credentials"
          ? "Email o password non corretti."
          : authErr.message
      );
      setLoading(false);
      return;
    }

    router.push("/dashboard");
    router.refresh();
  }

  return (
    <div className="min-h-screen flex items-center justify-center relative overflow-hidden"
      style={{ background: "var(--bg-base)" }}>

      {/* Background geometric pattern */}
      <div className="absolute inset-0 pointer-events-none overflow-hidden">
        <svg className="absolute top-0 right-0 w-[600px] h-[600px] opacity-[0.03]"
          viewBox="0 0 600 600" fill="none">
          <circle cx="300" cy="300" r="280" stroke="#F97316" strokeWidth="1"/>
          <circle cx="300" cy="300" r="200" stroke="#F97316" strokeWidth="1"/>
          <circle cx="300" cy="300" r="120" stroke="#F97316" strokeWidth="1"/>
          <line x1="0" y1="300" x2="600" y2="300" stroke="#F97316" strokeWidth="0.5"/>
          <line x1="300" y1="0" x2="300" y2="600" stroke="#F97316" strokeWidth="0.5"/>
        </svg>
        <div className="absolute bottom-0 left-0 w-96 h-96 rounded-full opacity-[0.04]"
          style={{ background: "radial-gradient(circle, #F97316, transparent)", transform: "translate(-50%, 50%)" }}/>
      </div>

      <div className="relative w-full max-w-md px-6 animate-slide-up">
        {/* Logo */}
        <div className="mb-10 flex flex-col items-center gap-3">
          <div className="w-14 h-14 rounded-2xl flex items-center justify-center glow-accent"
            style={{ background: "linear-gradient(135deg, #F97316, #EA580C)" }}>
            <Leaf size={26} color="white" strokeWidth={2.5}/>
          </div>
          <div className="text-center">
            <h1 className="text-3xl font-bold tracking-tight"
              style={{ fontFamily: "'Syne', sans-serif", color: "var(--text-primary)" }}>
              CACTUS
            </h1>
            <p className="text-sm mt-1" style={{ color: "var(--text-secondary)" }}>
              Lead Generation · Campania
            </p>
          </div>
        </div>

        {/* Card */}
        <div className="rounded-2xl p-8 border"
          style={{ background: "var(--bg-surface)", borderColor: "var(--bg-border)" }}>
          <h2 className="text-lg font-semibold mb-6" style={{ fontFamily: "'Syne', sans-serif" }}>
            Accedi al tuo account
          </h2>

          <form onSubmit={handleLogin} className="space-y-4">
            <div>
              <label className="block text-sm mb-2" style={{ color: "var(--text-secondary)" }}>
                Email
              </label>
              <input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
                placeholder="nome@azienda.it"
                className="input-base w-full px-4 py-3 rounded-xl text-sm"
              />
            </div>

            <div>
              <label className="block text-sm mb-2" style={{ color: "var(--text-secondary)" }}>
                Password
              </label>
              <div className="relative">
                <input
                  type={showPw ? "text" : "password"}
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  required
                  placeholder="••••••••"
                  className="input-base w-full px-4 py-3 pr-11 rounded-xl text-sm"
                />
                <button
                  type="button"
                  onClick={() => setShowPw(!showPw)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 transition-colors"
                  style={{ color: "var(--text-muted)" }}>
                  {showPw ? <EyeOff size={16}/> : <Eye size={16}/>}
                </button>
              </div>
            </div>

            {error && (
              <div className="px-4 py-3 rounded-xl text-sm animate-fade-in"
                style={{ background: "rgba(239,68,68,0.08)", color: "#EF4444", border: "1px solid rgba(239,68,68,0.2)" }}>
                {error}
              </div>
            )}

            <button
              type="submit"
              disabled={loading}
              className="w-full py-3 rounded-xl font-semibold text-sm transition-all duration-200 flex items-center justify-center gap-2 mt-2"
              style={{
                background: loading ? "var(--bg-elevated)" : "linear-gradient(135deg, #F97316, #EA580C)",
                color: loading ? "var(--text-muted)" : "white",
              }}>
              {loading ? <><Loader2 size={16} className="animate-spin"/> Accesso...</> : "Accedi"}
            </button>
          </form>
        </div>

        <p className="text-center text-xs mt-6" style={{ color: "var(--text-muted)" }}>
          Accesso riservato al team interno
        </p>
      </div>
    </div>
  );
}
