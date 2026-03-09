"use client";
// components/Sidebar.tsx
import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { Search, Star, Clock, LogOut, Leaf, ChevronRight } from "lucide-react";
import { createClient } from "@/lib/supabase";
import clsx from "clsx";

const NAV = [
  { href: "/dashboard", icon: Search, label: "Cerca Lead" },
  { href: "/dashboard/favorites", icon: Star, label: "Preferiti" },
  { href: "/dashboard/history", icon: Clock, label: "Cronologia" },
];

export default function Sidebar({ userEmail }: { userEmail: string }) {
  const pathname = usePathname();
  const router = useRouter();

  async function handleLogout() {
    const supabase = createClient();
    await supabase.auth.signOut();
    router.push("/login");
    router.refresh();
  }

  return (
    <aside className="w-60 flex flex-col shrink-0 border-r"
      style={{ background: "var(--bg-surface)", borderColor: "var(--bg-border)" }}>

      {/* Logo */}
      <div className="h-16 flex items-center gap-3 px-5 border-b"
        style={{ borderColor: "var(--bg-border)" }}>
        <div className="w-8 h-8 rounded-lg flex items-center justify-center shrink-0"
          style={{ background: "linear-gradient(135deg, #F97316, #EA580C)" }}>
          <Leaf size={16} color="white" strokeWidth={2.5}/>
        </div>
        <span className="font-bold text-lg tracking-tight"
          style={{ fontFamily: "'Syne', sans-serif", color: "var(--text-primary)" }}>
          CACTUS
        </span>
      </div>

      {/* Navigation */}
      <nav className="flex-1 px-3 py-4 space-y-1">
        <p className="px-2 mb-3 text-xs font-medium tracking-widest uppercase"
          style={{ color: "var(--text-muted)", fontFamily: "'JetBrains Mono', monospace" }}>
          Strumenti
        </p>
        {NAV.map(({ href, icon: Icon, label }) => {
          const active = pathname === href;
          return (
            <Link key={href} href={href}
              className={clsx(
                "flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm transition-all duration-150 group",
                active
                  ? "font-medium"
                  : "hover:bg-white/[0.03]"
              )}
              style={{
                background: active ? "rgba(249,115,22,0.1)" : undefined,
                color: active ? "#F97316" : "var(--text-secondary)",
                border: active ? "1px solid rgba(249,115,22,0.15)" : "1px solid transparent",
              }}>
              <Icon size={16} strokeWidth={active ? 2 : 1.5}/>
              <span>{label}</span>
              {active && <ChevronRight size={12} className="ml-auto opacity-50"/>}
            </Link>
          );
        })}
      </nav>

      {/* User */}
      <div className="p-3 border-t" style={{ borderColor: "var(--bg-border)" }}>
        <div className="px-3 py-2 rounded-xl flex items-center gap-3"
          style={{ background: "var(--bg-elevated)" }}>
          <div className="w-7 h-7 rounded-full flex items-center justify-center text-xs font-bold shrink-0"
            style={{ background: "rgba(249,115,22,0.15)", color: "#F97316" }}>
            {userEmail[0]?.toUpperCase()}
          </div>
          <span className="text-xs truncate flex-1" style={{ color: "var(--text-secondary)" }}>
            {userEmail}
          </span>
          <button onClick={handleLogout} className="transition-colors hover:text-red-400 shrink-0"
            style={{ color: "var(--text-muted)" }} title="Esci">
            <LogOut size={14}/>
          </button>
        </div>
      </div>
    </aside>
  );
}
