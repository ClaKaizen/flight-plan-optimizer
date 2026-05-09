import type { Config, SectionDimensioning } from "@/types";
import { DEFAULT_CONFIG } from "@/constants/defaults";
import { calculateCoverage, formatNumberPT } from "@/utils/calculations";

interface Props {
  config: Config;
  setConfig: (c: Config) => void;
  section: SectionDimensioning[];
}

function NumField({
  label,
  value,
  onChange,
  step = 1,
  suffix,
}: {
  label: string;
  value: number;
  onChange: (v: number) => void;
  step?: number;
  suffix?: string;
}) {
  return (
    <div className="flex items-center justify-between gap-2">
      <label className="text-sm text-slate-700">{label}</label>
      <div className="flex items-center gap-1">
        <input
          type="number"
          step={step}
          value={value}
          onChange={(e) => onChange(Number(e.target.value))}
          className="w-24 rounded border border-slate-300 px-2 py-1 text-right text-sm"
        />
        {suffix && <span className="text-xs text-slate-500">{suffix}</span>}
      </div>
    </div>
  );
}

function ReadOnly({ label, value, suffix }: { label: string; value: string; suffix?: string }) {
  return (
    <div className="flex items-center justify-between gap-2 rounded bg-slate-100 px-2 py-1">
      <span className="text-xs font-medium text-slate-600">{label}</span>
      <span className="text-sm font-semibold">
        {value}
        {suffix && <span className="ml-1 text-xs text-slate-500">{suffix}</span>}
      </span>
    </div>
  );
}

export function SectionDimensioningTab({ config, setConfig, section }: Props) {
  const cov = calculateCoverage(config);
  const update = (patch: Partial<Config>) => setConfig({ ...config, ...patch });
  const updateTPF = (patch: Partial<Config["timePerFlight"]>) =>
    setConfig({ ...config, timePerFlight: { ...config.timePerFlight, ...patch } });
  const updateOther = (patch: Partial<Config["otherCompanyTimes"]>) =>
    setConfig({ ...config, otherCompanyTimes: { ...config.otherCompanyTimes, ...patch } });

  const totalDias = section.reduce((s, m) => s + m.diasNaEpoca, 0);
  const quadroPeriodo = section.length ? Math.max(...section.map((m) => m.quadroMensal)) : 0;

  return (
    <div className="grid gap-6 lg:grid-cols-[400px_1fr]">
      <div className="space-y-4 rounded-lg border bg-white p-4">
        <div>
          <h3 className="mb-2 text-sm font-bold uppercase text-[#1e3a5f]">Turno</h3>
          <div className="space-y-2">
            <NumField label="Duração do Turno" value={config.shiftDuration} onChange={(v) => update({ shiftDuration: v })} suffix="min" />
            <NumField
              label="Fator de Ineficiência"
              value={config.inefficiencyFactor * 100}
              onChange={(v) => update({ inefficiencyFactor: v / 100 })}
              step={0.1}
              suffix="%"
            />
            <ReadOnly label="Tempo Útil/Operador" value={formatNumberPT(cov.usefulTime, 1)} suffix="min" />
          </div>
        </div>

        <div>
          <h3 className="mb-2 text-sm font-bold uppercase text-[#1e3a5f]">Tempos por Voo TAP</h3>
          <div className="space-y-2">
            <NumField label="TAP Longo Curso" value={config.timePerFlight.tapLC} onChange={(v) => updateTPF({ tapLC: v })} step={0.001} suffix="min/voo" />
            <NumField label="TAP MC + Ilhas" value={config.timePerFlight.tapMCIlhas} onChange={(v) => updateTPF({ tapMCIlhas: v })} step={0.001} suffix="min/voo" />
            <NumField label="TAP Doméstico" value={config.timePerFlight.tapDom} onChange={(v) => updateTPF({ tapDom: v })} step={0.001} suffix="min/voo" />
          </div>
        </div>

        <div>
          <h3 className="mb-2 text-sm font-bold uppercase text-[#1e3a5f]">Outras Companhias</h3>
          <div className="space-y-2">
            <NumField label="Azul" value={config.otherCompanyTimes.azul} onChange={(v) => updateOther({ azul: v })} suffix="min/voo" />
            <NumField label="Ethiopian" value={config.otherCompanyTimes.ethiopian} onChange={(v) => updateOther({ ethiopian: v })} suffix="min/voo" />
            <NumField label="SATA Completo" value={config.otherCompanyTimes.sataCompleto} onChange={(v) => updateOther({ sataCompleto: v })} suffix="min/voo" />
            <NumField label="SATA Reforço" value={config.otherCompanyTimes.sataReforco} onChange={(v) => updateOther({ sataReforco: v })} suffix="min/voo" />
            <NumField label="Air Canada" value={config.otherCompanyTimes.airCanada} onChange={(v) => updateOther({ airCanada: v })} suffix="min/voo" />
          </div>
        </div>

        <div>
          <h3 className="mb-2 text-sm font-bold uppercase text-[#1e3a5f]">Tarefas Fixas</h3>
          <NumField label="Tarefas fixas diárias" value={config.fixedTasksPerDay} onChange={(v) => update({ fixedTasksPerDay: v })} suffix="min/dia" />
        </div>

        <div>
          <h3 className="mb-2 text-sm font-bold uppercase text-[#1e3a5f]">Cobertura</h3>
          <div className="space-y-2">
            <NumField label="Folgas semanais" value={config.folgasSemanais} onChange={(v) => update({ folgasSemanais: v })} suffix="dias/sem" />
            <NumField label="Férias anuais" value={config.feriasAnuais} onChange={(v) => update({ feriasAnuais: v })} suffix="dias" />
            <NumField label="Dias de formação" value={config.diasFormacao} onChange={(v) => update({ diasFormacao: v })} suffix="dias/ano" />
            <NumField
              label="Taxa de absentismo"
              value={config.taxaAbsentismo * 100}
              onChange={(v) => update({ taxaAbsentismo: v / 100 })}
              step={0.1}
              suffix="%"
            />
            <ReadOnly label="Total Folgas" value={String(cov.totalFolgas)} suffix="dias" />
            <ReadOnly label="Dias Trabalho Pot." value={String(cov.diasTrabalhoPotenct)} />
            <ReadOnly label="Dias Base" value={String(cov.diasBase)} />
            <ReadOnly label="Dias Absentismo" value={String(cov.diasAbsentismo)} />
            <ReadOnly label="Dias Produtivos/Op." value={String(cov.diasProdutivos)} />
            <ReadOnly label="Fator de Cobertura" value={formatNumberPT(cov.fatorCobertura, 3)} />
          </div>
        </div>

        <button
          onClick={() => setConfig(DEFAULT_CONFIG)}
          className="w-full rounded bg-slate-500 px-3 py-2 text-sm text-white hover:bg-slate-600"
        >
          Repor Valores por Defeito
        </button>
      </div>

      <div className="rounded-lg border bg-white">
        {section.length === 0 ? (
          <div className="p-6 text-center text-slate-600">Sem dados.</div>
        ) : (
          <table className="w-full text-sm">
            <thead className="bg-[#1e3a5f] text-white">
              <tr>
                <th className="px-3 py-2 text-left">Mês</th>
                <th className="px-3 py-2 text-center">Dias na Época</th>
                <th className="px-3 py-2 text-center">Avg Arm. (s/gate)</th>
                <th className="px-3 py-2 text-center">+1 Gate</th>
                <th className="px-3 py-2 text-center bg-blue-700">Ops. Médios (Arm.+Gate)</th>
                <th className="px-3 py-2 text-center bg-amber-500">Quadro Mensal</th>
              </tr>
            </thead>
            <tbody>
              {section.map((m, i) => (
                <tr key={m.monthKey} className={i % 2 ? "bg-slate-50" : ""}>
                  <td className="px-3 py-2 font-medium">{m.monthLabel}</td>
                  <td className="px-3 py-2 text-center">{m.diasNaEpoca}</td>
                  <td className="px-3 py-2 text-center">{formatNumberPT(m.avgArmazem)}</td>
                  <td className="px-3 py-2 text-center">+1</td>
                  <td className="px-3 py-2 text-center font-semibold bg-blue-50">{formatNumberPT(m.opsMedios)}</td>
                  <td className="px-3 py-2 text-center font-bold bg-amber-100">{m.quadroMensal}</td>
                </tr>
              ))}
              <tr className="border-t-2 border-[#1e3a5f] bg-slate-100 font-bold">
                <td className="px-3 py-3">QUADRO DO PERÍODO</td>
                <td className="px-3 py-3 text-center">{totalDias}</td>
                <td className="px-3 py-3"></td>
                <td className="px-3 py-3"></td>
                <td className="px-3 py-3"></td>
                <td className="px-3 py-3 text-center text-lg bg-amber-200">{quadroPeriodo}</td>
              </tr>
            </tbody>
          </table>
        )}
      </div>
    </div>
  );
}
