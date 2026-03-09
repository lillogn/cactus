"use client";
// components/LeadDetailPanel.tsx
import { useState, useEffect } from "react";
import {
  X, MapPin, Phone, Star, ExternalLink, Heart, HeartOff,
  Globe, Tag, Hash, Copy, Check, ChevronDown
} from "lucide-react";
import type { Lead } from "@/app/dashboard/page";
import { calcLeadScore } from "@/lib/lead-score";
import { formatType } from "@/lib/google-places";

interface LeadDetailPanelProps {
  lead: Lead;
  onClose: () => void;
}

const STATUS_OPTIONS = [
  { value: "da_contattare", label: "Da contattare", color: "#8A8B91" },
  { value: "contattato", label: "Contattato", color: "#60A5FA" },
  { value: "trattativa", label: "In trattativa", color: "#EAB308" },
  { value: "cliente", label: "Diventato cliente ✓", color: "#22C55E" },
  { value: "perso", label: "Perso", color: "#EF4444" },
];

export default function LeadDetailPanel({ lead, onClose }: LeadDetailPanelProps) {
  const score = calcLeadScore(lead);
  const [isFavorite, setIsFavorite] = useState(false);
  const [note, setNote] = useState("");
  const [status, setStatus] = useState("da_contattare");
  const [saving, setSaving] = useState(false);
  const [saved, setSaved] = useState(false);
  const [copied, setCopied] = useState(false);
  const [loadingFav, setLoadingFav] = useState(true);

  // Carica stato preferito
  useEffect(() => {
    async function loadFavorite() {
      setLoadingFav(true);
      try {
        const res = await fetch("/api/favorites");
        const data = await res.json();
        const fav = data.favorites?.find((f: { places: { place_id: string }; note: string; status: string }) =>
          f.places?.place_id === lead.place_id
        );
        if (fav) {
          setIsFavorite(true);
          setNote(fav.note ?? "");
          setStatus(fav.status ?? "da_contattare");
        } else {
          setIsFavorite(false);
          setNote("");
          setStatus("da_contattare");
        }
      } finally {
        setLoadingFav(false);
      }
    }
    loadFavorite();
  }, [lead.place_id]);

  async function toggleFavorite() {
    if (isFavorite) {
      await fetch("/api/favorites", {
        method: "DELETE",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ placeId: lead.id }),
      });
      setIsFavorite(false);
    } else {
      setSaving(true);
      await fetch("/api/favorites", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ placeId: lead.id, note, status }),
      });
      setIsFavorite(true);
      setSaving(false);
      setSaved(true);
      setTimeout(() => setSaved(false), 2000);
    }
  }

  async function saveNote() {
    setSaving(true);
    await fetch("/api/favorites", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ placeId: lead.id, note, status }),
    });
    setIsFavorite(true);
    setSaving(false);
    setSaved(true);
    setTimeout(() => setSaved(false), 2000);
  }

  function copyPhone() {
    if (lead.phone) {
      navigator.clipboard.writeText(lead.phone);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    }
  }

  const currentStatus = STATUS_OPTIONS.find((s) => s.value === status);

  return (
    <aside
      className="w-80 shrink-0 border-l flex flex-col overflow-y-auto animate-slide-up"
      style={{ background: "var(--bg-surface)", borderColor: "var(--bg-border)" }}>

      {/* Header */}
      <div className="flex items-start justify-between p-5 border-b"
        style={{ borderColor: "var(--bg-border)" }}>
        <div className="flex-1 min-w-0 pr-3">
          <h3 className="font-bold text-sm leading-snug"
            style={{ fontFamily: "'Syne', sans-serif", color: "var(--text-primary)" }}>
            {lead.name}
          </h3>
          <span className="text-xs mt-1 px-2 py-0.5 rounded-md inline-block"
            style={{ background: "var(--bg-elevated)", color: "var(--text-muted)" }}>
            {formatType(lead.primary_type ?? lead.category)}
          </span>
        </div>
        <button onClick={onClose}
          className="p-1.5 rounded-lg transition-colors hover:bg-white/[0.04] shrink-0"
          style={{ color: "var(--text-muted)" }}>
          <X size={15}/>
        </button>
      </div>

      <div className="flex-1 p-5 space-y-5">

        {/* Score */}
        <div className="rounded-xl p-4 border"
          style={{ background: "var(--bg-elevated)", borderColor: "var(--bg-border)" }}>
          <div className="flex items-center justify-between mb-3">
            <span className="text-xs font-medium"
              style={{ fontFamily: "'JetBrains Mono', monospace", color: "var(--text-muted)", letterSpacing: "0.05em" }}>
              LEAD SCORE
            </span>
            <span className="text-sm font-bold" style={{ color: score.color }}>
              {score.label}
            </span>
          </div>
          <div className="flex items-center gap-3">
            <div className="flex-1 h-2 rounded-full overflow-hidden" style={{ background: "var(--bg-border)" }}>
              <div className="h-full rounded-full transition-all duration-500"
                style={{ width: `${score.score}%`, background: score.color }}/>
            </div>
            <span className="text-lg font-bold w-8 text-right"
              style={{ color: score.color, fontFamily: "'JetBrains Mono', monospace" }}>
              {score.score}
            </span>
          </div>
          <div className="mt-3 space-y-1">
            {score.reasons.map((r) => (
              <div key={r} className="flex items-center gap-2 text-xs" style={{ color: "var(--text-muted)" }}>
                <span className="w-1 h-1 rounded-full shrink-0" style={{ background: score.color }}/>
                {r}
              </div>
            ))}
          </div>
        </div>

        {/* Info */}
        <div className="space-y-3">
          <InfoRow icon={<MapPin size={13}/>} label="Indirizzo" value={lead.address}/>

          {lead.phone && (
            <div className="flex gap-3">
              <span className="mt-0.5 shrink-0" style={{ color: "var(--text-muted)" }}>
                <Phone size={13}/>
              </span>
              <div className="flex-1 min-w-0">
                <div className="text-xs mb-1" style={{ color: "var(--text-muted)" }}>Telefono</div>
                <div className="flex items-center gap-2">
                  <a href={`tel:${lead.phone}`}
                    className="text-sm font-medium transition-colors hover:text-orange-400"
                    style={{ color: "var(--text-primary)", fontFamily: "'JetBrains Mono', monospace" }}>
                    {lead.phone}
                  </a>
                  <button onClick={copyPhone}
                    className="p-1 rounded transition-colors hover:bg-white/[0.04]"
                    style={{ color: "var(--text-muted)" }}>
                    {copied ? <Check size={11} color="#22C55E"/> : <Copy size={11}/>}
                  </button>
                </div>
              </div>
            </div>
          )}

          {lead.rating !== null && (
            <InfoRow
              icon={<Star size={13}/>}
              label="Rating"
              value={`★ ${lead.rating.toFixed(1)} · ${lead.reviews_count?.toLocaleString("it") ?? "0"} recensioni`}
            />
          )}

          <InfoRow icon={<Tag size={13}/>} label="Zona"
            value={`${lead.neighborhood}${lead.city ? `, ${lead.city}` : ""}`}/>

          <InfoRow icon={<Hash size={13}/>} label="Coordinate"
            value={`${lead.lat.toFixed(5)}, ${lead.lng.toFixed(5)}`}
            mono/>

          <div className="flex gap-3">
            <span className="mt-0.5 shrink-0" style={{ color: "var(--text-muted)" }}>
              <Globe size={13}/>
            </span>
            <div>
              <div className="text-xs mb-1" style={{ color: "var(--text-muted)" }}>Sito Web</div>
              <span className="text-sm px-2 py-0.5 rounded-md font-medium"
                style={{ background: "rgba(239,68,68,0.1)", color: "#EF4444" }}>
                ❌ Non presente
              </span>
            </div>
          </div>
        </div>

        {/* Stato */}
        <div>
          <label className="block text-xs mb-2 font-medium"
            style={{ fontFamily: "'JetBrains Mono', monospace", color: "var(--text-muted)", letterSpacing: "0.05em" }}>
            STATO CONTATTO
          </label>
          <div className="relative">
            <select
              value={status}
              onChange={(e) => setStatus(e.target.value)}
              className="input-base w-full px-3 py-2.5 rounded-xl text-sm appearance-none pr-8 font-medium"
              style={{ color: currentStatus?.color }}>
              {STATUS_OPTIONS.map((s) => (
                <option key={s.value} value={s.value} style={{ color: s.color }}>
                  {s.label}
                </option>
              ))}
            </select>
            <ChevronDown size={13} className="absolute right-3 top-1/2 -translate-y-1/2 pointer-events-none"
              style={{ color: "var(--text-muted)" }}/>
          </div>
        </div>

        {/* Nota */}
        <div>
          <label className="block text-xs mb-2 font-medium"
            style={{ fontFamily: "'JetBrains Mono', monospace", color: "var(--text-muted)", letterSpacing: "0.05em" }}>
            NOTE
          </label>
          <textarea
            value={note}
            onChange={(e) => setNote(e.target.value)}
            rows={3}
            placeholder="Es: chiamato il 10/03, interessato, richiamare..."
            className="input-base w-full px-3 py-2.5 rounded-xl text-sm resize-none"
          />
        </div>

        {/* Actions */}
        <div className="space-y-2">
          <button onClick={saveNote} disabled={saving}
            className="w-full py-2.5 rounded-xl text-sm font-semibold transition-all flex items-center justify-center gap-2"
            style={{
              background: saved ? "rgba(34,197,94,0.15)" : "rgba(249,115,22,0.1)",
              color: saved ? "#22C55E" : "#F97316",
              border: `1px solid ${saved ? "rgba(34,197,94,0.2)" : "rgba(249,115,22,0.15)"}`,
            }}>
            {saving ? "Salvataggio..." : saved ? <><Check size={14}/>Salvato</> : "Salva nota e stato"}
          </button>

          {!loadingFav && (
            <button onClick={toggleFavorite}
              className="w-full py-2.5 rounded-xl text-sm transition-all flex items-center justify-center gap-2 border"
              style={{
                background: isFavorite ? "rgba(234,179,8,0.08)" : "var(--bg-elevated)",
                color: isFavorite ? "#EAB308" : "var(--text-muted)",
                borderColor: isFavorite ? "rgba(234,179,8,0.2)" : "var(--bg-border)",
              }}>
              {isFavorite ? <><HeartOff size={14}/>Rimuovi dai preferiti</> : <><Heart size={14}/>Aggiungi ai preferiti</>}
            </button>
          )}

          <a href={lead.maps_url} target="_blank" rel="noopener noreferrer"
            className="w-full py-2.5 rounded-xl text-sm transition-all flex items-center justify-center gap-2 border"
            style={{
              background: "var(--bg-elevated)",
              color: "var(--text-secondary)",
              borderColor: "var(--bg-border)",
              textDecoration: "none",
            }}>
            <ExternalLink size={14}/>
            Apri su Google Maps
          </a>
        </div>
      </div>
    </aside>
  );
}

function InfoRow({ icon, label, value, mono = false }: {
  icon: React.ReactNode;
  label: string;
  value: string;
  mono?: boolean;
}) {
  return (
    <div className="flex gap-3">
      <span className="mt-0.5 shrink-0" style={{ color: "var(--text-muted)" }}>{icon}</span>
      <div className="flex-1 min-w-0">
        <div className="text-xs mb-0.5" style={{ color: "var(--text-muted)" }}>{label}</div>
        <div className="text-sm" style={{
          color: "var(--text-primary)",
          fontFamily: mono ? "'JetBrains Mono', monospace" : undefined,
        }}>
          {value}
        </div>
      </div>
    </div>
  );
}
