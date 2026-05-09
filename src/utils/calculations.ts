import type {
  CatalogFlight,
  Config,
  DailyDemand,
  DailyDimensioning,
  SectionDimensioning,
} from "@/types";

export function getUsefulTime(config: Config): number {
  return config.shiftDuration * (1 - config.inefficiencyFactor);
}

export interface CoverageDerived {
  usefulTime: number;
  totalFolgas: number;
  diasTrabalhoPotenct: number;
  diasBase: number;
  diasAbsentismo: number;
  diasProdutivos: number;
  fatorCobertura: number;
}

export function calculateCoverage(config: Config): CoverageDerived {
  const usefulTime = getUsefulTime(config);
  const totalFolgas = config.folgasSemanais * 52;
  const diasTrabalhoPotenct = config.diasAno - totalFolgas;
  const diasBase = diasTrabalhoPotenct - config.feriasAnuais - config.diasFormacao;
  const diasAbsentismo = Math.floor(diasBase * config.taxaAbsentismo);
  const diasProdutivos = diasBase - diasAbsentismo;
  const fatorCobertura = diasProdutivos > 0 ? config.diasAno / diasProdutivos : 0;
  return {
    usefulTime,
    totalFolgas,
    diasTrabalhoPotenct,
    diasBase,
    diasAbsentismo,
    diasProdutivos,
    fatorCobertura,
  };
}

function jsDayToIso(d: Date): number {
  // JS: 0=Sun..6=Sat → 1=Mon..7=Sun
  const w = d.getDay();
  return w === 0 ? 7 : w;
}

function isoToDate(s: string): Date {
  const [y, m, d] = s.split("-").map(Number);
  return new Date(y, m - 1, d);
}

function dateToIso(d: Date): string {
  const y = d.getFullYear();
  const m = String(d.getMonth() + 1).padStart(2, "0");
  const dd = String(d.getDate()).padStart(2, "0");
  return `${y}-${m}-${dd}`;
}

export function getCatalogDateRange(catalog: CatalogFlight[]): { start: string; end: string } | null {
  if (!catalog.length) return null;
  let minStart: string | null = null;
  let maxEnd: string | null = null;
  for (const f of catalog) {
    if (!minStart || f.validStart < minStart) minStart = f.validStart;
    if (f.validEnd) {
      if (!maxEnd || f.validEnd > maxEnd) maxEnd = f.validEnd;
    }
  }
  if (!minStart) return null;
  if (!maxEnd) {
    // fallback: use max validStart
    maxEnd = catalog.reduce((acc, f) => (f.validStart > acc ? f.validStart : acc), minStart);
  }
  return { start: minStart, end: maxEnd };
}

export function calculateDailyDemand(
  catalog: CatalogFlight[],
  range: { start: string; end: string }
): DailyDemand[] {
  const start = isoToDate(range.start);
  const end = isoToDate(range.end);
  const out: DailyDemand[] = [];
  const cur = new Date(start);
  while (cur <= end) {
    const iso = dateToIso(cur);
    const dow = jsDayToIso(cur);
    const row: DailyDemand = {
      date: iso,
      dayOfWeek: dow,
      tapLC: 0,
      tapMC: 0,
      tapIlhas: 0,
      tapDom: 0,
      azul: 0,
      ethiopian: 0,
      sataCompleto: 0,
      sataReforco: 0,
      airCanada: 0,
      total: 0,
    };
    for (const f of catalog) {
      if (!f.active) continue;
      if (f.dayOfWeek !== dow) continue;
      if (iso < f.validStart) continue;
      if (f.validEnd && iso > f.validEnd) continue;
      switch (f.company) {
        case "TAP":
          if (f.flightType === "Longo Curso") row.tapLC++;
          else if (f.flightType === "Médio Curso") row.tapMC++;
          else if (f.flightType === "Ilhas") row.tapIlhas++;
          else if (f.flightType === "Doméstico") row.tapDom++;
          break;
        case "Azul":
          row.azul++;
          break;
        case "Ethiopian":
          row.ethiopian++;
          break;
        case "SATA":
          if (f.subcategory === "SATA Completo") row.sataCompleto++;
          else row.sataReforco++;
          break;
        case "AirCanada":
          row.airCanada++;
          break;
      }
    }
    row.total =
      row.tapLC + row.tapMC + row.tapIlhas + row.tapDom + row.azul + row.ethiopian + row.sataCompleto + row.sataReforco + row.airCanada;
    out.push(row);
    cur.setDate(cur.getDate() + 1);
  }
  return out;
}

export function calculateDailyDimensioning(
  demand: DailyDemand[],
  config: Config
): DailyDimensioning[] {
  const useful = getUsefulTime(config);
  return demand.map((d) => {
    const cargaLC = d.tapLC * config.timePerFlight.tapLC;
    const cargaMCIlhas = (d.tapMC + d.tapIlhas) * config.timePerFlight.tapMCIlhas;
    const cargaDom = d.tapDom * config.timePerFlight.tapDom;
    const cargaOutros =
      d.azul * config.otherCompanyTimes.azul +
      d.ethiopian * config.otherCompanyTimes.ethiopian +
      d.sataCompleto * config.otherCompanyTimes.sataCompleto +
      d.sataReforco * config.otherCompanyTimes.sataReforco +
      d.airCanada * config.otherCompanyTimes.airCanada;
    const tarefasFixas = config.fixedTasksPerDay;
    const cargaTotal = cargaLC + cargaMCIlhas + cargaDom + cargaOutros + tarefasFixas;
    const operadores = useful > 0 ? Math.ceil(cargaTotal / useful) : 0;
    return {
      ...d,
      cargaLC,
      cargaMCIlhas,
      cargaDom,
      cargaOutros,
      tarefasFixas,
      cargaTotal,
      operadores,
    };
  });
}

export function calculateSectionDimensioning(
  daily: DailyDimensioning[],
  config: Config
): SectionDimensioning[] {
  const cov = calculateCoverage(config);
  const byMonth = new Map<string, DailyDimensioning[]>();
  for (const d of daily) {
    const key = d.date.slice(0, 7);
    if (!byMonth.has(key)) byMonth.set(key, []);
    byMonth.get(key)!.push(d);
  }
  const monthNames = [
    "Janeiro", "Fevereiro", "Março", "Abril", "Maio", "Junho",
    "Julho", "Agosto", "Setembro", "Outubro", "Novembro", "Dezembro",
  ];
  const out: SectionDimensioning[] = [];
  const keys = Array.from(byMonth.keys()).sort();
  for (const k of keys) {
    const rows = byMonth.get(k)!;
    const avg = rows.reduce((s, r) => s + r.operadores, 0) / rows.length;
    const opsMedios = avg + 1;
    const quadroMensal = Math.ceil(opsMedios * cov.fatorCobertura);
    const [y, m] = k.split("-").map(Number);
    out.push({
      monthKey: k,
      monthLabel: `${monthNames[m - 1]} ${y}`,
      diasNaEpoca: rows.length,
      avgArmazem: avg,
      opsMedios,
      quadroMensal,
    });
  }
  return out;
}

export function getMonthsInRange(range: { start: string; end: string }): { key: string; label: string }[] {
  const monthNames = [
    "Janeiro", "Fevereiro", "Março", "Abril", "Maio", "Junho",
    "Julho", "Agosto", "Setembro", "Outubro", "Novembro", "Dezembro",
  ];
  const start = isoToDate(range.start);
  const end = isoToDate(range.end);
  const out: { key: string; label: string }[] = [];
  const cur = new Date(start.getFullYear(), start.getMonth(), 1);
  while (cur <= end) {
    const y = cur.getFullYear();
    const m = cur.getMonth();
    out.push({
      key: `${y}-${String(m + 1).padStart(2, "0")}`,
      label: `${monthNames[m]} ${y}`,
    });
    cur.setMonth(cur.getMonth() + 1);
  }
  return out;
}

export function formatDatePT(iso: string): string {
  const [y, m, d] = iso.split("-");
  return `${d}/${m}/${y}`;
}

export function formatNumberPT(n: number, decimals = 2): string {
  return n.toLocaleString("pt-PT", {
    minimumFractionDigits: decimals,
    maximumFractionDigits: decimals,
  });
}
