"use client";
// components/SearchPanel.tsx
import { useState } from "react";
import { Search, RefreshCw, MapPin, Building2, ChevronDown } from "lucide-react";
import { getCityOptions, getNeighborhoodOptions } from "@/lib/neighborhoods";
import clsx from "clsx";

interface SearchPanelProps {
  onSearch: (params: {
    cityName: string;
    cityLabel: string;
    neighborhood: string;
    category: string;
    forceRefresh?: boolean;
  }) => void;
  loading: boolean;
}

const CATEGORY_SUGGESTIONS = [
  "Ristorante", "Bar", "Pizzeria", "Caffè", "Pasticceria",
  "Parrucchiere", "Barbiere", "Centro Estetico", "Nail Salon",
  "Palestra", "Fisioterapista", "Dentista", "Medico", "Farmacia",
  "Hotel", "B&B", "Agriturismo",
  "Officina", "Elettricista", "Idraulico", "Impresa Edile",
  "Avvocato", "Commercialista", "Agenzia Immobiliare",
  "Negozio Abbigliamento", "Gioielleria", "Fioraio",
];

export default function SearchPanel({ onSearch, loading }: SearchPanelProps) {
  const [cityName, setCityName] = useState("");
  const [neighborhood, setNeighborhood] = useState("");
  const [customNeighborhood, setCustomNeighborhood] = useState("");
  const [useCustom, setUseCustom] = useState(false);
  const [category, setCategory] = useState("");
  const [showSuggestions, setShowSuggestions] = useState(false);

  const cities = getCityOptions();
  const neighborhoods = cityName ? getNeighborhoodOptions(cityName) : [];
  const selectedCity = cities.find((c) => c.value === cityName);

  const effectiveNeighborhood = useCustom ? customNeighborhood : neighborhood;

  function handleSubmit(e: React.FormEvent, forceRefresh = false) {
    e.preventDefault();
    if (!cityName || !category) return;
    onSearch({
      cityName,
      cityLabel: selectedCity?.label ?? cityName,
      neighborhood: effectiveNeighborhood,
      category,
      forceRefresh,
    });
  }

  const filteredSuggestions = category.length >= 2
    ? CATEGORY_SUGGESTIONS.filter((s) => s.toLowerCase().includes(category.toLowerCase()))
    : CATEGORY_SUGGESTIONS;

  return (
    <div className="rounded-2xl p-6 border"
      style={{ background: "var(--bg-surface)", borderColor: "var(--bg-border)" }}>
      <div className="flex items-center gap-2 mb-5">
        <Search size={16} style={{ color: "#F97316" }}/>
        <h2 className="font-semibold text-sm"
          style={{ fontFamily: "'Syne', sans-serif", color: "var(--text-primary)" }}>
          Nuova Ricerca
        </h2>
      </div>

      <form onSubmit={(e) => handleSubmit(e, false)} className="space-y-4">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">

          {/* Città */}
          <div>
            <label className="block text-xs mb-2 font-medium"
              style={{ color: "var(--text-secondary)", fontFamily: "'JetBrains Mono', monospace", letterSpacing: "0.05em" }}>
              <MapPin size={11} className="inline mr-1"/>CITTÀ
            </label>
            <div className="relative">
              <select
                value={cityName}
                onChange={(e) => {
                  setCityName(e.target.value);
                  setNeighborhood("");
                  setCustomNeighborhood("");
                  setUseCustom(false);
                }}
                className="input-base w-full px-4 py-3 rounded-xl text-sm appearance-none pr-9"
                required>
                <option value="">Seleziona città...</option>
                {cities.map((c) => (
                  <option key={c.value} value={c.value}>{c.label}</option>
                ))}
              </select>
              <ChevronDown size={14} className="absolute right-3 top-1/2 -translate-y-1/2 pointer-events-none"
                style={{ color: "var(--text-muted)" }}/>
            </div>
          </div>

          {/* Quartiere */}
          <div>
            <label className="block text-xs mb-2 font-medium"
              style={{ color: "var(--text-secondary)", fontFamily: "'JetBrains Mono', monospace", letterSpacing: "0.05em" }}>
              <MapPin size={11} className="inline mr-1"/>ZONA / QUARTIERE
            </label>
            {!useCustom ? (
              <div className="flex gap-2">
                <div className="relative flex-1">
                  <select
                    value={neighborhood}
                    onChange={(e) => setNeighborhood(e.target.value)}
                    disabled={!cityName}
                    className="input-base w-full px-4 py-3 rounded-xl text-sm appearance-none pr-9 disabled:opacity-40">
                    <option value="">Tutta la città</option>
                    {neighborhoods.map((n) => (
                      <option key={n.value} value={n.value}>{n.label}</option>
                    ))}
                  </select>
                  <ChevronDown size={14} className="absolute right-3 top-1/2 -translate-y-1/2 pointer-events-none"
                    style={{ color: "var(--text-muted)" }}/>
                </div>
                <button type="button" onClick={() => setUseCustom(true)}
                  className="px-3 rounded-xl text-xs border transition-colors hover:border-orange-500/40"
                  style={{ color: "var(--text-muted)", borderColor: "var(--bg-border)", background: "var(--bg-elevated)" }}
                  title="Inserisci zona manuale">
                  + zona
                </button>
              </div>
            ) : (
              <div className="flex gap-2">
                <input
                  type="text"
                  value={customNeighborhood}
                  onChange={(e) => setCustomNeighborhood(e.target.value)}
                  placeholder="Es: Corso Garibaldi, Zona Industriale..."
                  className="input-base flex-1 px-4 py-3 rounded-xl text-sm"
                />
                <button type="button" onClick={() => { setUseCustom(false); setCustomNeighborhood(""); }}
                  className="px-3 rounded-xl text-xs border transition-colors"
                  style={{ color: "var(--text-muted)", borderColor: "var(--bg-border)", background: "var(--bg-elevated)" }}>
                  lista
                </button>
              </div>
            )}
          </div>

          {/* Categoria */}
          <div className="relative">
            <label className="block text-xs mb-2 font-medium"
              style={{ color: "var(--text-secondary)", fontFamily: "'JetBrains Mono', monospace", letterSpacing: "0.05em" }}>
              <Building2 size={11} className="inline mr-1"/>TIPOLOGIA BUSINESS
            </label>
            <input
              type="text"
              value={category}
              onChange={(e) => { setCategory(e.target.value); setShowSuggestions(true); }}
              onFocus={() => setShowSuggestions(true)}
              onBlur={() => setTimeout(() => setShowSuggestions(false), 150)}
              placeholder="Es: ristorante, parrucchiere, dentista..."
              className="input-base w-full px-4 py-3 rounded-xl text-sm"
              required
              autoComplete="off"
            />
            {showSuggestions && filteredSuggestions.length > 0 && (
              <div className="absolute top-full left-0 right-0 mt-1 rounded-xl border z-50 overflow-hidden max-h-52 overflow-y-auto"
                style={{ background: "var(--bg-elevated)", borderColor: "var(--bg-border)" }}>
                {filteredSuggestions.slice(0, 8).map((s) => (
                  <button key={s} type="button"
                    onMouseDown={() => { setCategory(s); setShowSuggestions(false); }}
                    className="w-full px-4 py-2.5 text-left text-sm transition-colors hover:bg-white/[0.04]"
                    style={{ color: "var(--text-secondary)" }}>
                    {s}
                  </button>
                ))}
              </div>
            )}
          </div>
        </div>

        {/* Actions */}
        <div className="flex items-center gap-3 pt-1">
          <button
            type="submit"
            disabled={loading || !cityName || !category}
            className={clsx(
              "flex items-center gap-2 px-6 py-3 rounded-xl font-semibold text-sm transition-all duration-200",
              loading || !cityName || !category
                ? "opacity-40 cursor-not-allowed"
                : "hover:opacity-90 active:scale-[0.98] glow-accent"
            )}
            style={{ background: "linear-gradient(135deg, #F97316, #EA580C)", color: "white" }}>
            {loading ? (
              <><span className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin inline-block"/>
              Ricerca in corso...</>
            ) : (
              <><Search size={15}/>Cerca Business Senza Sito</>
            )}
          </button>

          {!loading && cityName && category && (
            <button
              type="button"
              onClick={(e) => handleSubmit(e as unknown as React.FormEvent, true)}
              className="flex items-center gap-2 px-4 py-3 rounded-xl text-sm border transition-all hover:bg-white/[0.03]"
              style={{ color: "var(--text-muted)", borderColor: "var(--bg-border)" }}
              title="Forza aggiornamento dati da Google">
              <RefreshCw size={13}/>
              Aggiorna dati
            </button>
          )}
        </div>
      </form>
    </div>
  );
}
