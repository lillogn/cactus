"use client";
// app/dashboard/favorites/page.tsx
import { useEffect, useState } from "react";
import { Star, Phone, ExternalLink, MapPin, Loader2 } from "lucide-react";
import { formatType } from "@/lib/google-places";

interface Favorite {
  id: string;
  note: string;
  status: string;
  created_at: string;
  places: {
    id: string;
    place_id: string;
    name: string;
    address: string;
    phone: string | null;
    category: string | null;
    primary_type: string | null;
    rating: number | null;
    reviews_count: number | null;
    maps_url: string;
    city: string;
    neighborhood: string;
  };
}

const STATUS_LABELS: Record<string, { label: string; color: string }> = {
  da_contattare: { label: "Da contattare", color: "#8A8B91" },
  contattato: { label: "Contattato", color: "#60A5FA" },
  trattativa: { label: "In trattativa", color: "#EAB308" },
  cliente: { label: "Cliente ✓", color: "#22C55E" },
  perso: { label: "Perso", color: "#EF4444" },
};

export default function FavoritesPage() {
  const [favorites, setFavorites] = useState<Favorite[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetch("/api/favorites")
      .then((r) => r.json())
      .then((d) => setFavorites(d.favorites ?? []))
      .finally(() => setLoading(false));
  }, []);

  return (
    <div className="p-8">
      <div className="mb-8">
        <h1 className="font-bold text-xl mb-1"
          style={{ fontFamily: "'Syne', sans-serif", color: "var(--text-primary)" }}>
          Preferiti
        </h1>
        <p className="text-sm" style={{ color: "var(--text-muted)" }}>
          Lead salvati e in gestione
        </p>
      </div>

      {loading ? (
        <div className="flex items-center justify-center py-20">
          <Loader2 size={24} className="animate-spin" style={{ color: "var(--text-muted)" }}/>
        </div>
      ) : favorites.length === 0 ? (
        <div className="rounded-2xl border flex flex-col items-center justify-center py-20"
          style={{ background: "var(--bg-surface)", borderColor: "var(--bg-border)" }}>
          <Star size={32} className="mb-4 opacity-20"/>
          <h3 className="font-semibold mb-2" style={{ fontFamily: "'Syne', sans-serif" }}>
            Nessun preferito ancora
          </h3>
          <p className="text-sm" style={{ color: "var(--text-muted)" }}>
            Aggiungi lead dai risultati di ricerca.
          </p>
        </div>
      ) : (
        <div className="grid gap-3">
          {favorites.map((fav) => {
            const st = STATUS_LABELS[fav.status] ?? STATUS_LABELS.da_contattare;
            return (
              <div key={fav.id}
                className="rounded-xl border p-5 flex items-start gap-5 transition-colors hover:bg-white/[0.01]"
                style={{ background: "var(--bg-surface)", borderColor: "var(--bg-border)" }}>
                <div className="flex-1 min-w-0">
                  <div className="flex items-start justify-between gap-3 mb-1">
                    <h3 className="font-semibold text-sm" style={{ color: "var(--text-primary)" }}>
                      {fav.places.name}
                    </h3>
                    <span className="px-2 py-0.5 rounded-full text-xs shrink-0 font-medium"
                      style={{ background: `${st.color}18`, color: st.color }}>
                      {st.label}
                    </span>
                  </div>
                  <div className="flex items-center gap-3 text-xs mb-2" style={{ color: "var(--text-muted)" }}>
                    <span className="flex items-center gap-1">
                      <MapPin size={10}/>{fav.places.neighborhood}, {fav.places.city}
                    </span>
                    <span>{formatType(fav.places.primary_type ?? fav.places.category)}</span>
                    {fav.places.rating && <span>★ {fav.places.rating}</span>}
                  </div>
                  {fav.note && (
                    <p className="text-xs px-3 py-2 rounded-lg"
                      style={{ background: "var(--bg-elevated)", color: "var(--text-secondary)" }}>
                      {fav.note}
                    </p>
                  )}
                </div>
                <div className="flex flex-col gap-2 shrink-0">
                  {fav.places.phone && (
                    <a href={`tel:${fav.places.phone}`}
                      className="flex items-center gap-1.5 text-xs px-3 py-2 rounded-lg border transition-colors hover:text-orange-400"
                      style={{ color: "var(--text-secondary)", borderColor: "var(--bg-border)", background: "var(--bg-elevated)" }}>
                      <Phone size={11}/>{fav.places.phone}
                    </a>
                  )}
                  <a href={fav.places.maps_url} target="_blank" rel="noopener noreferrer"
                    className="flex items-center gap-1.5 text-xs px-3 py-2 rounded-lg border transition-colors hover:text-orange-400 justify-center"
                    style={{ color: "var(--text-muted)", borderColor: "var(--bg-border)", background: "var(--bg-elevated)" }}>
                    <ExternalLink size={11}/>Maps
                  </a>
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
