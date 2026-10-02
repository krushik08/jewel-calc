export type MetalKey = "silver" | "10k" | "14k" | "18k" | "platinum";

export type StoneType = "lab" | "moissanite" | "oldmine";

/** Which "Add New Item" tab an item was created from. */
export type ItemKind = "single" | "multiple";

export type CenterSize = "0.50" | "1.00" | "2.00" | "3.00" | "4.00" | "5.00";

/** Center stones are priced per stone; side stones per carat. */
export interface StoneRates {
  center: Record<CenterSize, number>;
  sidePerCarat: number;
}

export interface Rates {
  metalPerGram: Record<MetalKey, number>;
  stones: Record<StoneType, StoneRates>;
}

/** All values are whole-number percentages (40 = 40%). */
export interface PricingParams {
  discount: number;
  marketplaceFee: number;
  targetProfit: number;
}

export interface Ring {
  id: string;
  name: string;
  metal: MetalKey;
  grams: number;
  stoneType: StoneType;
  centerSize: CenterSize | null;
  sideCarats: number;
  /** Optional so items saved before this field existed still load (treated as "single"). */
  kind?: ItemKind;
}

export type RingDraft = Omit<Ring, "id">;

export interface CostBreakdown {
  metal: number;
  center: number;
  side: number;
  total: number;
}

export interface PriceBreakdown {
  sell: number;
  mrp: number;
  fee: number;
  receive: number;
  profit: number;
  /** Profit ÷ cost, as a percentage. */
  profitOnCost: number;
}

export interface RingRow {
  ring: Ring;
  cost: CostBreakdown;
  price: PriceBreakdown;
}

export interface SingleItemDraftState {
  name: string;
  metal: MetalKey;
  grams: string;
  stoneType: StoneType;
  centerSize: CenterSize | "none";
  sideCarats: string;
}

export type MultipleSidesState = Record<CenterSize, string>;

export interface MultipleItemsDraftState {
  name: string;
  metal: MetalKey;
  stoneType: StoneType;
  baseGrams: string;
  stepGrams: string;
  sides: MultipleSidesState;
}

