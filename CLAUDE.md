# CLA · Armazém de Cargas — Dimensionamento

## Projecto
Modelo de dimensionamento de operadores para a secção Armazém de Cargas da 
CLA – Catering Linhas Aéreas (OPO). Gerado no Lovable. Companhias: TAP, 
Azul, Ethiopian, SATA, Air Canada.

## Stack
- React + TypeScript + Tailwind CSS + shadcn/ui
- Vite
- SheetJS (xlsx) para parsing de planos de voo Excel
- localStorage para persistência — SEM backend, SEM Supabase

## Chaves localStorage
- `cla-armazem-catalog`   → CatalogFlight[]
- `cla-armazem-config`    → Config
- `cla-armazem-plan-meta` → PlanMeta

## Estrutura src/
- types/index.ts          → CatalogFlight, Config, DailyDemand, etc.
- constants/defaults.ts   → valores por defeito do Config
- utils/excelParser.ts    → parsing do plano de voo (SheetJS)
- utils/calculations.ts   → calculateDailyDemand, calculateDailyDimensioning,
                             calculateSectionDimensioning, calculateCoverageFactor
- hooks/useStore.ts       → acesso ao localStorage
- components/tabs/        → FlightPlanTab, CatalogTab, DailyDemandTab,
                             DailyDimensioningTab, SectionDimensioningTab

## Regras críticas — NÃO ALTERAR sem instrução explícita
1. Lógica de cálculo em calculations.ts (fórmulas validadas contra Excel)
2. Estrutura do CatalogFlight (especialmente active: boolean)
3. Chaves do localStorage
4. O gate (+1 operador/dia) só entra na média mensal do Dimensionamento da
   Secção — nunca no cálculo diário

## Convenções
- Datas: ISO string (YYYY-MM-DD) no store, DD/MM/YYYY no display
- Locale pt-PT para números (vírgula decimal)
- Operadores: Math.ceil(cargaTotal / usefulTime)
- opsMedios = avgArmazem + 1  (gate fixo)
- quadroMensal = Math.ceil(opsMedios × fatorCobertura)
