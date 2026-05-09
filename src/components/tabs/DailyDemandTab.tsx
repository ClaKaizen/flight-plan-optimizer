import { useMemo, useState } from "react";
import type { DailyDemand } from "@/types";
import { DAY_NAMES_SHORT } from "@/constants/defaults";
import { formatDatePT, formatNumberPT, getMonthsInRange } from "@/utils/calculations";

interface Props {
  demand: DailyDemand[];
  range: { start: string; end: string } | null;
}

export function DailyDemandTab({ demand, range }: Props) {
  const months = useMemo(() => (range ? getMonthsInRange(range) : []), [range]);
  const [monthKey, setMonthKey] = useState<string>("");

  const activeMonth = monthKey || months[0]?.key || "";
  const rows = useMemo(
    () => demand.filter((d) => d.date.startsWith(activeMonth)),
    [demand, activeMonth]
  );

  if (!demand.length || !range) {
    return (
      <div className="rounded border bg-white p-6 text-center text-slate-600">
        Sem dados. Importa um plano de voo.
      </div>
    );
  }

  const totals = rows.reduce(
    (acc, r) => {
      acc.tapLC += r.tapLC;
      acc.tapMC += r.tapMC;
      acc.tapIlhas += r.tapIlhas;
      acc.tapDom += r.tapDom;
      acc.azul += r.azul;
      acc.ethiopian += r.ethiopian;
      acc.sataCompleto += r.sataCompleto;
      acc.sataReforco += r.sataReforco;
      acc.airCanada += r.airCanada;
      acc.total += r.total;
      return acc;
    },
    { tapLC: 0, tapMC: 0, tapIlhas: 0, tapDom: 0, azul: 0, ethiopian: 0, sataCompleto: 0, sataReforco: 0, airCanada: 0, total: 0 }
  );

  const cells: (keyof typeof totals)[] = ["tapLC", "tapMC", "tapIlhas", "tapDom", "azul", "ethiopian", "sataCompleto", "sataReforco", "airCanada", "total"];
  const headers = ["TAP LC", "TAP MC", "TAP Ilhas", "TAP Dom", "Azul", "Ethiopian", "SATA C", "SATA R", "Air Canada", "Total"];

  function cellClass(v: number, isTotal = false) {
    if (v === 0) return "px-2 py-1 text-center text-slate-300";
    return `px-2 py-1 text-center ${isTotal ? "font-semibold" : ""}`;
  }

  return (
    <div className="space-y-4">
      <div className="flex items-center gap-3">
        <label className="text-sm font-semibold">Mês:</label>
        <select
          value={activeMonth}
          onChange={(e) => setMonthKey(e.target.value)}
          className="rounded border border-slate-300 px-2 py-1 text-sm"
        >
          {months.map((m) => (
            <option key={m.key} value={m.key}>
              {m.label}
            </option>
          ))}
        </select>
      </div>

      <div className="overflow-auto rounded-lg border bg-white">
        <table className="w-full text-sm">
          <thead className="sticky top-0 bg-[#1e3a5f] text-white">
            <tr>
              <th className="px-2 py-2 text-left">Data</th>
              <th className="px-2 py-2 text-left">Dia</th>
              {headers.map((h) => (
                <th key={h} className="px-2 py-2 text-center">{h}</th>
              ))}
            </tr>
          </thead>
          <tbody>
            {rows.map((r, i) => (
              <tr key={r.date} className={i % 2 ? "bg-slate-50" : ""}>
                <td className="px-2 py-1">{formatDatePT(r.date)}</td>
                <td className="px-2 py-1">{DAY_NAMES_SHORT[r.dayOfWeek]}</td>
                {cells.map((c) => (
                  <td key={c} className={cellClass(r[c], c === "total")}>{r[c]}</td>
                ))}
              </tr>
            ))}
          </tbody>
          <tfoot className="bg-slate-100 font-semibold">
            <tr>
              <td className="px-2 py-2" colSpan={2}>Totais</td>
              {cells.map((c) => (
                <td key={c} className="px-2 py-2 text-center">{totals[c]}</td>
              ))}
            </tr>
            <tr>
              <td className="px-2 py-1 text-slate-600" colSpan={2}>Média/dia</td>
              {cells.map((c) => (
                <td key={c} className="px-2 py-1 text-center text-slate-600">
                  {rows.length ? formatNumberPT(totals[c] / rows.length, 2) : "—"}
                </td>
              ))}
            </tr>
          </tfoot>
        </table>
      </div>
    </div>
  );
}
