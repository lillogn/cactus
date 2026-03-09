// lib/lead-score.ts
// Calcolo semplice del punteggio lead (0-100)
// Logica: più recensioni + rating alto + telefono presente = lead migliore

import type { PlaceResult } from "./google-places";

export interface LeadScore {
  score: number;      // 0-100
  label: string;      // "Caldo" | "Tiepido" | "Freddo"
  color: string;      // CSS color
  reasons: string[];  // motivi del punteggio
}

export function calcLeadScore(place: PlaceResult): LeadScore {
  let score = 0;
  const reasons: string[] = [];

  // Telefono presente (+25 punti) — contattabilità immediata
  if (place.phone) {
    score += 25;
    reasons.push("Telefono disponibile");
  }

  // Numero recensioni — indicatore attività reale
  const rev = place.reviews_count ?? 0;
  if (rev >= 100) { score += 25; reasons.push("Molte recensioni (>100)"); }
  else if (rev >= 30) { score += 15; reasons.push("Recensioni discrete (30-99)"); }
  else if (rev >= 10) { score += 8; reasons.push("Poche recensioni (10-29)"); }
  else if (rev > 0) { score += 3; reasons.push("Pochissime recensioni"); }

  // Rating — qualità dell'attività
  const rating = place.rating ?? 0;
  if (rating >= 4.5) { score += 20; reasons.push("Rating eccellente (≥4.5)"); }
  else if (rating >= 4.0) { score += 15; reasons.push("Buon rating (4.0-4.4)"); }
  else if (rating >= 3.5) { score += 8; reasons.push("Rating nella media (3.5-3.9)"); }
  else if (rating >= 3.0) { score += 3; }

  // Senza sito web → è esattamente quello che cerchiamo (+30 punti)
  if (!place.has_website) {
    score += 30;
    reasons.push("Nessun sito web ← opportunità");
  }

  score = Math.min(100, score);

  let label: string;
  let color: string;

  if (score >= 70) { label = "Caldo 🔥"; color = "#F97316"; }
  else if (score >= 40) { label = "Tiepido"; color = "#EAB308"; }
  else { label = "Freddo"; color = "#6B7280"; }

  return { score, label, color, reasons };
}
