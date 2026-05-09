import { useState, useRef } from "react";
import { parseFlightPlan } from "@/utils/excelParser";
import type { CatalogFlight, PlanMeta } from "@/types";
import { DAY_NAMES_SHORT } from "@/constants/defaults";
import { formatDatePT, getCatalogDateRange } from "@/utils/calculations";

interface Props {
  onImport: (flights: CatalogFlight[], meta: PlanMeta) => void;
}

export function FlightPlanTab({ onImport }: Props) {
  const [preview, setPreview] = useState<CatalogFlight[] | null>(null);
  const [planName, setPlanName] = useState("");
  const [version, setVersion] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);
  const [dragOver, setDragOver] = useState(false);
  const inputRef = useRef<HTMLInputElement>(null);

  async function handleFile(file: File) {
    setLoading(true);
    setError(null);
    setSuccess(null);
    try {
      const result = await parseFlightPlan(file);
      setPreview(result.flights);
      setPlanName(result.planName);
      setVersion(result.version);
      if (!result.flights.length) setError("Nenhum voo válido detetado no ficheiro.");
    } catch (e) {
      setError((e as Error).message);
      setPreview(null);
    } finally {
      setLoading(false);
    }
  }

  function importNow() {
    if (!preview) return;
    const range = getCatalogDateRange(preview);
    if (!range) {
      setError("Não foi possível determinar o intervalo de datas.");
      return;
    }
    const meta: PlanMeta = {
      planName,
      version,
      importedAt: new Date().toISOString(),
      dateRange: range,
    };
    onImport(preview, meta);
    setSuccess(`Catálogo atualizado com ${preview.length} voos.`);
    setPreview(null);
  }

  const stats = preview
    ? {
        total: preview.length,
        companies: Array.from(new Set(preview.map((f) => f.company))),
        range: getCatalogDateRange(preview),
      }
    : null;

  return (
    <div className="space-y-6">
      <div
        onDragOver={(e) => {
          e.preventDefault();
          setDragOver(true);
        }}
        onDragLeave={() => setDragOver(false)}
        onDrop={(e) => {
          e.preventDefault();
          setDragOver(false);
          const f = e.dataTransfer.files?.[0];
          if (f) handleFile(f);
        }}
        className={`rounded-lg border-2 border-dashed p-10 text-center transition ${
          dragOver ? "border-[#1e3a5f] bg-blue-50" : "border-slate-300 bg-white"
        }`}
      >
        <p className="text-lg font-medium text-slate-700">
          Arraste um ficheiro Excel (.xlsx ou .xlsm) ou
        </p>
        <button
          onClick={() => inputRef.current?.click()}
          className="mt-3 rounded bg-[#1e3a5f] px-4 py-2 text-white hover:bg-[#274a78]"
        >
          Selecionar ficheiro
        </button>
        <input
          ref={inputRef}
          type="file"
          accept=".xlsx,.xlsm"
          className="hidden"
          onChange={(e) => {
            const f = e.target.files?.[0];
            if (f) handleFile(f);
          }}
        />
        {loading && <p className="mt-4 text-slate-600">A processar…</p>}
        {error && <p className="mt-4 text-red-600">{error}</p>}
        {success && <p className="mt-4 text-green-700">{success}</p>}
      </div>

      {stats && preview && (
        <div className="rounded-lg border bg-white p-4">
          <div className="flex flex-wrap items-center justify-between gap-3">
            <div>
              <h3 className="text-lg font-semibold">
                {planName} {version && <span className="text-slate-500">· {version}</span>}
              </h3>
              <p className="text-sm text-slate-600">
                {stats.total} voos · {stats.companies.join(", ")}
                {stats.range && (
                  <>
                    {" "}· {formatDatePT(stats.range.start)} → {formatDatePT(stats.range.end)}
                  </>
                )}
              </p>
            </div>
            <button
              onClick={importNow}
              className="rounded bg-amber-500 px-4 py-2 font-medium text-white hover:bg-amber-600"
            >
              Importar para Catálogo
            </button>
          </div>

          <div className="mt-4 max-h-96 overflow-auto">
            <table className="w-full text-sm">
              <thead className="sticky top-0 bg-slate-100">
                <tr>
                  <th className="px-2 py-1 text-left">Dia</th>
                  <th className="px-2 py-1 text-left">Empresa</th>
                  <th className="px-2 py-1 text-left">Nº Voo</th>
                  <th className="px-2 py-1 text-left">Tipo</th>
                  <th className="px-2 py-1 text-left">Subcat.</th>
                  <th className="px-2 py-1 text-left">Início</th>
                  <th className="px-2 py-1 text-left">Fim</th>
                </tr>
              </thead>
              <tbody>
                {preview.map((f, i) => (
                  <tr key={f.id} className={i % 2 ? "bg-slate-50" : ""}>
                    <td className="px-2 py-1">{DAY_NAMES_SHORT[f.dayOfWeek]}</td>
                    <td className="px-2 py-1">{f.company}</td>
                    <td className="px-2 py-1 font-mono">{f.flightNumber}</td>
                    <td className="px-2 py-1">{f.flightType}</td>
                    <td className="px-2 py-1">{f.subcategory ?? ""}</td>
                    <td className="px-2 py-1">{formatDatePT(f.validStart)}</td>
                    <td className="px-2 py-1">{f.validEnd ? formatDatePT(f.validEnd) : "—"}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}
    </div>
  );
}
