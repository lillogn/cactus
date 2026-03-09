# 🌵 CACTUS — Lead Generation Locale

Dashboard professionale per trovare business locali in Campania **senza sito web**.

---

## Stack

- **Next.js 14** (App Router, full-stack)
- **Supabase** (PostgreSQL + Auth)
- **Google Places API (New)**
- **Vercel** (deploy)

---

## Setup in 5 passi

### 1. Attiva Google Places API

1. Vai su [Google Cloud Console](https://console.cloud.google.com)
2. Crea un nuovo progetto (es. "cactus-leads")
3. Vai su **APIs & Services → Library**
4. Cerca **"Places API (New)"** e abilitala
5. Vai su **APIs & Services → Credentials**
6. Clicca **Create Credentials → API Key**
7. Copia la chiave
8. **Importante**: Vai su "Edit API Key" → Restriczioni → limita all'IP del server per sicurezza

> 💡 **Costi stimati**: ~$32/1.000 Text Search calls. Con cache ibrida, un team piccolo spende ~$20-40/mese.

### 2. Crea progetto Supabase

1. Vai su [app.supabase.com](https://app.supabase.com)
2. Crea un nuovo progetto
3. Vai su **SQL Editor**
4. Esegui tutto il contenuto di `supabase/schema.sql`
5. Vai su **Settings → API** e copia:
   - `Project URL`
   - `anon public` key
   - `service_role` key

### 3. Configura variabili ambiente

```bash
cp .env.local.example .env.local
```

Modifica `.env.local` con i tuoi valori:

```
NEXT_PUBLIC_SUPABASE_URL=https://xxxxx.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=eyJ...
SUPABASE_SERVICE_ROLE_KEY=eyJ...
GOOGLE_PLACES_API_KEY=AIzaSy...
```

### 4. Installa e avvia

```bash
npm install
npm run dev
```

Apri [http://localhost:3000](http://localhost:3000)

### 5. Crea utenti team

In Supabase → **Authentication → Users → Add User**  
Aggiungi le email del tuo team. Ogni membro può accedere con email + password.

---

## Deploy su Vercel

```bash
npm install -g vercel
vercel
```

Aggiungi le variabili ambiente nel pannello Vercel → Settings → Environment Variables.

---

## Struttura progetto

```
cactus/
├── app/
│   ├── login/              # Pagina di login
│   ├── dashboard/
│   │   ├── page.tsx        # Ricerca principale
│   │   ├── favorites/      # Preferiti
│   │   └── history/        # Cronologia
│   └── api/
│       ├── search/         # Endpoint ricerca (Places API + cache)
│       ├── favorites/      # CRUD preferiti
│       └── history/        # Storico ricerche
├── components/
│   ├── Sidebar.tsx
│   ├── SearchPanel.tsx
│   ├── ResultsTable.tsx
│   └── LeadDetailPanel.tsx
├── lib/
│   ├── neighborhoods.ts    # Dataset quartieri Campania
│   ├── google-places.ts    # Integrazione Places API
│   ├── lead-score.ts       # Calcolo score lead
│   ├── export.ts           # Export CSV/Excel
│   ├── supabase.ts         # Client browser
│   └── supabase-server.ts  # Client server
└── supabase/
    └── schema.sql          # Schema database completo
```

---

## Aggiungere quartieri

Modifica `lib/neighborhoods.ts` — è un semplice array JSON:

```typescript
{ name: "Nuovo Quartiere", lat: 40.xxxx, lng: 14.xxxx, radius: 800 }
```

## Aggiungere città

Aggiungi un oggetto all'array `CITIES` in `lib/neighborhoods.ts` seguendo il pattern esistente.

---

## Definizione "business senza sito"

Un business è considerato **lead** quando il campo `websiteUri` è assente nella risposta di Google Places Text Search.  
Questo è il criterio ufficiale basato sui dati Google — non fa scraping, non viola TOS.

---

## Lead Score

Calcolato automaticamente in `lib/lead-score.ts`:

| Condizione | Punti |
|---|---|
| Telefono presente | +25 |
| Nessun sito web | +30 |
| Recensioni ≥ 100 | +25 |
| Recensioni 30-99 | +15 |
| Rating ≥ 4.5 | +20 |
| Rating ≥ 4.0 | +15 |

- 🔥 **Caldo**: score ≥ 70
- **Tiepido**: score 40-69
- **Freddo**: score < 40

---

## Roadmap v2

- [ ] Lead scoring avanzato personalizzabile
- [ ] Mappa interattiva risultati
- [ ] Multi-regione (Puglia, Lazio, Sicilia...)
- [ ] Filtri avanzati (solo con telefono, rating minimo, ecc.)
- [ ] Notifiche nuovi lead in zone salvate
- [ ] Dashboard analytics team
