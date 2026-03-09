// lib/neighborhoods.ts
// Dataset locale quartieri/zone Campania
// Modifica liberamente questo file per aggiungere/rimuovere quartieri
// lat/lng = centro della zona, radius = raggio in metri per la ricerca Places

export interface Neighborhood {
  name: string;
  lat: number;
  lng: number;
  radius: number; // metri
}

export interface City {
  name: string;
  label: string;
  lat: number;
  lng: number;
  defaultRadius: number;
  neighborhoods: Neighborhood[];
}

export const CITIES: City[] = [
  {
    name: "napoli",
    label: "Napoli",
    lat: 40.8518,
    lng: 14.2681,
    defaultRadius: 2000,
    neighborhoods: [
      { name: "Centro Storico", lat: 40.8496, lng: 14.2573, radius: 900 },
      { name: "Chiaia", lat: 40.8333, lng: 14.2333, radius: 1000 },
      { name: "Vomero", lat: 40.8478, lng: 14.2322, radius: 1200 },
      { name: "Posillipo", lat: 40.8140, lng: 14.2007, radius: 1000 },
      { name: "Mergellina", lat: 40.8290, lng: 14.2220, radius: 700 },
      { name: "Fuorigrotta", lat: 40.8257, lng: 14.1918, radius: 1000 },
      { name: "Bagnoli", lat: 40.8116, lng: 14.1684, radius: 1200 },
      { name: "Pozzuoli (area Napoli)", lat: 40.8227, lng: 14.1254, radius: 1000 },
      { name: "Secondigliano", lat: 40.9022, lng: 14.2636, radius: 1100 },
      { name: "Scampia", lat: 40.9059, lng: 14.2456, radius: 1000 },
      { name: "Miano", lat: 40.8900, lng: 14.2600, radius: 800 },
      { name: "San Giovanni a Teduccio", lat: 40.8383, lng: 14.3150, radius: 1000 },
      { name: "Barra", lat: 40.8270, lng: 14.3294, radius: 1100 },
      { name: "Ponticelli", lat: 40.8388, lng: 14.3388, radius: 1000 },
      { name: "Poggioreale", lat: 40.8600, lng: 14.2900, radius: 900 },
      { name: "Pianura", lat: 40.8500, lng: 14.1600, radius: 1200 },
      { name: "Soccavo", lat: 40.8530, lng: 14.1900, radius: 1000 },
      { name: "Chiaiano", lat: 40.8830, lng: 14.2100, radius: 1000 },
      { name: "Piscinola", lat: 40.9000, lng: 14.2200, radius: 1000 },
      { name: "Mianella", lat: 40.8700, lng: 14.2400, radius: 800 },
      { name: "Quartieri Spagnoli", lat: 40.8440, lng: 14.2510, radius: 600 },
      { name: "Borgo Sant'Antonio Abate", lat: 40.8590, lng: 14.2700, radius: 600 },
      { name: "Stella", lat: 40.8680, lng: 14.2620, radius: 700 },
      { name: "San Carlo all'Arena", lat: 40.8700, lng: 14.2680, radius: 700 },
      { name: "Vicaria", lat: 40.8590, lng: 14.2800, radius: 700 },
      { name: "San Lorenzo", lat: 40.8530, lng: 14.2700, radius: 700 },
      { name: "Pendino", lat: 40.8480, lng: 14.2700, radius: 600 },
      { name: "Porto", lat: 40.8430, lng: 14.2640, radius: 600 },
      { name: "Mercato", lat: 40.8490, lng: 14.2760, radius: 600 },
    ],
  },
  {
    name: "salerno",
    label: "Salerno",
    lat: 40.6824,
    lng: 14.7681,
    defaultRadius: 1500,
    neighborhoods: [
      { name: "Centro Storico", lat: 40.6825, lng: 14.7580, radius: 700 },
      { name: "Pastena", lat: 40.6750, lng: 14.7650, radius: 800 },
      { name: "Torrione", lat: 40.6700, lng: 14.7780, radius: 900 },
      { name: "Mercatello", lat: 40.6830, lng: 14.7700, radius: 700 },
      { name: "Fratte", lat: 40.7020, lng: 14.7550, radius: 900 },
      { name: "Ogliara", lat: 40.7100, lng: 14.7400, radius: 1000 },
      { name: "Arbostella", lat: 40.6630, lng: 14.7870, radius: 900 },
      { name: "Stadio Arechi", lat: 40.6590, lng: 14.7900, radius: 800 },
      { name: "Mariconda", lat: 40.6550, lng: 14.8020, radius: 900 },
      { name: "Matierno", lat: 40.6980, lng: 14.8100, radius: 1000 },
    ],
  },
  {
    name: "caserta",
    label: "Caserta",
    lat: 41.0736,
    lng: 14.3328,
    defaultRadius: 1500,
    neighborhoods: [
      { name: "Centro", lat: 41.0745, lng: 14.3329, radius: 800 },
      { name: "San Leucio", lat: 41.0950, lng: 14.3210, radius: 900 },
      { name: "Casertavecchia", lat: 41.0850, lng: 14.3700, radius: 700 },
      { name: "Acquaviva", lat: 41.0550, lng: 14.3150, radius: 1000 },
      { name: "Tredici", lat: 41.0650, lng: 14.3620, radius: 900 },
      { name: "Tuoro", lat: 41.0830, lng: 14.3500, radius: 900 },
      { name: "Petrarelle", lat: 41.0900, lng: 14.3180, radius: 900 },
      { name: "San Clemente", lat: 41.0600, lng: 14.3400, radius: 800 },
    ],
  },
  {
    name: "benevento",
    label: "Benevento",
    lat: 41.1297,
    lng: 14.7824,
    defaultRadius: 1500,
    neighborhoods: [
      { name: "Centro Storico", lat: 41.1297, lng: 14.7824, radius: 700 },
      { name: "Libertà", lat: 41.1350, lng: 14.7900, radius: 800 },
      { name: "Ferrovia", lat: 41.1200, lng: 14.7800, radius: 800 },
      { name: "Pacevecchia", lat: 41.1400, lng: 14.8000, radius: 900 },
      { name: "Mellusi", lat: 41.1250, lng: 14.7700, radius: 900 },
      { name: "Capodimonte", lat: 41.1450, lng: 14.7900, radius: 1000 },
      { name: "Rione Ferrovia", lat: 41.1180, lng: 14.7850, radius: 700 },
    ],
  },
  {
    name: "avellino",
    label: "Avellino",
    lat: 40.9148,
    lng: 14.7902,
    defaultRadius: 1500,
    neighborhoods: [
      { name: "Centro", lat: 40.9148, lng: 14.7902, radius: 700 },
      { name: "Valle", lat: 40.9200, lng: 14.7980, radius: 800 },
      { name: "Ferriera", lat: 40.9050, lng: 14.7850, radius: 800 },
      { name: "Picarelli", lat: 40.9300, lng: 14.8100, radius: 900 },
      { name: "Bagnoli Irpino (zona)", lat: 40.8300, lng: 15.0600, radius: 1000 },
      { name: "Borgo", lat: 40.9100, lng: 14.7800, radius: 800 },
      { name: "Pennini", lat: 40.9220, lng: 14.7840, radius: 700 },
    ],
  },
  {
    name: "pozzuoli",
    label: "Pozzuoli",
    lat: 40.8227,
    lng: 14.1254,
    defaultRadius: 1200,
    neighborhoods: [
      { name: "Centro Storico", lat: 40.8260, lng: 14.1213, radius: 600 },
      { name: "Anfiteatro", lat: 40.8310, lng: 14.1310, radius: 700 },
      { name: "Lucrino", lat: 40.8370, lng: 14.0830, radius: 800 },
      { name: "Baia", lat: 40.8133, lng: 14.0729, radius: 800 },
      { name: "Arco Felice", lat: 40.8183, lng: 14.0546, radius: 800 },
      { name: "Monterusciello", lat: 40.8470, lng: 14.1060, radius: 1000 },
      { name: "Toiano", lat: 40.8380, lng: 14.1400, radius: 900 },
    ],
  },
  {
    name: "torre_del_greco",
    label: "Torre del Greco",
    lat: 40.7896,
    lng: 14.3618,
    defaultRadius: 1200,
    neighborhoods: [
      { name: "Centro", lat: 40.7896, lng: 14.3618, radius: 700 },
      { name: "Via Nazionale", lat: 40.7950, lng: 14.3700, radius: 700 },
      { name: "Leopardi", lat: 40.7830, lng: 14.3550, radius: 800 },
      { name: "Scuoppo", lat: 40.7720, lng: 14.3480, radius: 900 },
      { name: "Trecase (zona)", lat: 40.7600, lng: 14.4200, radius: 1000 },
    ],
  },
  {
    name: "giugliano",
    label: "Giugliano in Campania",
    lat: 40.9272,
    lng: 14.1943,
    defaultRadius: 1500,
    neighborhoods: [
      { name: "Centro", lat: 40.9272, lng: 14.1943, radius: 900 },
      { name: "Via Sannitica", lat: 40.9350, lng: 14.2050, radius: 900 },
      { name: "Lago Patria", lat: 40.9600, lng: 14.0900, radius: 1000 },
      { name: "Varcaturo", lat: 40.9700, lng: 14.0600, radius: 1000 },
      { name: "Licola", lat: 40.9600, lng: 14.0300, radius: 900 },
    ],
  },
  {
    name: "castellammare",
    label: "Castellammare di Stabia",
    lat: 40.6947,
    lng: 14.4813,
    defaultRadius: 1200,
    neighborhoods: [
      { name: "Centro", lat: 40.6947, lng: 14.4813, radius: 700 },
      { name: "Terme", lat: 40.7000, lng: 14.4900, radius: 700 },
      { name: "Quisisana", lat: 40.7050, lng: 14.4750, radius: 800 },
      { name: "Scanzano", lat: 40.6830, lng: 14.4950, radius: 900 },
      { name: "Moscarella", lat: 40.7100, lng: 14.4700, radius: 900 },
    ],
  },
  {
    name: "amalfi",
    label: "Amalfi",
    lat: 40.6339,
    lng: 14.6026,
    defaultRadius: 1000,
    neighborhoods: [
      { name: "Centro Storico", lat: 40.6339, lng: 14.6026, radius: 500 },
      { name: "Pogerola", lat: 40.6490, lng: 14.5990, radius: 600 },
      { name: "Lone", lat: 40.6280, lng: 14.6100, radius: 600 },
      { name: "Vettica Minore", lat: 40.6400, lng: 14.5750, radius: 600 },
    ],
  },
  {
    name: "sorrento",
    label: "Sorrento",
    lat: 40.6262,
    lng: 14.3757,
    defaultRadius: 1000,
    neighborhoods: [
      { name: "Centro", lat: 40.6262, lng: 14.3757, radius: 600 },
      { name: "Marina Piccola", lat: 40.6200, lng: 14.3780, radius: 500 },
      { name: "Marina Grande", lat: 40.6290, lng: 14.3680, radius: 500 },
      { name: "Priora", lat: 40.6320, lng: 14.3900, radius: 700 },
      { name: "Capo di Sorrento", lat: 40.6150, lng: 14.3550, radius: 800 },
      { name: "Sant'Agnello", lat: 40.6350, lng: 14.3880, radius: 800 },
    ],
  },
  {
    name: "pompei",
    label: "Pompei",
    lat: 40.7461,
    lng: 14.4992,
    defaultRadius: 1000,
    neighborhoods: [
      { name: "Centro", lat: 40.7461, lng: 14.4992, radius: 700 },
      { name: "Villa dei Misteri", lat: 40.7480, lng: 14.4840, radius: 600 },
      { name: "Scavi", lat: 40.7510, lng: 14.4880, radius: 600 },
      { name: "Moregine", lat: 40.7350, lng: 14.5050, radius: 800 },
    ],
  },
  {
    name: "ercolano",
    label: "Ercolano",
    lat: 40.8063,
    lng: 14.3524,
    defaultRadius: 1000,
    neighborhoods: [
      { name: "Centro", lat: 40.8063, lng: 14.3524, radius: 700 },
      { name: "Scavi", lat: 40.8060, lng: 14.3480, radius: 600 },
      { name: "Miglio d'Oro", lat: 40.8150, lng: 14.3650, radius: 800 },
      { name: "Portici (zona)", lat: 40.8200, lng: 14.3400, radius: 900 },
    ],
  },
];

export function getCityByName(name: string): City | undefined {
  return CITIES.find((c) => c.name === name);
}

export function getCityOptions() {
  return CITIES.map((c) => ({ value: c.name, label: c.label }));
}

export function getNeighborhoodOptions(cityName: string) {
  const city = getCityByName(cityName);
  if (!city) return [];
  return city.neighborhoods.map((n) => ({ value: n.name, label: n.name }));
}
