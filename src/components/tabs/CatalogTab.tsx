import { useMemo, useState } from "react";
import type { CatalogFlight, Company, FlightType } from "@/types";
import { DAY_NAMES, DAY_NAMES_SHORT } from "@/constants/defaults";
import { formatDatePT } from "@/utils/calculations";

interface Props {
  catalog: CatalogFlight[];
  onUpdateFlight: (id: string, patch: Partial<CatalogFlight>) => void;
  onSetManyActive: (ids: string[], active: boolean) => void;
}

const ALL_COMPANIES: Company[] = ["TAP", "Azul", "Ethiopian", "SATA", "AirCanada"];
const ALL_TYPES: FlightType[] = ["Longo Curso", "Médio Curso", "Ilhas", "Doméstico"];

export function CatalogTab({ catalog, onUpdateFlight, onSetManyActive }: Props) {
  const [companyFilter, setCompanyFilter] = useState<Company[]>([...ALL_COMPANIES]);
  const [dayFilter, setDayFilter] = useState<number>(0);
  const [typeFilter, setTypeFilter] = useState<FlightType | "ALL">("ALL");

  const filtered = useMemo(() => {
    return catalog
      .filter((f) => companyFilter.includes(f.company))
      .filter((f) => dayFilter === 0 || f.dayOfWeek === dayFilter)
      .filter((f) => typeFilter === "ALL" || f.flightType === typeFilter)
      .sort((a, b) =>
        a.dayOfWeek - b.dayOfWeek ||
        a.company.localeCompare(b.company) ||
        a.flightNumber.localeCompare(b.flightNumber)
      );
  }, [catalog, companyFilter, dayFilter, typeFilter]);

  function toggleCompany(c: Company) {
    setCompanyFilter((prev) =>
      prev.includes(c) ? prev.filter((x) => x !== c) : [...prev, c]
    );
  }

  if (!catalog.length) {
    return (
      <div className="rounded border bg-white p-6 text-center text-slate-600">
        Catálogo vazio. Importa um plano de voo na Tab "Plano de Voo".
      </div>
    );
  }

  return (
    <div className="space-y-4">
      <div className="flex flex-wrap items-center gap-4 rounded-lg border bg-white p-4">
        <div>
          <div className="mb-1 text-xs font-semibold text-slate-600">Empresa</div>
          <div className="flex flex-wrap gap-2">
            {ALL_COMPANIES.map((c) => (
              <button
                key={c}
                onClick={() => toggleCompany(c)}
                className={`rounded border px-2 py-1 text-xs ${
                  companyFilter.includes(c)
                    ? "border-[#1e3a5f] bg-[#1e3a5f] text-white"
                    : "border-slate-300 bg-white text-slate-600"
                }`}
              >
                {c}
              </button>
            ))}
          </div>
        </div>
        <div>
          <div className="mb-1 text-xs font-semibold text-slate-600">Dia</div>
          <select
            value={dayFilter}
            onChange={(e) => setDayFilter(Number(e.target.value))}
            className="rounded border border-slate-300 px-2 py-1 text-sm"
          >
            <option value={0}>Todos</option>
            {[1, 2, 3, 4, 5, 6, 7].map((d) => (
              <option key={d} value={d}>
                {DAY_NAMES[d]}
              </option>
            ))}
          </select>
        </div>
        <div>
          <div className="mb-1 text-xs font-semibold text-slate-600">Tipo</div>
          <select
            value={typeFilter}
            onChange={(e) => setTypeFilter(e.target.value as FlightType | "ALL")}
            className="rounded border border-slate-300 px-2 py-1 text-sm"
          >
            <option value="ALL">Todos</option>
            {ALL_TYPES.map((t) => (
              <option key={t} value={t}>
                {t}
              </option>
            ))}
          </select>
        </div>
        <div className="ml-auto flex gap-2">
          <button
            onClick={() => onSetManyActive(filtered.map((f) => f.id), true)}
            className="rounded bg-green-600 px-3 py-1 text-sm text-white hover:bg-green-700"
          >
            Ativar Todos
          </button>
          <button
            onClick={() => onSetManyActive(filtered.map((f) => f.id), false)}
            className="rounded bg-slate-500 px-3 py-1 text-sm text-white hover:bg-slate-600"
          >
            Desativar Todos
          </button>
        </div>
      </div>

      <div className="overflow-auto rounded-lg border bg-white">
        <table className="w-full text-sm">
          <thead className="sticky top-0 bg-[#1e3a5f] text-white">
            <tr>
              <th className="px-2 py-2 text-left">Dia</th>
              <th className="px-2 py-2 text-left">Empresa</th>
              <th className="px-2 py-2 text-left">Nº Voo</th>
              <th className="px-2 py-2 text-left">Tipo</th>
              <th className="px-2 py-2 text-left">Subcat.</th>
              <th className="px-2 py-2 text-left">Início</th>
              <th className="px-2 py-2 text-left">Fim</th>
              <th className="px-2 py-2 text-center">Ativo</th>
            </tr>
          </thead>
          <tbody>
            {filtered.map((f, i) => (
              <tr key={f.id} className={i % 2 ? "bg-slate-50" : ""}>
                <td className="px-2 py-1">{DAY_NAMES_SHORT[f.dayOfWeek]}</td>
                <td className="px-2 py-1">{f.company}</td>
                <td className="px-2 py-1 font-mono">{f.flightNumber}</td>
                <td className="px-2 py-1">{f.flightType}</td>
                <td className="px-2 py-1">{f.subcategory ?? ""}</td>
                <td className="px-2 py-1">{formatDatePT(f.validStart)}</td>
                <td className="px-2 py-1">{f.validEnd ? formatDatePT(f.validEnd) : "—"}</td>
                <td className="px-2 py-1 text-center">
                  <label className="inline-flex cursor-pointer items-center">
                    <input
                      type="checkbox"
                      className="peer sr-only"
                      checked={f.active}
                      onChange={(e) => onUpdateFlight(f.id, { active: e.target.checked })}
                    />
                    <span className="relative inline-block h-5 w-9 rounded-full bg-slate-300 transition peer-checked:bg-[#1e3a5f]">
                      <span className="absolute left-0.5 top-0.5 h-4 w-4 rounded-full bg-white transition peer-checked:translate-x-4" />
                    </span>
                  </label>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
      <p className="text-sm text-slate-600">
        {filtered.length} voos · {filtered.filter((f) => f.active).length} ativos
      </p>
    </div>
  );
}
