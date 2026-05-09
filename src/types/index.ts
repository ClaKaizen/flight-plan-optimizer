export type Company = "TAP" | "Azul" | "Ethiopian" | "SATA" | "AirCanada";
export type FlightType = "Longo Curso" | "Médio Curso" | "Ilhas" | "Doméstico";
export type SATASubcategory = "SATA Completo" | "SATA Reforço";

export interface CatalogFlight {
  id: string;
  dayOfWeek: number; // 1=Mon..7=Sun
  company: Company;
  flightNumber: string;
  flightType: FlightType;
  subcategory: SATASubcategory | null;
  validStart: string; // ISO YYYY-MM-DD
  validEnd: string | null;
  observations?: string | null;
  active: boolean;
}

export interface Config {
  shiftDuration: number;
  inefficiencyFactor: number;
  timePerFlight: {
    tapLC: number;
    tapMCIlhas: number;
    tapDom: number;
  };
  otherCompanyTimes: {
    azul: number;
    ethiopian: number;
    sataCompleto: number;
    sataReforco: number;
    airCanada: number;
  };
  fixedTasksPerDay: number;
  diasAno: number;
  folgasSemanais: number;
  feriasAnuais: number;
  diasFormacao: number;
  taxaAbsentismo: number;
}

export interface PlanMeta {
  planName: string;
  version: string;
  importedAt: string;
  dateRange: { start: string; end: string };
}

export interface DailyDemand {
  date: string; // ISO
  dayOfWeek: number;
  tapLC: number;
  tapMC: number;
  tapIlhas: number;
  tapDom: number;
  azul: number;
  ethiopian: number;
  sataCompleto: number;
  sataReforco: number;
  airCanada: number;
  total: number;
}

export interface DailyDimensioning extends DailyDemand {
  cargaLC: number;
  cargaMCIlhas: number;
  cargaDom: number;
  cargaOutros: number;
  tarefasFixas: number;
  cargaTotal: number;
  operadores: number;
}

export interface SectionDimensioning {
  monthKey: string; // YYYY-MM
  monthLabel: string;
  diasNaEpoca: number;
  avgArmazem: number;
  opsMedios: number; // avg + 1
  quadroMensal: number;
}
