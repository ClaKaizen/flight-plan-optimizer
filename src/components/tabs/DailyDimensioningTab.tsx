import { useMemo, useState } from "react";
import type { DailyDimensioning } from "@/types";
import { DAY_NAMES_SHORT } from "@/constants/defaults";
import { formatDatePT, formatNumberPT, getMonthsInRange } from "@/utils/calculations";

interface Props {
  daily: DailyDimensioning[];
  range: { start: string; end: string } | null;
}

export function DailyDimensioningTab({ daily, range }: Props) {
  const months = useMemo(() => (range ? getMonthsInRange(range) : []), [range]);
  const [monthKey, setMonthKey] = useState<string>("");
  const [showLoads, setShowLoads] = useState(true);

  const activeMonth = monthKey || months[0]?.key || "";
  const rows = useMemo(
    () => daily.filter((d) => d.date.startsWith(activeMonth)),
    [daily, activeMonth]
  );

  if (!daily.length || !range) {
    return (
      <div className="rounded border bg-white p-6 text-center text-slate-600">
        Sem dados.
      </div>
    );
  }

  const avg = (sel: (r: DailyDimensioning) => number) =>
    rows.length ? rows.reduce((s, r) => s + sel(r), 0) / rows.length : 0;

  return (
    <div className="space-y-4">
      <div className="flex flex-wrap items-center gap-3">
        <label className="text-sm font-semibold">Mês:</label>
        <select
          value={activeMonth}
          onChange={(e) => setMonthKey(e.target.value)}
          className="rounded border border-slate-300 px-2 py-1 text-sm"
        >
          {months.map((m) => (
            <option key={m.key} value={m.key}>{m.label}</option>
          ))}
        </select>
        <label className="ml-4 inline-flex items-center gap-2 text-sm">
          <input type="checkbox" checked={showLoads} onChange={(e) => setShowLoads(e.target.checked)} />
          Mostrar colunas de carga
        </label>
      </div>

      <div className="overflow-auto rounded-lg border bg-white">
        <table className="w-full text-sm">
          <thead className="sticky top-0 bg-[#1e3a5f] text-white">
            <tr>
              <th className="px-2 py-2 text-left">Data</th>
              <th className="px-2 py-2 text-left">Dia</th>
              <th className="px-2 py-2 text-center">TAP LC</th>
              <th className="px-2 py-2 text-center">TAP MC+I</th>
              <th className="px-2 py-2 text-center">TAP Dom</th>
              <th className="px-2 py-2 text-center">Azul</th>
              <th className="px-2 py-2 text-center">Eth.</th>
              <th className="px-2 py-2 text-center">SATA C</th>
              <th className="px-2 py-2 text-center">SATA R</th>
              <th className="px-2 py-2 text-center">AC</th>
              {showLoads && (
                <>
                  <th className="px-2 py-2 text-right">Carga LC</th>
                  <th className="px-2 py-2 text-right">Carga MC+I</th>
                  <th className="px-2 py-2 text-right">Carga Dom</th>
                  <th className="px-2 py-2 text-right">Outros</th>
                  <th className="px-2 py-2 text-right">Tarefas Fixas</th>
                  <th className="px-2 py-2 text-right">Carga Total</th>
                </>
              )}
              <th className="px-2 py-2 text-center bg-amber-500">Operadores</th>
            </tr>
          </thead>
          <tbody>
            {rows.map((r, i) => (
              <tr key={r.date} className={i % 2 ? "bg-slate-50" : ""}>
                <td className="px-2 py-1">{formatDatePT(r.date)}</td>
                <td className="px-2 py-1">{DAY_NAMES_SHORT[r.dayOfWeek]}</td>
                <td className="px-2 py-1 text-center">{r.tapLC}</td>
                <td className="px-2 py-1 text-center">{r.tapMC + r.tapIlhas}</td>
                <td className="px-2 py-1 text-center">{r.tapDom}</td>
                <td className="px-2 py-1 text-center">{r.azul}</td>
                <td className="px-2 py-1 text-center">{r.ethiopian}</td>
                <td className="px-2 py-1 text-center">{r.sataCompleto}</td>
                <td className="px-2 py-1 text-center">{r.sataReforco}</td>
                <td className="px-2 py-1 text-center">{r.airCanada}</td>
                {showLoads && (
                  <>
                    <td className="px-2 py-1 text-right">{formatNumberPT(r.cargaLC, 1)}</td>
                    <td className="px-2 py-1 text-right">{formatNumberPT(r.cargaMCIlhas, 1)}</td>
                    <td className="px-2 py-1 text-right">{formatNumberPT(r.cargaDom, 1)}</td>
                    <td className="px-2 py-1 text-right">{formatNumberPT(r.cargaOutros, 1)}</td>
                    <td className="px-2 py-1 text-right">{formatNumberPT(r.tarefasFixas, 0)}</td>
                    <td className="px-2 py-1 text-right font-semibold">{formatNumberPT(r.cargaTotal, 1)}</td>
                  </>
                )}
                <td className="px-2 py-1 text-center font-bold bg-amber-100">{r.operadores}</td>
              </tr>
            ))}
          </tbody>
          <tfoot className="bg-slate-100 font-semibold">
            <tr>
              <td className="px-2 py-2" colSpan={2}>Médias</td>
              <td className="px-2 py-2 text-center">{formatNumberPT(avg(r => r.tapLC))}</td>
              <td className="px-2 py-2 text-center">{formatNumberPT(avg(r => r.tapMC + r.tapIlhas))}</td>
              <td className="px-2 py-2 text-center">{formatNumberPT(avg(r => r.tapDom))}</td>
              <td className="px-2 py-2 text-center">{formatNumberPT(avg(r => r.azul))}</td>
              <td className="px-2 py-2 text-center">{formatNumberPT(avg(r => r.ethiopian))}</td>
              <td className="px-2 py-2 text-center">{formatNumberPT(avg(r => r.sataCompleto))}</td>
              <td className="px-2 py-2 text-center">{formatNumberPT(avg(r => r.sataReforco))}</td>
              <td className="px-2 py-2 text-center">{formatNumberPT(avg(r => r.airCanada))}</td>
              {showLoads && (
                <>
                  <td className="px-2 py-2 text-right">{formatNumberPT(avg(r => r.cargaLC), 1)}</td>
                  <td className="px-2 py-2 text-right">{formatNumberPT(avg(r => r.cargaMCIlhas), 1)}</td>
                  <td className="px-2 py-2 text-right">{formatNumberPT(avg(r => r.cargaDom), 1)}</td>
                  <td className="px-2 py-2 text-right">{formatNumberPT(avg(r => r.cargaOutros), 1)}</td>
                  <td className="px-2 py-2 text-right">{formatNumberPT(avg(r => r.tarefasFixas), 0)}</td>
                  <td className="px-2 py-2 text-right">{formatNumberPT(avg(r => r.cargaTotal), 1)}</td>
                </>
              )}
              <td className="px-2 py-2 text-center bg-amber-200">{formatNumberPT(avg(r => r.operadores))}</td>
            </tr>
          </tfoot>
        </table>
      </div>
      <p className="text-xs text-slate-600 italic">
        Operadores do armazém, sem gate. O operador de gate (+1/dia) é incluído no Dimensionamento da Secção.
      </p>
    </div>
  );
}
