import { useEffect, useState, useCallback } from "react";
import type { CatalogFlight, Config, PlanMeta } from "@/types";
import { DEFAULT_CONFIG } from "@/constants/defaults";

const KEYS = {
  catalog: "cla-armazem-catalog",
  config: "cla-armazem-config",
  meta: "cla-armazem-plan-meta",
};

function load<T>(key: string, fallback: T): T {
  if (typeof window === "undefined") return fallback;
  try {
    const raw = localStorage.getItem(key);
    if (!raw) return fallback;
    return JSON.parse(raw) as T;
  } catch {
    return fallback;
  }
}

export function useStore() {
  const [catalog, setCatalogState] = useState<CatalogFlight[]>([]);
  const [config, setConfigState] = useState<Config>(DEFAULT_CONFIG);
  const [meta, setMetaState] = useState<PlanMeta | null>(null);
  const [hydrated, setHydrated] = useState(false);

  useEffect(() => {
    setCatalogState(load<CatalogFlight[]>(KEYS.catalog, []));
    setConfigState(load<Config>(KEYS.config, DEFAULT_CONFIG));
    setMetaState(load<PlanMeta | null>(KEYS.meta, null));
    setHydrated(true);
  }, []);

  const setCatalog = useCallback((c: CatalogFlight[]) => {
    setCatalogState(c);
    localStorage.setItem(KEYS.catalog, JSON.stringify(c));
  }, []);

  const setConfig = useCallback((c: Config) => {
    setConfigState(c);
    localStorage.setItem(KEYS.config, JSON.stringify(c));
  }, []);

  const setMeta = useCallback((m: PlanMeta | null) => {
    setMetaState(m);
    if (m) localStorage.setItem(KEYS.meta, JSON.stringify(m));
    else localStorage.removeItem(KEYS.meta);
  }, []);

  const updateFlight = useCallback(
    (id: string, patch: Partial<CatalogFlight>) => {
      setCatalogState((prev) => {
        const next = prev.map((f) => (f.id === id ? { ...f, ...patch } : f));
        localStorage.setItem(KEYS.catalog, JSON.stringify(next));
        return next;
      });
    },
    []
  );

  const setManyActive = useCallback((ids: string[], active: boolean) => {
    setCatalogState((prev) => {
      const idset = new Set(ids);
      const next = prev.map((f) => (idset.has(f.id) ? { ...f, active } : f));
      localStorage.setItem(KEYS.catalog, JSON.stringify(next));
      return next;
    });
  }, []);

  return {
    catalog,
    config,
    meta,
    hydrated,
    setCatalog,
    setConfig,
    setMeta,
    updateFlight,
    setManyActive,
  };
}
