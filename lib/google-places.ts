// lib/google-places.ts
// Integrazione Google Places API (New) — Text Search + Place Details
// Docs: https://developers.google.com/maps/documentation/places/web-service/text-search

export interface PlaceResult {
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

// Campi che richiediamo in Text Search — ottimizzati per ridurre costi
// Con questa field mask non servono chiamate Place Details separate
const FIELD_MASK = [
  "places.id",
  "places.displayName",
  "places.formattedAddress",
  "places.nationalPhoneNumber",
  "places.internationalPhoneNumber",
  "places.rating",
  "places.userRatingCount",
  "places.websiteUri",
  "places.location",
  "places.googleMapsUri",
  "places.primaryType",
  "places.types",
].join(",");

interface TextSearchOptions {
  query: string;
  lat: number;
  lng: number;
  radius: number; // metri
  pageToken?: string;
}

interface TextSearchResponse {
  places: RawPlace[];
  nextPageToken?: string;
}

interface RawPlace {
  id: string;
  displayName?: { text: string };
  formattedAddress?: string;
  nationalPhoneNumber?: string;
  internationalPhoneNumber?: string;
  rating?: number;
  userRatingCount?: number;
  websiteUri?: string;
  location?: { latitude: number; longitude: number };
  googleMapsUri?: string;
  primaryType?: string;
  types?: string[];
}

async function textSearch(options: TextSearchOptions): Promise<TextSearchResponse> {
  const apiKey = process.env.GOOGLE_PLACES_API_KEY;
  if (!apiKey) throw new Error("GOOGLE_PLACES_API_KEY non configurata");

  const body: Record<string, unknown> = {
    textQuery: options.query,
    locationBias: {
      circle: {
        center: { latitude: options.lat, longitude: options.lng },
        radius: options.radius,
      },
    },
    languageCode: "it",
    maxResultCount: 20,
  };

  if (options.pageToken) {
    body.pageToken = options.pageToken;
  }

  const res = await fetch("https://places.googleapis.com/v1/places:searchText", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      "X-Goog-Api-Key": apiKey,
      "X-Goog-FieldMask": FIELD_MASK,
    },
    body: JSON.stringify(body),
  });

  if (!res.ok) {
    const err = await res.text();
    throw new Error(`Google Places API error ${res.status}: ${err}`);
  }

  return res.json();
}

function mapRawPlace(raw: RawPlace, city: string, neighborhood: string): PlaceResult {
  const website = raw.websiteUri ?? null;
  return {
    place_id: raw.id,
    name: raw.displayName?.text ?? "Nome non disponibile",
    address: raw.formattedAddress ?? "",
    phone: raw.nationalPhoneNumber ?? raw.internationalPhoneNumber ?? null,
    category: raw.primaryType ?? (raw.types?.[0] ?? null),
    primary_type: raw.primaryType ?? null,
    rating: raw.rating ?? null,
    reviews_count: raw.userRatingCount ?? null,
    website,
    has_website: website !== null && website !== undefined && website !== "",
    lat: raw.location?.latitude ?? 0,
    lng: raw.location?.longitude ?? 0,
    maps_url: raw.googleMapsUri ?? `https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(raw.displayName?.text ?? "")}`,
    city,
    neighborhood,
  };
}

// Sinonimi per categoria — moltiplica i risultati cercando termini equivalenti
const CATEGORY_SYNONYMS: Record<string, string[]> = {
  bar: ["bar", "caffè", "caffetteria", "bar tabacchi", "bar pasticceria"],
  ristorante: ["ristorante", "trattoria", "osteria", "cucina", "tavola calda"],
  pizzeria: ["pizzeria", "pizza", "pizza al taglio", "pizze e fritti"],
  parrucchiere: ["parrucchiere", "salon capelli", "barbiere parrucchiere", "hair salon"],
  barbiere: ["barbiere", "barber shop", "barber", "parrucchiere uomo"],
  "centro estetico": ["centro estetico", "estetista", "beauty center", "centro benessere estetico"],
  palestra: ["palestra", "fitness", "centro sportivo", "crossfit", "pesi"],
  dentista: ["dentista", "studio dentistico", "odontoiatra", "ortodonzia"],
  medico: ["medico", "dottore", "studio medico", "medico di base", "specialista"],
  hotel: ["hotel", "albergo", "pensione", "bed and breakfast", "b&b"],
  farmacia: ["farmacia", "farmacia comunale"],
  officina: ["officina", "meccanico", "carrozzeria", "autofficina", "gommista"],
  idraulico: ["idraulico", "impianti idraulici", "termoidraulico"],
  elettricista: ["elettricista", "impianti elettrici", "installatore"],
  avvocato: ["avvocato", "studio legale", "avvocatura", "legale"],
  commercialista: ["commercialista", "studio commercialista", "consulente fiscale", "ragioniere"],
  "agenzia immobiliare": ["agenzia immobiliare", "agenzia case", "immobiliare"],
  fioraio: ["fioraio", "fiori", "fiorista", "piante e fiori"],
  pasticceria: ["pasticceria", "dolci", "pasticcere", "gelateria pasticceria"],
  gelateria: ["gelateria", "gelato artigianale", "gelateria artigianale"],
  panetteria: ["panetteria", "panificio", "forno", "pane"],
  sartoria: ["sartoria", "sarto", "abbigliamento su misura", "atelier"],
  calzolaio: ["calzolaio", "riparazione scarpe", "ciabattino"],
  lavanderia: ["lavanderia", "lavasecco", "tintoria", "lavanderia self service"],
  ottico: ["ottico", "ottica", "occhiali", "lenti a contatto"],
  fisioterapista: ["fisioterapista", "fisioterapia", "riabilitazione", "osteopatia"],
  veterinario: ["veterinario", "clinica veterinaria", "ambulatorio veterinario"],
  "negozio abbigliamento": ["negozio abbigliamento", "boutique", "moda", "abbigliamento donna", "abbigliamento uomo"],
  tabaccheria: ["tabaccheria", "tabacchi", "edicola tabacchi", "ricevitoria"],
};

function getSynonyms(category: string): string[] {
  const lower = category.toLowerCase().trim();
  // Cerca corrispondenza esatta
  if (CATEGORY_SYNONYMS[lower]) return CATEGORY_SYNONYMS[lower];
  // Cerca corrispondenza parziale
  for (const [key, synonyms] of Object.entries(CATEGORY_SYNONYMS)) {
    if (lower.includes(key) || key.includes(lower)) return synonyms;
  }
  // Nessuna corrispondenza: usa solo la categoria originale
  return [category];
}

// Griglia 4x4 densa per massima copertura
function generateSearchGrid(
  centerLat: number,
  centerLng: number,
  radius: number
): Array<{ lat: number; lng: number; radius: number }> {
  const subRadius = Math.round(radius * 0.55);
  const step = (radius * 0.55) / 111320;
  const lngStep = step / Math.cos((centerLat * Math.PI) / 180);

  const points: Array<{ lat: number; lng: number; radius: number }> = [];

  // Griglia 4x4 = 16 punti
  for (let i = -1; i <= 2; i++) {
    for (let j = -1; j <= 2; j++) {
      points.push({
        lat: centerLat + i * step * 0.9,
        lng: centerLng + j * lngStep * 0.9,
        radius: subRadius,
      });
    }
  }

  return points;
}

export interface SearchPlacesOptions {
  category: string;
  cityLabel: string;
  cityName: string;
  neighborhood: string;
  lat: number;
  lng: number;
  radius: number;
  onlyWithoutWebsite?: boolean;
}

export async function searchPlaces(options: SearchPlacesOptions): Promise<PlaceResult[]> {
  const {
    category,
    cityLabel,
    cityName,
    neighborhood,
    lat,
    lng,
    radius,
    onlyWithoutWebsite = true,
  } = options;

  const allPlaces: PlaceResult[] = [];
  const seenIds = new Set<string>();

  const synonyms = getSynonyms(category);
  const gridPoints = generateSearchGrid(lat, lng, radius);

  // Per ogni sinonimo, cerca su tutta la griglia
  for (const synonym of synonyms) {
    for (const point of gridPoints) {
      const query = `${synonym} ${neighborhood} ${cityLabel}`;
      let pageToken: string | undefined;
      let page = 0;

      do {
        try {
          const response = await textSearch({
            query,
            lat: point.lat,
            lng: point.lng,
            radius: point.radius,
            pageToken,
          });

          pageToken = response.nextPageToken;

          for (const raw of response.places ?? []) {
            if (seenIds.has(raw.id)) continue;
            seenIds.add(raw.id);

            const place = mapRawPlace(raw, cityName, neighborhood);
            if (onlyWithoutWebsite && place.has_website) continue;
            allPlaces.push(place);
          }

          page++;
          if (pageToken) await new Promise((r) => setTimeout(r, 150));
        } catch {
          break;
        }
      } while (pageToken && page < 2);

      await new Promise((r) => setTimeout(r, 100));
    }
  }

  return allPlaces;
}

// Mapping tipi Google → label italiana leggibile
export const TYPE_LABELS: Record<string, string> = {
  restaurant: "Ristorante",
  bar: "Bar",
  cafe: "Caffè",
  pizza_restaurant: "Pizzeria",
  fast_food_restaurant: "Fast Food",
  bakery: "Panetteria / Pasticceria",
  beauty_salon: "Centro Estetico",
  hair_care: "Parrucchiere",
  barber_shop: "Barbiere",
  gym: "Palestra",
  fitness_center: "Centro Fitness",
  dentist: "Dentista",
  doctor: "Medico",
  pharmacy: "Farmacia",
  hotel: "Hotel",
  lodging: "Alloggio",
  clothing_store: "Negozio di Abbigliamento",
  shoe_store: "Negozio di Scarpe",
  supermarket: "Supermercato",
  florist: "Fioraio",
  car_repair: "Officina",
  laundry: "Lavanderia",
  dry_cleaning: "Lavanderia a Secco",
  nail_salon: "Centro Unghie",
  spa: "Spa / Centro Benessere",
  physiotherapist: "Fisioterapista",
  optician: "Ottico",
  travel_agency: "Agenzia Viaggi",
  real_estate_agency: "Agenzia Immobiliare",
  insurance_agency: "Agenzia Assicurativa",
  accounting: "Commercialista",
  lawyer: "Avvocato",
  notary_public: "Notaio",
  veterinary_care: "Veterinario",
  pet_store: "Negozio Animali",
  electronics_store: "Negozio Elettronica",
  furniture_store: "Negozio Arredamento",
  hardware_store: "Ferramenta",
  book_store: "Libreria",
  jewelry_store: "Gioielleria",
  night_club: "Discoteca / Locale",
  movie_theater: "Cinema",
  tourist_attraction: "Attrazione Turistica",
  art_gallery: "Galleria d'Arte",
  museum: "Museo",
  park: "Parco",
  school: "Scuola",
  university: "Università",
  library: "Biblioteca",
  hospital: "Ospedale",
  police: "Polizia",
  fire_station: "Vigili del Fuoco",
  post_office: "Ufficio Postale",
  bank: "Banca",
  atm: "Bancomat",
  gas_station: "Stazione di Servizio",
  car_wash: "Autolavaggio",
  parking: "Parcheggio",
  storage: "Magazzino",
  moving_company: "Traslochi",
  electrician: "Elettricista",
  plumber: "Idraulico",
  painter: "Imbianchino",
  roofing_contractor: "Carpentiere",
  general_contractor: "Impresa Edile",
  cleaning_service: "Impresa di Pulizie",
};

export function formatType(type: string | null): string {
  if (!type) return "Attività";
  return TYPE_LABELS[type] ?? type.replace(/_/g, " ").replace(/\b\w/g, (c) => c.toUpperCase());
}
