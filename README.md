# Jewel Calc — Next.js

Item pricing calculator (cost → sell price → MRP) rebuilt with **Next.js 16 (App Router) + Tailwind CSS v4 + shadcn/ui + Zustand**, light purple theme, fully responsive.

## Run

```bash
npm install
cp .env.example .env.local   # optional: set your own PIN
npm run dev                  # http://localhost:3000
npm run build && npm start   # production
```

## Folder structure

```
app/
  layout.tsx              fonts, <Toaster />, metadata
  page.tsx                renders <JewelCalcApp />
  globals.css             Tailwind + shadcn tokens (light purple palette lives here)

components/
  ui/                     shadcn/ui primitives (button, card, dialog, select, slider, table, tabs …)
  jewel-calc/
    jewel-calc-app.tsx   page composition + hydration gate
    layout/               app-header, app-footer, section-heading
    owner/                owner-panel, pricing-controls (sliders), rate-editor (tabs),
                          rate-input, pin-dialog
    rings/                add-ring-form, cost-preview, discount-control, summary-cards,
                          rings-section, rings-table (≥md), ring-card-list (<md),
                          ring-name-cell, delete-ring-button

lib/
  constants.ts            default rates, metals, stone types, PIN, slider limits
  pricing.ts              pure math: calcCost, calcPrice, getMultipliers
  columns.ts              ONE column config → table, mobile cards and CSV
  csv.ts                  CSV export (respects owner/employee visibility)
  format.ts, utils.ts

store/pricing-store.ts    Zustand store, persisted to localStorage (rates, params, rings)
hooks/                    use-hydrated-store (SSR-safe rehydrate), use-ring-rows (derived prices)
types/pricing.ts          all domain types
```

## Where to change things

| Want to…                                  | Edit                                   |
|-------------------------------------------|----------------------------------------|
| Change default rates                      | `lib/constants.ts` → `DEFAULT_RATES`   |
| Add a stone type                          | `types/pricing.ts` + `STONE_TYPES` + `DEFAULT_RATES` |
| Hide/show a column for employees          | `lib/columns.ts` → `ownerOnly`         |
| Change pricing formula                    | `lib/pricing.ts`                       |
| Re-theme (colour)                         | `app/globals.css` → change hue `293`   |

## Formula

```
Sell = Cost × (1 + profit%) ÷ (1 − marketplace%)
MRP  = Sell ÷ (1 − discount%)
```

## Known limitations

- **The PIN is not security.** It is compiled into the browser bundle. Anyone can read it or open
  localStorage. Real protection needs server-side auth (e.g. NextAuth / Supabase Auth) with
  owner-only data served from an API.
- **Employees can still derive your profit**: `Total Cost` and `You Receive` are visible (same as the
  original), and Profit = You Receive − Total Cost. Set `ownerOnly: true` on `totalCost` in
  `lib/columns.ts` to close that.
- Data is per-browser (localStorage). Two devices will not share items or rates.
