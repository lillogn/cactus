"use client";
// app/dashboard/history/page.tsx
import { useEffect, useState } from "react";
import { Clock, Loader2, Database, Wifi, MapPin } from "lucide-react";

interface SearchRecord {
  id: string;
  city: string;
  neighborhood: string | null;
  category: string;
  results_count: number;
  leads_count: number;
  from_cache: boolean;
  created_at: string;
}

const CITY_LABELS: Record<string, string> = {
  napoli: "Napoli", salerno: "Salerno", caserta: "Caserta",
  benevento: "Benevento", avellino: "Avellino", pozzuoli: "Pozzuoli",
  torre_del_greco: "Torre del Greco", giugliano: "Giugliano",
  castellammare: "Castellammare di Stabia", amalfi: "Amalfi",
  sorrento: "Sorrento", pompei: "Pompei", ercolano: "Ercolano",
};

export default function HistoryPage() {
  const [searches, setSearches] = useState<SearchRecord[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetch("/api/history")
      .then((r) => r.json())
      .then((d) => setSearches(d.searches ?? []))
      .finally(() => setLoading(false));
  }, []);

  function formatDate(iso: string) {
    const d = new Date(iso);
    return d.toLocaleDateString("it-IT", {
      day: "2-digit", month: "short", year: "numeric",
      hour: "2-digit", minute: "2-digit",
    });
  }

  return (
    <div className="p-8">
      <div className="mb-8">
        <h1 className="font-bold text-xl mb-1"
          style={{ fontFamily: "'Syne', sans-serif", color: "var(--text-primary)" }}>
          Cronologia Ricerche
        </h1>
        <p className="text-sm" style={{ color: "var(--text-muted)" }}>
          Ultime 50 ricerche effettuate
        </p>
      </div>

      {loading ? (
        <div className="flex items-center justify-center py-20">
          <Loader2 size={24} className="animate-spin" style={{ color: "var(--text-muted)" }}/>
        </div>
      ) : searches.length === 0 ? (
        <div className="rounded-2xl border flex flex-col items-center justify-center py-20"
          style={{ background: "var(--bg-surface)", borderColor: "var(--bg-border)" }}>
          <Clock size={32} className="mb-4 opacity-20"/>
          <h3 className="font-semibold mb-2" style={{ fontFamily: "'Syne', sans-serif" }}>
            Nessuna ricerca ancora
          </h3>
          <p className="text-sm" style={{ color: "var(--text-muted)" }}>
            Le tue ricerche appariranno qui.
          </p>
        </div>
      ) : (
        <div className="rounded-2xl border overflow-hidden"
          style={{ background: "var(--bg-surface)", borderColor: "var(--bg-border)" }}>
          <table className="w-full data-table">
            <thead>
              <tr style={{ borderBottom: "1px solid var(--bg-border)" }}>
                {["DATA", "CITTÀ", "ZONA", "CATEGORIA", "LEAD TROVATI", "FONTE"].map((h) => (
                  <th key={h} className="px-5 py-3.5 text-left"
                    style={{ color: "var(--text-muted)", fontFamily: "'JetBrains Mono', monospace", fontSize: "0.7rem", letterSpacing: "0.08em" }}>
                    {h}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody>
              {searches.map((s) => (
                <tr key={s.id} className="border-b" style={{ borderColor: "var(--bg-border)" }}>
                  <td className="px-5 py-3.5">
                    <span className="text-xs" style={{ color: "var(--text-muted)", fontFamily: "'JetBrains Mono', monospace" }}>
                      {formatDate(s.created_at)}
                    </span>
                  </td>
                  <td className="px-5 py-3.5">
                    <span className="flex items-center gap-1.5 text-sm" style={{ color: "var(--text-primary)" }}>
                      <MapPin size={11} style={{ color: "#F97316" }}/>
                      {CITY_LABELS[s.city] ?? s.city}
                    </span>
                  </td>
                  <td className="px-5 py-3.5">
                    <span className="text-sm" style={{ color: "var(--text-secondary)" }}>
                      {s.neighborhood || "—"}
                    </span>
                  </td>
                  <td className="px-5 py-3.5">
                    <span className="px-2 py-1 rounded-lg text-xs"
                      style={{ background: "var(--bg-elevated)", color: "var(--text-secondary)" }}>
                      {s.category}
                    </span>
                  </td>
                  <td className="px-5 py-3.5">
                    <span className="font-bold text-sm" style={{
                      color: s.leads_count > 0 ? "#F97316" : "var(--text-muted)",
                      fontFamily: "'JetBrains Mono', monospace",
                    }}>
                      {s.leads_count}
                    </span>
                    {s.results_count !== s.leads_count && (
                      <span className="text-xs ml-1" style={{ color: "var(--text-muted)" }}>
                        / {s.results_count}
                      </span>
                    )}
                  </td>
                  <td className="px-5 py-3.5">
                    <span className="flex items-center gap-1.5 text-xs px-2 py-1 rounded-full w-fit"
                      style={{
                        background: s.from_cache ? "rgba(96,165,250,0.1)" : "rgba(34,197,94,0.1)",
                        color: s.from_cache ? "#60A5FA" : "#22C55E",
                      }}>
                      {s.from_cache ? <><Database size={9}/>cache</> : <><Wifi size={9}/>live</>}
                    </span>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}
