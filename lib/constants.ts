import type {
  CenterSize,
  ItemKind,
  MetalKey,
  PricingParams,
  Rates,
  StoneType,
} from "@/types/pricing";

/**
 * Client-side PIN. Anything prefixed NEXT_PUBLIC_ is bundled into the
 * browser, so this only keeps casual users out — it is not access control.
 */
export const OWNER_PIN = process.env.NEXT_PUBLIC_OWNER_PIN ?? "4141";

export const METALS: { key: MetalKey; label: string }[] = [
  { key: "silver", label: "Silver" },
  { key: "10k", label: "10K Gold" },
  { key: "14k", label: "14K Gold" },
  { key: "18k", label: "18K Gold" },
  { key: "platinum", label: "Platinum" },
];

export const METAL_LABEL = Object.fromEntries(
  METALS.map((m) => [m.key, m.label])
) as Record<MetalKey, string>;

/**
 * Weight of the same ring relative to silver (density ratio).
 * Used to auto-convert grams when the metal is switched in the form.
 */
export const METAL_WEIGHT_FACTOR: Record<MetalKey, number> = {
  silver: 1,
  "10k": 1.11,
  "14k": 1.25,
  "18k": 1.46,
  platinum: 2.06,
};

export const ITEM_KINDS: { key: ItemKind; label: string }[] = [
  { key: "single", label: "Single Item" },
  { key: "multiple", label: "Multiple Items" },
];

export const CENTER_SIZES: CenterSize[] = ["0.50", "1.00", "2.00", "3.00", "4.00", "5.00"];

/** Fixed center sizes offered in the "Multiple Items" tab (one variant each). */
export const MULTIPLE_CENTER_SIZES: CenterSize[] = ["0.50", "1.00", "2.00", "3.00", "4.00", "5.00"];

export const STONE_TYPES: { key: StoneType; label: string; short: string; colorVar: string }[] = [
  { key: "lab", label: "Lab Grown Diamond", short: "LGD", colorVar: "var(--stone-lab)" },
  { key: "moissanite", label: "Moissanite", short: "Moissanite", colorVar: "var(--stone-moissanite)" },
  { key: "oldmine", label: "Old Mine Cut", short: "Old Mine Cut", colorVar: "var(--stone-oldmine)" },
  {
    key: "oldmine_moissanite",
    label: "Old Mine Moissanite",
    short: "OM Moissanite",
    colorVar: "var(--stone-oldmine-moiss)",
  },
];

export const STONE_META = Object.fromEntries(STONE_TYPES.map((s) => [s.key, s])) as Record<
  StoneType,
  (typeof STONE_TYPES)[number]
>;

export const DEFAULT_RATES: Rates = {
  metalPerGram: { silver: 9, "10k": 94, "14k": 125, "18k": 155, platinum: 160 },
  stones: {
    lab: {
      center: { "0.50": 70, "1.00": 140, "2.00": 275, "3.00": 410, "4.00": 600, "5.00": 710 },
      sidePerCarat: 120,
    },
    moissanite: {
      center: { "0.50": 15, "1.00": 30, "2.00": 55, "3.00": 85, "4.00": 110, "5.00": 145 },
      sidePerCarat: 25,
    },
    oldmine: {
      center: { "0.50": 90, "1.00": 180, "2.00": 350, "3.00": 520, "4.00": 750, "5.00": 950 },
      sidePerCarat: 120,
    },
    oldmine_moissanite: {
      center: { "0.50": 20, "1.00": 40, "2.00": 80, "3.00": 120, "4.00": 160, "5.00": 200 },
      sidePerCarat: 25,
    },
  },
};

export const DEFAULT_PARAMS: PricingParams = {
  discount: 40,
  marketplaceFee: 10,
  targetProfit: 50,
};

export const PARAM_LIMITS = {
  discount: { min: 0, max: 70, step: 1 },
  marketplaceFee: { min: 0, max: 30, step: 1 },
  targetProfit: { min: 10, max: 200, step: 5 },
} as const;

export const DEFAULT_SINGLE_DRAFT = {
  name: "",
  metal: "18k" as MetalKey,
  grams: "",
  stoneType: "lab" as StoneType,
  centerSize: "none" as CenterSize | "none",
  sideCarats: "",
};

export const DEFAULT_MULTIPLE_SIDES = Object.fromEntries(
  MULTIPLE_CENTER_SIZES.map((s) => [s, ""])
) as Record<CenterSize, string>;

export const DEFAULT_MULTIPLE_DRAFT = {
  name: "",
  metal: "18k" as MetalKey,
  stoneType: "lab" as StoneType,
  baseGrams: "",
  stepGrams: "",
  sides: DEFAULT_MULTIPLE_SIDES,
};

export const DEFAULT_ACTIVE_TAB: ItemKind = "single";

export const STORAGE_KEY = "jewel-calc:v1";

