import { createFileRoute } from "@tanstack/react-router";
import { useMemo, useState } from "react";
import { useStore } from "@/hooks/useStore";
import {
  calculateDailyDemand,
  calculateDailyDimensioning,
  calculateSectionDimensioning,
  formatDatePT,
  getCatalogDateRange,
} from "@/utils/calculations";
import { FlightPlanTab } from "@/components/tabs/FlightPlanTab";
import { CatalogTab } from "@/components/tabs/CatalogTab";
import { DailyDemandTab } from "@/components/tabs/DailyDemandTab";
import { DailyDimensioningTab } from "@/components/tabs/DailyDimensioningTab";
import { SectionDimensioningTab } from "@/components/tabs/SectionDimensioningTab";

export const Route = createFileRoute("/")({
  head: () => ({
    meta: [
      { title: "CLA · Armazém de Cargas — Dimensionamento" },
      { name: "description", content: "Modelo de dimensionamento da secção Armazém de Cargas (CLA)." },
    ],
  }),
  component: Index,
});

const TABS = [
  { id: "plan", label: "Plano de Voo" },
  { id: "catalog", label: "Catálogo" },
  { id: "demand", label: "Procura Diária" },
  { id: "dim", label: "Dimensionamento Diário" },
  { id: "section", label: "Dimensionamento da Secção" },
] as const;

type TabId = typeof TABS[number]["id"];

function Index() {
  const { catalog, config, meta, hydrated, setCatalog, setConfig, setMeta, updateFlight, setManyActive } = useStore();
  const [tab, setTab] = useState<TabId>("plan");

  const range = useMemo(() => getCatalogDateRange(catalog), [catalog]);
  const demand = useMemo(() => (range ? calculateDailyDemand(catalog, range) : []), [catalog, range]);
  const daily = useMemo(() => calculateDailyDimensioning(demand, config), [demand, config]);
  const section = useMemo(() => calculateSectionDimensioning(daily, config), [daily, config]);

  if (!hydrated) {
    return <div className="min-h-screen bg-slate-50" />;
  }

  return (
    <div className="min-h-screen bg-slate-50 text-slate-900">
      <header className="bg-[#1e3a5f] text-white shadow">
        <div className="mx-auto max-w-7xl px-4 py-4">
          <h1 className="text-xl font-bold">CLA · Armazém de Cargas — Dimensionamento</h1>
          {meta && (
            <p className="mt-1 text-xs text-blue-100">
              {meta.planName} {meta.version && `· ${meta.version}`} ·{" "}
              {formatDatePT(meta.dateRange.start)} → {formatDatePT(meta.dateRange.end)} ·{" "}
              {catalog.length} voos ({catalog.filter((f) => f.active).length} ativos)
            </p>
          )}
        </div>
        <nav className="mx-auto max-w-7xl px-4">
          <div className="flex flex-wrap gap-1">
            {TABS.map((t) => (
              <button
                key={t.id}
                onClick={() => setTab(t.id)}
                className={`rounded-t px-4 py-2 text-sm font-medium transition ${
                  tab === t.id
                    ? "bg-slate-50 text-[#1e3a5f]"
                    : "bg-[#274a78] text-white hover:bg-[#2f5589]"
                }`}
              >
                {t.label}
              </button>
            ))}
          </div>
        </nav>
      </header>

      <main className="mx-auto max-w-7xl px-4 py-6">
        {tab === "plan" && (
          <FlightPlanTab
            onImport={(flights, m) => {
              setCatalog(flights);
              setMeta(m);
              setTab("catalog");
            }}
          />
        )}
        {tab === "catalog" && (
          <CatalogTab catalog={catalog} onUpdateFlight={updateFlight} onSetManyActive={setManyActive} />
        )}
        {tab === "demand" && <DailyDemandTab demand={demand} range={range} />}
        {tab === "dim" && <DailyDimensioningTab daily={daily} range={range} />}
        {tab === "section" && (
          <SectionDimensioningTab config={config} setConfig={setConfig} section={section} />
        )}

        {!catalog.length && tab !== "plan" && (
          <div className="mt-4 rounded border border-amber-300 bg-amber-50 p-4 text-sm text-amber-800">
            Catálogo vazio.{" "}
            <button onClick={() => setTab("plan")} className="font-semibold underline">
              Ir para Plano de Voo
            </button>{" "}
            para importar um ficheiro Excel.
          </div>
        )}
      </main>
    </div>
  );
}
