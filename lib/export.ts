// lib/export.ts
import * as XLSX from "xlsx";
import type { PlaceResult } from "./google-places";

export interface ExportRow {
  "Nome Attività": string;
  Indirizzo: string;
  Telefono: string;
  Categoria: string;
  Rating: string;
  "N° Recensioni": string;
  "Sito Web": string;
  "Link Google Maps": string;
  Città: string;
  "Quartiere/Zona": string;
  Latitudine: string;
  Longitudine: string;
}

function toExportRow(place: PlaceResult): ExportRow {
  return {
    "Nome Attività": place.name,
    Indirizzo: place.address,
    Telefono: place.phone ?? "",
    Categoria: place.category ?? "",
    Rating: place.rating !== null ? String(place.rating) : "",
    "N° Recensioni": place.reviews_count !== null ? String(place.reviews_count) : "",
    "Sito Web": place.website ?? "❌ Non presente",
    "Link Google Maps": place.maps_url,
    Città: place.city,
    "Quartiere/Zona": place.neighborhood,
    Latitudine: String(place.lat),
    Longitudine: String(place.lng),
  };
}

export function exportToCSV(places: PlaceResult[], filename = "cactus-leads"): void {
  const rows = places.map(toExportRow);
  const ws = XLSX.utils.json_to_sheet(rows);
  const csv = XLSX.utils.sheet_to_csv(ws);
  downloadBlob(csv, `${filename}.csv`, "text/csv;charset=utf-8;");
}

export function exportToExcel(places: PlaceResult[], filename = "cactus-leads"): void {
  const rows = places.map(toExportRow);
  const ws = XLSX.utils.json_to_sheet(rows);

  // Larghezze colonne
  ws["!cols"] = [
    { wch: 35 }, { wch: 45 }, { wch: 20 }, { wch: 25 },
    { wch: 8 }, { wch: 12 }, { wch: 25 }, { wch: 50 },
    { wch: 20 }, { wch: 25 }, { wch: 12 }, { wch: 12 },
  ];

  const wb = XLSX.utils.book_new();
  XLSX.utils.book_append_sheet(wb, ws, "Lead CACTUS");
  XLSX.writeFile(wb, `${filename}.xlsx`);
}

function downloadBlob(content: string, filename: string, mimeType: string): void {
  const blob = new Blob(["\uFEFF" + content], { type: mimeType });
  const url = URL.createObjectURL(blob);
  const a = document.createElement("a");
  a.href = url;
  a.download = filename;
  a.click();
  URL.revokeObjectURL(url);
}
