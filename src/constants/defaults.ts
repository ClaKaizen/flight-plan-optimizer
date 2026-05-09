import type { Config } from "@/types";

export const DEFAULT_CONFIG: Config = {
  shiftDuration: 450,
  inefficiencyFactor: 0.05,
  timePerFlight: {
    tapLC: 124.708,
    tapMCIlhas: 25.826,
    tapDom: 16.413,
  },
  otherCompanyTimes: {
    azul: 70,
    ethiopian: 8,
    sataCompleto: 70,
    sataReforco: 10,
    airCanada: 70,
  },
  fixedTasksPerDay: 125,
  diasAno: 365,
  folgasSemanais: 2,
  feriasAnuais: 22,
  diasFormacao: 0,
  taxaAbsentismo: 0.05,
};

export const DAY_NAMES = ["", "Segunda", "Terça", "Quarta", "Quinta", "Sexta", "Sábado", "Domingo"];
export const DAY_NAMES_SHORT = ["", "Seg", "Ter", "Qua", "Qui", "Sex", "Sáb", "Dom"];
