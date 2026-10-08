"use client";

import { create } from "zustand";
import { createJSONStorage, persist } from "zustand/middleware";

import {
  DEFAULT_ACTIVE_TAB,
  DEFAULT_MULTIPLE_DRAFT,
  DEFAULT_PARAMS,
  DEFAULT_RATES,
  DEFAULT_SINGLE_DRAFT,
  STORAGE_KEY,
} from "@/lib/constants";
import type {
  AppVersion,
  CenterSize,
  ItemKind,
  MetalKey,
  MultipleItemsDraftState,
  PricingParams,
  Rates,
  Ring,
  RingDraft,
  SingleItemDraftState,
  StoneRates,
  StoneType,
} from "@/types/pricing";

interface PricingState {
  appVersion: AppVersion;
  rates: Rates;
  params: PricingParams;
  rings: Ring[];
  singleDraft: SingleItemDraftState;
  multipleDraft: MultipleItemsDraftState;
  activeTab: ItemKind;
  isOwner: boolean;

  setAppVersion: (version: AppVersion) => void;
  setMetalRate: (metal: MetalKey, value: number) => void;
  setCenterRate: (stone: StoneType, size: CenterSize, value: number) => void;
  setSideRate: (stone: StoneType, value: number) => void;
  resetRates: () => void;

  setParam: (key: keyof PricingParams, value: number) => void;
  resetParams: () => void;

  addRing: (draft: RingDraft) => void;
  addRings: (drafts: RingDraft[]) => void;
  removeRing: (id: string) => void;
  deleteRings: (ids: string[]) => void;
  duplicateRing: (id: string) => void;
  clearRings: () => void;

  setSingleDraft: (patch: Partial<SingleItemDraftState>) => void;
  resetSingleDraft: () => void;

  setMultipleDraft: (patch: Partial<MultipleItemsDraftState>) => void;
  setMultipleSide: (size: CenterSize, value: string) => void;
  resetMultipleDraft: () => void;

  setActiveTab: (tab: ItemKind) => void;

  /** Resets everything (rates, params, table items, active calculations) back to factory defaults. */
  resetAll: () => void;

  login: () => void;
  logout: () => void;
}

const cloneRates = (): Rates => structuredClone(DEFAULT_RATES);
const cloneSingleDraft = (): SingleItemDraftState => ({ ...DEFAULT_SINGLE_DRAFT });
const cloneMultipleDraft = (): MultipleItemsDraftState => ({
  ...DEFAULT_MULTIPLE_DRAFT,
  sides: { ...DEFAULT_MULTIPLE_DRAFT.sides },
});

type PersistedState = Pick<
  PricingState,
  "appVersion" | "rates" | "params" | "rings" | "singleDraft" | "multipleDraft" | "activeTab" | "isOwner"
>;

/**
 * Upgrades data saved in the browser by older versions of the app.
 * v1 → v2: "Natural Diamond" stone type removed — drop its rates and any rings using it.
 */
function migrate(persisted: unknown, fromVersion: number): PersistedState {
  const state = (persisted && typeof persisted === "object" ? persisted : {}) as any;
  if (fromVersion < 2 && state.rates) {
    const { natural: _removed, ...stones } = (state.rates.stones || {}) as Record<string, StoneRates>;
    state.rates = {
      ...DEFAULT_RATES,
      ...state.rates,
      stones: { ...DEFAULT_RATES.stones, ...stones } as Rates["stones"],
    };
    if (Array.isArray(state.rings)) {
      state.rings = state.rings.filter((r: any) => (r.stoneType as string) !== "natural");
    }
  }
  return state as PersistedState;
}

export const usePricingStore = create<PricingState>()(
  persist(
    (set) => ({
      appVersion: "v2",
      rates: cloneRates(),
      params: { ...DEFAULT_PARAMS },
      rings: [],
      singleDraft: cloneSingleDraft(),
      multipleDraft: cloneMultipleDraft(),
      activeTab: DEFAULT_ACTIVE_TAB,
      isOwner: false,

      setAppVersion: (appVersion) => set({ appVersion }),

      setMetalRate: (metal, value) =>
        set((s) => ({
          rates: { ...s.rates, metalPerGram: { ...s.rates.metalPerGram, [metal]: value } },
        })),

      setCenterRate: (stone, size, value) =>
        set((s) => {
          const current = s.rates.stones[stone];
          return {
            rates: {
              ...s.rates,
              stones: {
                ...s.rates.stones,
                [stone]: { ...current, center: { ...current.center, [size]: value } },
              },
            },
          };
        }),

      setSideRate: (stone, value) =>
        set((s) => ({
          rates: {
            ...s.rates,
            stones: {
              ...s.rates.stones,
              [stone]: { ...s.rates.stones[stone], sidePerCarat: value },
            },
          },
        })),

      resetRates: () => set({ rates: cloneRates() }),

      setParam: (key, value) => set((s) => ({ params: { ...s.params, [key]: value } })),
      resetParams: () => set({ params: { ...DEFAULT_PARAMS } }),

      addRing: (draft) =>
        set((s) => ({ rings: [...s.rings, { ...draft, id: crypto.randomUUID() }] })),
      addRings: (drafts) =>
        set((s) => ({
          rings: [...s.rings, ...drafts.map((d) => ({ ...d, id: crypto.randomUUID() }))],
        })),
      removeRing: (id) => set((s) => ({ rings: s.rings.filter((r) => r.id !== id) })),
      deleteRings: (ids) =>
        set((s) => ({ rings: s.rings.filter((r) => !ids.includes(r.id)) })),
      duplicateRing: (id) =>
        set((s) => {
          const target = s.rings.find((r) => r.id === id);
          if (!target) return s;
          const copy: Ring = {
            ...target,
            id: crypto.randomUUID(),
            name: `${target.name} (Copy)`,
          };
          return { rings: [...s.rings, copy] };
        }),
      clearRings: () => set({ rings: [] }),

      setSingleDraft: (patch) =>
        set((s) => ({
          singleDraft: { ...s.singleDraft, ...patch },
        })),
      resetSingleDraft: () => set({ singleDraft: cloneSingleDraft() }),

      setMultipleDraft: (patch) =>
        set((s) => ({
          multipleDraft: { ...s.multipleDraft, ...patch },
        })),
      setMultipleSide: (size, value) =>
        set((s) => ({
          multipleDraft: {
            ...s.multipleDraft,
            sides: { ...s.multipleDraft.sides, [size]: value },
          },
        })),
      resetMultipleDraft: () => set({ multipleDraft: cloneMultipleDraft() }),

      setActiveTab: (tab) => set({ activeTab: tab }),

      resetAll: () =>
        set({
          appVersion: "v2",
          rates: cloneRates(),
          params: { ...DEFAULT_PARAMS },
          rings: [],
          singleDraft: cloneSingleDraft(),
          multipleDraft: cloneMultipleDraft(),
          activeTab: DEFAULT_ACTIVE_TAB,
        }),

      login: () => set({ isOwner: true }),
      logout: () => set({ isOwner: false }),
    }),
    {
      name: STORAGE_KEY,
      version: 3,
      migrate,
      storage: createJSONStorage(() => localStorage),
      // Rehydrated manually after mount to avoid SSR hydration mismatch.
      skipHydration: true,
      partialize: ({ appVersion, rates, params, rings, singleDraft, multipleDraft, activeTab, isOwner }) => ({
        appVersion,
        rates,
        params,
        rings,
        singleDraft,
        multipleDraft,
        activeTab,
        isOwner,
      }),
      merge: (persistedState, currentState) => {
        const persisted = (persistedState as Partial<PricingState>) || {};
        return {
          ...currentState,
          ...persisted,
          appVersion: persisted.appVersion === "v1" ? "v1" : "v2",
          rates: {
            metalPerGram: {
              ...DEFAULT_RATES.metalPerGram,
              ...(persisted.rates?.metalPerGram || {}),
            },
            stones: {
              lab: {
                center: {
                  ...DEFAULT_RATES.stones.lab.center,
                  ...(persisted.rates?.stones?.lab?.center || {}),
                },
                sidePerCarat:
                  persisted.rates?.stones?.lab?.sidePerCarat ??
                  DEFAULT_RATES.stones.lab.sidePerCarat,
              },
              moissanite: {
                center: {
                  ...DEFAULT_RATES.stones.moissanite.center,
                  ...(persisted.rates?.stones?.moissanite?.center || {}),
                },
                sidePerCarat:
                  persisted.rates?.stones?.moissanite?.sidePerCarat ??
                  DEFAULT_RATES.stones.moissanite.sidePerCarat,
              },
              oldmine: {
                center: {
                  ...DEFAULT_RATES.stones.oldmine.center,
                  ...(persisted.rates?.stones?.oldmine?.center || {}),
                },
                sidePerCarat:
                  persisted.rates?.stones?.oldmine?.sidePerCarat ??
                  DEFAULT_RATES.stones.oldmine.sidePerCarat,
              },
            },
          },
          params: {
            ...DEFAULT_PARAMS,
            ...(persisted.params || {}),
          },
          rings: Array.isArray(persisted.rings) ? persisted.rings : [],
          singleDraft: {
            ...DEFAULT_SINGLE_DRAFT,
            ...(persisted.singleDraft || {}),
          },
          multipleDraft: {
            ...DEFAULT_MULTIPLE_DRAFT,
            ...(persisted.multipleDraft || {}),
            sides: {
              ...DEFAULT_MULTIPLE_DRAFT.sides,
              ...(persisted.multipleDraft?.sides || {}),
            },
          },
          activeTab: persisted.activeTab === "multiple" ? "multiple" : "single",
          isOwner: Boolean(persisted.isOwner),
        };
      },
    }
  )
);
