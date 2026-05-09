import * as XLSX from "xlsx";
import type { CatalogFlight, Company, FlightType, SATASubcategory } from "@/types";

function detectCompany(flightNumber: string): Company | null {
  const fn = flightNumber.trim().toUpperCase();
  if (fn.startsWith("TP")) return "TAP";
  if (fn.startsWith("AD")) return "Azul";
  if (fn.startsWith("ET")) return "Ethiopian";
  if (fn.startsWith("S4")) return "SATA";
  if (fn.startsWith("AC")) return "AirCanada";
  return null;
}

function detectSATASub(obs: string | null): SATASubcategory {
  if (obs && /BAR\s*COMPLETO/i.test(obs)) return "SATA Completo";
  return "SATA Reforço";
}

function isValidFlightType(s: string): s is FlightType {
  return ["Longo Curso", "Médio Curso", "Ilhas", "Doméstico"].includes(s);
}

function toISODate(v: unknown): string | null {
  if (v == null || v === "") return null;
  if (v instanceof Date) {
    const y = v.getFullYear();
    const m = String(v.getMonth() + 1).padStart(2, "0");
    const d = String(v.getDate()).padStart(2, "0");
    return `${y}-${m}-${d}`;
  }
  if (typeof v === "number") {
    // Excel serial fallback
    const epoch = new Date(Date.UTC(1899, 11, 30));
    const ms = v * 86400000;
    const d = new Date(epoch.getTime() + ms);
    return toISODate(d);
  }
  if (typeof v === "string") {
    const d = new Date(v);
    if (!isNaN(d.getTime())) return toISODate(d);
  }
  return null;
}

function uuid(): string {
  return "f-" + Math.random().toString(36).slice(2, 10) + Date.now().toString(36);
}

interface ParseResult {
  flights: CatalogFlight[];
  planName: string;
  version: string;
  sheetName: string;
}

export async function parseFlightPlan(file: File): Promise<ParseResult> {
  const buffer = await file.arrayBuffer();
  const wb = XLSX.read(buffer, { type: "array", cellDates: true });

  // Find sheet with day-of-week markers
  let bestSheet: string | null = null;
  let bestRows: any[][] = [];
  let bestScore = 0;
  for (const name of wb.SheetNames) {
    const ws = wb.Sheets[name];
    const rows = XLSX.utils.sheet_to_json<any[]>(ws, { header: 1, raw: false, defval: null });
    let score = 0;
    for (const r of rows) {
      const v = r?.[1];
      if (typeof v === "number" && Number.isInteger(v) && v >= 1 && v <= 7) score++;
    }
    if (score > bestScore) {
      bestScore = score;
      bestSheet = name;
      bestRows = rows;
    }
  }
  if (!bestSheet) throw new Error("Nenhuma sheet de plano detetada (sem dias 1-7 na coluna B).");

  // Re-read with raw to get Date objects
  const ws = wb.Sheets[bestSheet];
  const rows = XLSX.utils.sheet_to_json<any[]>(ws, { header: 1, defval: null });

  const flights: CatalogFlight[] = [];
  let currentDay: number | null = null;

  for (const r of rows) {
    if (!r) continue;
    const c1 = r[1];
    const c2 = r[2];
    const c3 = r[3];
    const c8 = r[8];
    const c9 = r[9];
    const c10 = r[10];

    if (typeof c1 === "number" && Number.isInteger(c1) && c1 >= 1 && c1 <= 7) {
      currentDay = c1;
      continue;
    }
    if (currentDay == null) continue;

    if (typeof c2 === "string" && c2.trim() && typeof c3 === "string" && c3.trim()) {
      const flightNumber = c2.trim();
      const flightTypeRaw = c3.trim();
      if (!isValidFlightType(flightTypeRaw)) continue;
      const company = detectCompany(flightNumber);
      if (!company) continue;
      const validStart = toISODate(c8);
      if (!validStart) continue;
      const validEnd = toISODate(c9);
      const observations = typeof c10 === "string" ? c10 : null;
      const subcategory = company === "SATA" ? detectSATASub(observations) : null;

      flights.push({
        id: uuid(),
        dayOfWeek: currentDay,
        company,
        flightNumber,
        flightType: flightTypeRaw,
        subcategory,
        validStart,
        validEnd,
        observations,
        active: true,
      });
    }
  }

  // Try to detect plan name & version from first cells
  let planName = bestSheet;
  let version = "";
  outer: for (let i = 0; i < Math.min(rows.length, 10); i++) {
    const r = rows[i];
    if (!r) continue;
    for (const cell of r) {
      if (typeof cell === "string" && /meal\s*plan|plano|S\d{2}/i.test(cell)) {
        planName = cell.trim();
        const vMatch = cell.match(/V\d+/i);
        if (vMatch) version = vMatch[0];
        break outer;
      }
    }
  }

  return { flights, planName, version, sheetName: bestSheet };
}
