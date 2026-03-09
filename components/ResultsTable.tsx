"use client";
// components/ResultsTable.tsx
import { useState, useMemo } from "react";
import { Download, Star, ExternalLink, Phone, MapPin, TrendingUp, ArrowUpDown, Database, Wifi } from "lucide-react";
import type { Lead, SearchState } from "@/app/dashboard/page";
import { exportToCSV, exportToExcel } from "@/lib/export";
import { calcLeadScore } from "@/lib/lead-score";
import { formatType } from "@/lib/google-places";
import clsx from "clsx";

interface ResultsTableProps {
  leads: Lead[];
  searchState: SearchState;
  onSelectLead: (lead: Lead) => void;
  selectedLead: Lead | null;
}

type SortKey = "name" | "rating" | "reviews_count" | "score";
type SortDir = "asc" | "desc";

const SKELETON_ROWS = 6;

export default function ResultsTable({ leads, searchState, onSelectLead, selectedLead }: ResultsTableProps) {
  const [sort, setSort] = useState<{ key: SortKey; dir: SortDir }>({ key: "score", dir: "desc" });
  const [filter, setFilter] = useState("");
  const [showExportMenu, setShowExportMenu] = useState(false);

  const leadsWithScore = useMemo(() =>
    leads.map((l) => ({ ...l, _score: calcLeadScore(l) })),
    [leads]
  );

  const filtered = useMemo(() => {
    let items = leadsWithScore;
    if (filter) {
      const q = filter.toLowerCase();
      items = items.filter((l) =>
        l.name.toLowerCase().includes(q) ||
        l.address.toLowerCase().includes(q) ||
        (l.phone ?? "").includes(q)
      );
    }
    return [...items].sort((a, b) => {
      let va: number, vb: number;
      if (sort.key === "score") { va = a._score.score; vb = b._score.score; }
      else if (sort.key === "rating") { va = a.rating ?? 0; vb = b.rating ?? 0; }
      else if (sort.key === "reviews_count") { va = a.reviews_count ?? 0; vb = b.reviews_count ?? 0; }
      else { return sort.dir === "asc" ? a.name.localeCompare(b.name) : b.name.localeCompare(a.name); }
      return sort.dir === "asc" ? va - vb : vb - va;
    });
  }, [leadsWithScore, filter, sort]);

  function toggleSort(key: SortKey) {
    setSort((s) => s.key === key ? { key, dir: s.dir === "asc" ? "desc" : "asc" } : { key, dir: "desc" });
  }

  function handleExportCSV() { exportToCSV(leads); setShowExportMenu(false); }
  function handleExportExcel() { exportToExcel(leads); setShowExportMenu(false); }

  // Empty state
  if (!searchState.loading && leads.length === 0 && !searchState.query) {
    return (
      <div className="rounded-2xl border flex flex-col items-center justify-center py-20"
        style={{ background: "var(--bg-surface)", borderColor: "var(--bg-border)" }}>
        <div className="w-16 h-16 rounded-2xl flex items-center justify-center mb-4"
          style={{ background: "rgba(249,115,22,0.06)", border: "1px solid rgba(249,115,22,0.1)" }}>
          <MapPin size={24} style={{ color: "#F97316", opacity: 0.6 }}/>
        </div>
        <h3 className="font-semibold mb-2" style={{ fontFamily: "'Syne', sans-serif" }}>
          Inizia la tua ricerca
        </h3>
        <p className="text-sm text-center max-w-xs" style={{ color: "var(--text-muted)" }}>
          Seleziona città, zona e tipologia di business per trovare i tuoi prossimi lead.
        </p>
      </div>
    );
  }

  // No results after search
  if (!searchState.loading && leads.length === 0 && searchState.query) {
    return (
      <div className="rounded-2xl border flex flex-col items-center justify-center py-20"
        style={{ background: "var(--bg-surface)", borderColor: "var(--bg-border)" }}>
        <div className="w-16 h-16 rounded-2xl flex items-center justify-center mb-4"
          style={{ background: "rgba(234,179,8,0.06)", border: "1px solid rgba(234,179,8,0.1)" }}>
          <Star size={24} style={{ color: "#EAB308", opacity: 0.6 }}/>
        </div>
        <h3 className="font-semibold mb-2" style={{ fontFamily: "'Syne', sans-serif" }}>
          Nessun lead trovato
        </h3>
        <p className="text-sm text-center max-w-xs" style={{ color: "var(--text-muted)" }}>
          Non ci sono attività di tipo &ldquo;{searchState.query.category}&rdquo; senza sito web in questa zona.
          Prova con un&apos;altra categoria o zona.
        </p>
      </div>
    );
  }

  return (
    <div className="rounded-2xl border overflow-hidden"
      style={{ background: "var(--bg-surface)", borderColor: "var(--bg-border)" }}>

      {/* Toolbar */}
      <div className="flex items-center justify-between px-5 py-4 border-b gap-4"
        style={{ borderColor: "var(--bg-border)" }}>
        <div className="flex items-center gap-3">
          {searchState.loading ? (
            <div className="flex items-center gap-2">
              <span className="w-3.5 h-3.5 border-2 border-orange-500/30 border-t-orange-500 rounded-full animate-spin inline-block"/>
              <span className="text-sm" style={{ color: "var(--text-secondary)" }}>
                Ricerca in corso...
              </span>
            </div>
          ) : leads.length > 0 ? (
            <>
              <span className="font-semibold text-sm" style={{ fontFamily: "'Syne', sans-serif" }}>
                {leads.length} lead trovati
              </span>
              <span className="px-2 py-0.5 rounded-full text-xs flex items-center gap-1"
                style={{
                  background: searchState.fromCache ? "rgba(96,165,250,0.1)" : "rgba(34,197,94,0.1)",
                  color: searchState.fromCache ? "#60A5FA" : "#22C55E",
                }}>
                {searchState.fromCache ? <><Database size={10}/> cache</> : <><Wifi size={10}/> live</>}
              </span>
              {searchState.query && (
                <span className="text-xs hidden md:block" style={{ color: "var(--text-muted)" }}>
                  {searchState.query.category} · {searchState.query.neighborhood || searchState.query.city}
                </span>
              )}
            </>
          ) : null}
        </div>

        {leads.length > 0 && (
          <div className="flex items-center gap-2">
            <input
              type="text"
              value={filter}
              onChange={(e) => setFilter(e.target.value)}
              placeholder="Filtra risultati..."
              className="input-base px-3 py-2 rounded-xl text-xs w-44"
            />

            {/* Export */}
            <div className="relative">
              <button
                onClick={() => setShowExportMenu(!showExportMenu)}
                className="flex items-center gap-1.5 px-3 py-2 rounded-xl text-xs border transition-all hover:bg-white/[0.03]"
                style={{ color: "var(--text-secondary)", borderColor: "var(--bg-border)" }}>
                <Download size={13}/>
                Export
              </button>
              {showExportMenu && (
                <div className="absolute right-0 top-full mt-1 rounded-xl border overflow-hidden z-50 min-w-32"
                  style={{ background: "var(--bg-elevated)", borderColor: "var(--bg-border)" }}>
                  <button onClick={handleExportCSV}
                    className="w-full px-4 py-2.5 text-left text-xs hover:bg-white/[0.04] transition-colors"
                    style={{ color: "var(--text-secondary)" }}>
                    📄 CSV
                  </button>
                  <button onClick={handleExportExcel}
                    className="w-full px-4 py-2.5 text-left text-xs hover:bg-white/[0.04] transition-colors"
                    style={{ color: "var(--text-secondary)" }}>
                    📊 Excel (.xlsx)
                  </button>
                </div>
              )}
            </div>
          </div>
        )}
      </div>

      {/* Table */}
      <div className="overflow-x-auto">
        <table className="w-full data-table">
          <thead>
            <tr style={{ borderBottom: "1px solid var(--bg-border)" }}>
              {[
                { key: "name" as SortKey, label: "NOME ATTIVITÀ" },
                { key: null, label: "CONTATTI" },
                { key: null, label: "CATEGORIA" },
                { key: "rating" as SortKey, label: "RATING" },
                { key: "reviews_count" as SortKey, label: "RECENSIONI" },
                { key: "score" as SortKey, label: "SCORE" },
                { key: null, label: "AZIONI" },
              ].map(({ key, label }) => (
                <th key={label} className="px-5 py-3.5 text-left">
                  {key ? (
                    <button onClick={() => toggleSort(key)}
                      className="flex items-center gap-1 transition-colors hover:text-orange-400"
                      style={{ color: sort.key === key ? "#F97316" : "var(--text-muted)" }}>
                      {label}
                      <ArrowUpDown size={10}/>
                    </button>
                  ) : (
                    <span style={{ color: "var(--text-muted)" }}>{label}</span>
                  )}
                </th>
              ))}
            </tr>
          </thead>
          <tbody>
            {searchState.loading
              ? Array.from({ length: SKELETON_ROWS }).map((_, i) => (
                <tr key={i}>
                  {Array.from({ length: 7 }).map((_, j) => (
                    <td key={j} className="px-5 py-4">
                      <div className="shimmer h-4 rounded-md"
                        style={{ width: j === 0 ? "160px" : j === 1 ? "110px" : "80px" }}/>
                    </td>
                  ))}
                </tr>
              ))
              : filtered.map((lead) => (
                <LeadRow
                  key={lead.place_id}
                  lead={lead}
                  isSelected={selectedLead?.place_id === lead.place_id}
                  onClick={() => onSelectLead(lead)}
                />
              ))}
          </tbody>
        </table>
      </div>

      {!searchState.loading && filtered.length === 0 && leads.length > 0 && (
        <div className="py-10 text-center text-sm" style={{ color: "var(--text-muted)" }}>
          Nessun risultato per &ldquo;{filter}&rdquo;
        </div>
      )}
    </div>
  );
}

function LeadRow({ lead, isSelected, onClick }: {
  lead: Lead & { _score: ReturnType<typeof calcLeadScore> };
  isSelected: boolean;
  onClick: () => void;
}) {
  return (
    <tr
      onClick={onClick}
      className="cursor-pointer border-b transition-colors"
      style={{
        borderColor: "var(--bg-border)",
        background: isSelected ? "rgba(249,115,22,0.06)" : undefined,
      }}>

      {/* Nome */}
      <td className="px-5 py-4">
        <div className="font-medium text-sm leading-tight" style={{ color: "var(--text-primary)" }}>
          {lead.name}
        </div>
        <div className="text-xs mt-0.5 truncate max-w-[200px]" style={{ color: "var(--text-muted)" }}>
          {lead.address}
        </div>
      </td>

      {/* Contatti */}
      <td className="px-5 py-4">
        {lead.phone ? (
          <a href={`tel:${lead.phone}`} onClick={(e) => e.stopPropagation()}
            className="flex items-center gap-1.5 text-xs transition-colors hover:text-orange-400"
            style={{ color: "var(--text-secondary)", fontFamily: "'JetBrains Mono', monospace" }}>
            <Phone size={11}/>
            {lead.phone}
          </a>
        ) : (
          <span className="text-xs" style={{ color: "var(--text-muted)" }}>—</span>
        )}
      </td>

      {/* Categoria */}
      <td className="px-5 py-4">
        <span className="text-xs px-2 py-1 rounded-lg"
          style={{ background: "var(--bg-elevated)", color: "var(--text-secondary)" }}>
          {formatType(lead.primary_type ?? lead.category)}
        </span>
      </td>

      {/* Rating */}
      <td className="px-5 py-4">
        {lead.rating !== null ? (
          <span className="text-sm font-medium flex items-center gap-1"
            style={{ color: lead.rating >= 4 ? "#22C55E" : lead.rating >= 3 ? "#EAB308" : "#EF4444" }}>
            ★ {lead.rating.toFixed(1)}
          </span>
        ) : (
          <span style={{ color: "var(--text-muted)" }}>—</span>
        )}
      </td>

      {/* Recensioni */}
      <td className="px-5 py-4">
        <span className="text-sm" style={{ color: "var(--text-secondary)", fontFamily: "'JetBrains Mono', monospace" }}>
          {lead.reviews_count?.toLocaleString("it") ?? "—"}
        </span>
      </td>

      {/* Score */}
      <td className="px-5 py-4">
        <div className="flex items-center gap-2">
          <div className="w-12 h-1.5 rounded-full overflow-hidden" style={{ background: "var(--bg-elevated)" }}>
            <div className="h-full rounded-full transition-all"
              style={{ width: `${lead._score.score}%`, background: lead._score.color }}/>
          </div>
          <span className="text-xs font-medium" style={{ color: lead._score.color, fontFamily: "'JetBrains Mono', monospace" }}>
            {lead._score.score}
          </span>
        </div>
      </td>

      {/* Azioni */}
      <td className="px-5 py-4">
        <div className="flex items-center gap-2">
          <a href={lead.maps_url} target="_blank" rel="noopener noreferrer"
            onClick={(e) => e.stopPropagation()}
            className="p-1.5 rounded-lg transition-colors hover:text-orange-400 hover:bg-white/[0.04]"
            style={{ color: "var(--text-muted)" }} title="Apri su Google Maps">
            <ExternalLink size={13}/>
          </a>
          <button
            onClick={onClick}
            className="p-1.5 rounded-lg transition-colors hover:text-orange-400 hover:bg-white/[0.04]"
            style={{ color: isSelected ? "#F97316" : "var(--text-muted)" }} title="Dettagli">
            <TrendingUp size={13}/>
          </button>
        </div>
      </td>
    </tr>
  );
}
