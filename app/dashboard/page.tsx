"use client";
// app/dashboard/page.tsx
import { useState, useCallback } from "react";
import SearchPanel from "@/components/SearchPanel";
import ResultsTable from "@/components/ResultsTable";
import LeadDetailPanel from "@/components/LeadDetailPanel";

export interface Lead {
  id?: string;
  place_id: string;
  name: string;
  address: string;
  phone: string | null;
  category: string | null;
  primary_type: string | null;
  rating: number | null;
  reviews_count: number | null;
  website: string | null;
  has_website: boolean;
  lat: number;
  lng: number;
  maps_url: string;
  city: string;
  neighborhood: string;
}

export interface SearchState {
  loading: boolean;
  fromCache: boolean;
  cachedAt?: string;
  searchId?: string;
  query?: { city: string; neighborhood: string; category: string };
}

export default function DashboardPage() {
  const [leads, setLeads] = useState<Lead[]>([]);
  const [searchState, setSearchState] = useState<SearchState>({ loading: false, fromCache: false });
  const [selectedLead, setSelectedLead] = useState<Lead | null>(null);
  const [error, setError] = useState<string | null>(null);

  const handleSearch = useCallback(async (params: {
    cityName: string;
    cityLabel: string;
    neighborhood: string;
    category: string;
    forceRefresh?: boolean;
  }) => {
    setSearchState({ loading: true, fromCache: false });
    setLeads([]);
    setError(null);
    setSelectedLead(null);

    try {
      const res = await fetch("/api/search", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          cityName: params.cityName,
          neighborhood: params.neighborhood,
          category: params.category,
          forceRefresh: params.forceRefresh ?? false,
        }),
      });

      const data = await res.json();

      if (!res.ok) throw new Error(data.error ?? "Errore nella ricerca");

      setLeads(data.places ?? []);
      setSearchState({
        loading: false,
        fromCache: data.fromCache,
        cachedAt: data.cachedAt,
        searchId: data.searchId,
        query: {
          city: params.cityLabel,
          neighborhood: params.neighborhood,
          category: params.category,
        },
      });
    } catch (err) {
      setError(err instanceof Error ? err.message : "Errore sconosciuto");
      setSearchState({ loading: false, fromCache: false });
    }
  }, []);

  return (
    <div className="flex h-full">
      {/* Main area */}
      <div className="flex-1 flex flex-col min-w-0">
        {/* Header */}
        <div className="h-16 flex items-center px-8 border-b shrink-0"
          style={{ borderColor: "var(--bg-border)" }}>
          <div>
            <h1 className="font-bold text-base"
              style={{ fontFamily: "'Syne', sans-serif", color: "var(--text-primary)" }}>
              Ricerca Lead
            </h1>
            <p className="text-xs" style={{ color: "var(--text-muted)" }}>
              Trova business locali senza sito web
            </p>
          </div>
        </div>

        <div className="flex-1 overflow-y-auto p-8 space-y-6">
          <SearchPanel onSearch={handleSearch} loading={searchState.loading}/>

          {error && (
            <div className="px-5 py-4 rounded-xl text-sm animate-fade-in"
              style={{
                background: "rgba(239,68,68,0.08)",
                color: "#EF4444",
                border: "1px solid rgba(239,68,68,0.2)",
              }}>
              ⚠️ {error}
            </div>
          )}

          <ResultsTable
            leads={leads}
            searchState={searchState}
            onSelectLead={setSelectedLead}
            selectedLead={selectedLead}
          />
        </div>
      </div>

      {/* Detail panel */}
      {selectedLead && (
        <LeadDetailPanel
          lead={selectedLead}
          onClose={() => setSelectedLead(null)}
        />
      )}
    </div>
  );
}
