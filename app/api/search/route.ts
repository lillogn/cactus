// app/api/search/route.ts
import { NextRequest, NextResponse } from "next/server";
import { searchPlaces } from "@/lib/google-places";
import { getCityByName } from "@/lib/neighborhoods";
import { createServerSupabaseClient, createServiceRoleClient } from "@/lib/supabase-server";

export const maxDuration = 120;

export async function POST(req: NextRequest) {
  try {
    const supabase = createServerSupabaseClient();
    const { data: { user }, error: authError } = await supabase.auth.getUser();
    if (authError || !user) {
      return NextResponse.json({ error: "Non autenticato" }, { status: 401 });
    }

    const body = await req.json();
    const { cityName, neighborhood, category, forceRefresh = false } = body;

    if (!cityName || !category) {
      return NextResponse.json({ error: "cityName e category sono obbligatori" }, { status: 400 });
    }

    const city = getCityByName(cityName);
    if (!city) {
      return NextResponse.json({ error: "Città non trovata" }, { status: 404 });
    }

    let lat = city.lat;
    let lng = city.lng;
    let radius = city.defaultRadius;
    let neighborhoodLabel = neighborhood || city.label;

    if (neighborhood) {
      const hood = city.neighborhoods.find((n) => n.name === neighborhood);
      if (hood) {
        lat = hood.lat;
        lng = hood.lng;
        radius = hood.radius;
        neighborhoodLabel = hood.name;
      } else {
        neighborhoodLabel = neighborhood;
      }
    }

    const serviceRole = createServiceRoleClient();

    if (!forceRefresh) {
      const cutoff = new Date(Date.now() - 48 * 60 * 60 * 1000).toISOString();
      const { data: cachedSearch } = await supabase
        .from("searches")
        .select("id, results_count, leads_count, created_at, search_results (places (*))")
        .eq("city", cityName)
        .eq("neighborhood", neighborhoodLabel)
        .ilike("category", category)
        .gte("created_at", cutoff)
        .order("created_at", { ascending: false })
        .limit(1)
        .single();

      if (cachedSearch && cachedSearch.search_results?.length > 0) {
        const places = cachedSearch.search_results
          .map((sr: { places: unknown }) => sr.places)
          .filter(Boolean);

        const { data: newSearch } = await supabase
          .from("searches")
          .insert({
            user_id: user.id,
            city: cityName,
            neighborhood: neighborhoodLabel,
            category,
            results_count: places.length,
            leads_count: places.filter((p: unknown) => !(p as { has_website: boolean }).has_website).length,
            from_cache: true,
          })
          .select()
          .single();

        if (newSearch) {
          await serviceRole.from("search_results").insert(
            places.map((p: unknown) => ({ search_id: newSearch.id, place_id: (p as { id: string }).id }))
          );
        }

        return NextResponse.json({ places, fromCache: true, searchId: newSearch?.id, cachedAt: cachedSearch.created_at });
      }
    }

    const results = await searchPlaces({
      category,
      cityLabel: city.label,
      cityName,
      neighborhood: neighborhoodLabel,
      lat,
      lng,
      radius,
      onlyWithoutWebsite: true,
    });

    const { data: newSearch, error: searchErr } = await supabase
      .from("searches")
      .insert({
        user_id: user.id,
        city: cityName,
        neighborhood: neighborhoodLabel,
        category,
        results_count: results.length,
        leads_count: results.length,
        from_cache: false,
      })
      .select()
      .single();

    if (searchErr) throw searchErr;

    const savedPlaces: unknown[] = [];
    for (const place of results) {
      const { data: savedPlace } = await serviceRole
        .from("places")
        .upsert({
          place_id: place.place_id,
          name: place.name,
          address: place.address,
          phone: place.phone,
          category: place.category,
          primary_type: place.primary_type,
          rating: place.rating,
          reviews_count: place.reviews_count,
          website: place.website,
          lat: place.lat,
          lng: place.lng,
          city: cityName,
          neighborhood: neighborhoodLabel,
          maps_url: place.maps_url,
          last_updated_at: new Date().toISOString(),
        }, { onConflict: "place_id" })
        .select()
        .single();

      if (savedPlace) {
        savedPlaces.push(savedPlace);
        await serviceRole.from("search_results").upsert(
          { search_id: newSearch.id, place_id: (savedPlace as { id: string }).id },
          { onConflict: "search_id,place_id" }
        );
      }
    }

    return NextResponse.json({ places: savedPlaces.length > 0 ? savedPlaces : results, fromCache: false, searchId: newSearch.id });
  } catch (err) {
    console.error("Search error:", err);
    const message = err instanceof Error ? err.message : "Errore interno";
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
