"use client";

import { useMemo, useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import {
  AlertTriangle,
  TrendingUp,
  ArrowUpRight,
  Building2,
  Filter,
  Info,
  MapPin,
  X,
} from "lucide-react";
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
} from "recharts";
import { ShareButtons } from "@/components/share-buttons";
import { Footer } from "@/components/footer";
import {
  formatCurrency,
  formatCurrencyFull,
  formatNumber,
  formatPercent,
} from "@/lib/utils";
import type { Anomalia } from "@/data/get-members";

interface AnomaliasClientProps {
  anomalias: Anomalia[];
  availableYears: { value: string; label: string }[];
  currentYear: string;
  minVariacao: number;
}

const VARIACAO_OPTIONS = [
  { value: 200, label: "> 200%" },
  { value: 300, label: "> 300%" },
  { value: 500, label: "> 500%" },
  { value: 1000, label: "> 1.000%" },
];

const MONTH_NAMES = [
  "Jan", "Fev", "Mar", "Abr", "Mai", "Jun",
  "Jul", "Ago", "Set", "Out", "Nov", "Dez",
];

function formatMes(mesRef: string): string {
  const [year, month] = mesRef.split("-");
  return `${MONTH_NAMES[parseInt(month) - 1]}/${year}`;
}

/* Custom tooltip – shows "Outros" breakdown on hover */
function ChartTooltip({ active, payload, label }: Record<string, unknown>) {
  if (!active || !payload || !(payload as unknown[]).length) return null;
  const data = (payload as { payload: Record<string, unknown> }[])[0]?.payload;
  if (!data) return null;

  const breakdown = data.breakdown as { orgao: string; count: number }[] | null;

  return (
    <div className="rounded-lg border border-border bg-card p-2.5 shadow-lg">
      <p className="mb-1 text-xs font-bold text-foreground">{String(label)}</p>
      <p className="text-xs text-muted">
        {formatNumber(Number(data.count))} anomalia
        {Number(data.count) !== 1 ? "s" : ""}
      </p>
      {breakdown && breakdown.length > 0 && (
        <div className="mt-1.5 border-t border-border pt-1.5">
          <p className="mb-1 text-[10px] font-semibold text-muted">
            Inclui:
          </p>
          <div className="max-h-32 space-y-0.5 overflow-y-auto">
            {breakdown.map((b) => (
              <div
                key={b.orgao}
                className="flex items-center justify-between gap-3 text-[10px]"
              >
                <span className="truncate text-muted">{b.orgao}</span>
                <span className="whitespace-nowrap font-medium text-foreground">
                  {b.count}
                </span>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}

export function AnomaliasClient({
  anomalias,
  availableYears,
  currentYear,
  minVariacao,
}: AnomaliasClientProps) {
  const router = useRouter();
  const [filterEstado, setFilterEstado] = useState("");
  const [filterOrgao, setFilterOrgao] = useState("");

  /* Unique values for filter dropdowns */
  const uniqueEstados = useMemo(() => {
    const set = new Set(anomalias.map((a) => a.estado));
    return Array.from(set).sort();
  }, [anomalias]);

  const uniqueOrgaos = useMemo(() => {
    let list = anomalias;
    if (filterEstado) list = list.filter((a) => a.estado === filterEstado);
    const set = new Set(list.map((a) => a.orgao));
    return Array.from(set).sort();
  }, [anomalias, filterEstado]);

  /* Filtered anomalias */
  const filteredAnomalias = useMemo(() => {
    return anomalias.filter((a) => {
      if (filterEstado && a.estado !== filterEstado) return false;
      if (filterOrgao && a.orgao !== filterOrgao) return false;
      return true;
    });
  }, [anomalias, filterEstado, filterOrgao]);

  /* Chart data: top 7 + "Outros" group */
  const chartData = useMemo(() => {
    const map = new Map<
      string,
      { orgao: string; count: number; totalVariacao: number }
    >();
    for (const a of filteredAnomalias) {
      let entry = map.get(a.orgao);
      if (!entry) {
        entry = { orgao: a.orgao, count: 0, totalVariacao: 0 };
        map.set(a.orgao, entry);
      }
      entry.count++;
      entry.totalVariacao += a.variacaoAbs;
    }
    const sorted = Array.from(map.values()).sort((a, b) => b.count - a.count);

    const TOP_N = 7;
    if (sorted.length <= TOP_N + 1) {
      return sorted.map((s) => ({ ...s, breakdown: null }));
    }

    const top = sorted
      .slice(0, TOP_N)
      .map((s) => ({ ...s, breakdown: null as { orgao: string; count: number }[] | null }));
    const rest = sorted.slice(TOP_N);
    const outrosCount = rest.reduce((sum, r) => sum + r.count, 0);
    const outrosVariacao = rest.reduce((sum, r) => sum + r.totalVariacao, 0);

    top.push({
      orgao: `+${rest.length} outros`,
      count: outrosCount,
      totalVariacao: outrosVariacao,
      breakdown: rest.map((r) => ({ orgao: r.orgao, count: r.count })),
    });

    return top;
  }, [filteredAnomalias]);

  const hasActiveFilters = !!(filterEstado || filterOrgao);

  const navigate = (year: string, min: number) => {
    router.push(`/anomalias?ano=${year}&min=${min}`);
  };

  const clearFilters = () => {
    setFilterEstado("");
    setFilterOrgao("");
  };

  return (
    <div className="min-h-screen bg-background">
      <div className="mx-auto max-w-7xl px-4 py-8 sm:px-6 lg:px-8">
        {/* Header */}
        <div className="mb-6 flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
          <div className="flex items-center gap-3">
            <AlertTriangle className="h-7 w-7 text-amber-500" />
            <div>
              <h1 className="font-serif text-2xl font-bold text-navy sm:text-3xl">
                Anomalias de Remuneração
              </h1>
              <p className="text-sm text-muted">
                Variações atípicas entre meses consecutivos
              </p>
            </div>
          </div>
          <div className="flex items-center gap-3">
            <div className="flex items-center gap-2">
              <span className="text-xs font-medium text-muted">Ano:</span>
              <select
                value={currentYear}
                onChange={(e) => navigate(e.target.value, minVariacao)}
                className="rounded-lg border border-border bg-card px-3 py-1.5 text-sm font-medium text-foreground shadow-sm focus:border-navy focus:outline-none focus:ring-1 focus:ring-navy"
              >
                {availableYears.map((y) => (
                  <option key={y.value} value={y.value}>
                    {y.label}
                  </option>
                ))}
              </select>
            </div>
            <div className="flex items-center gap-2">
              <span className="text-xs font-medium text-muted">
                Variação:
              </span>
              <select
                value={minVariacao}
                onChange={(e) =>
                  navigate(currentYear, parseInt(e.target.value))
                }
                className="rounded-lg border border-border bg-card px-3 py-1.5 text-sm font-medium text-foreground shadow-sm focus:border-navy focus:outline-none focus:ring-1 focus:ring-navy"
              >
                {VARIACAO_OPTIONS.map((o) => (
                  <option key={o.value} value={o.value}>
                    {o.label}
                  </option>
                ))}
              </select>
            </div>
            <ShareButtons
              title="ExtraTeto — Anomalias de Remuneração"
              text={`${anomalias.length} anomalias detectadas em ${currentYear}`}
            />
          </div>
        </div>

        {/* Disclaimer */}
        <div className="mb-4 flex items-start gap-3 rounded-lg border border-amber-200 bg-amber-50 px-4 py-3.5 dark:border-amber-900 dark:bg-amber-950">
          <Info className="mt-0.5 h-5 w-5 flex-shrink-0 text-amber-500" />
          <div>
            <p className="text-sm leading-relaxed text-amber-800 dark:text-amber-200">
              <strong>Aviso:</strong> Esta ferramenta não faz juízo de valor. As
              variações listadas são apenas estatísticas e podem ter motivos
              legítimos, como pagamento de atrasados, exercício cumulativo de
              funções ou correções administrativas.
            </p>
            <ul className="mt-1.5 list-disc pl-4 text-sm leading-relaxed text-amber-700 dark:text-amber-300">
              <li>
                <strong>Dezembro e janeiro</strong> costumam concentrar picos
                legítimos por acúmulo de 13º salário, férias, abonos e
                retroativos de reajuste pagos no fim do exercício fiscal.
              </li>
            </ul>
          </div>
        </div>

        {/* Summary cards */}
        <div className="mb-6 grid grid-cols-2 gap-3 sm:grid-cols-4">
          <div className="rounded-lg border border-border bg-card p-4 shadow-sm">
            <div className="mb-1 flex items-center gap-1.5">
              <AlertTriangle className="h-4 w-4 text-amber-500" />
              <span className="text-[11px] text-muted">Anomalias</span>
            </div>
            <p className="text-xl font-bold text-amber-600">
              {formatNumber(anomalias.length)}
            </p>
          </div>
          <div className="rounded-lg border border-border bg-card p-4 shadow-sm">
            <div className="mb-1 flex items-center gap-1.5">
              <Building2 className="h-4 w-4 text-blue-500" />
              <span className="text-[11px] text-muted">Órgãos afetados</span>
            </div>
            <p className="text-xl font-bold text-foreground">
              {formatNumber(new Set(anomalias.map((a) => a.orgao)).size)}
            </p>
          </div>
          <div className="rounded-lg border border-border bg-card p-4 shadow-sm">
            <div className="mb-1 flex items-center gap-1.5">
              <TrendingUp className="h-4 w-4 text-red-500" />
              <span className="text-[11px] text-muted">Maior variação</span>
            </div>
            <p className="text-xl font-bold text-red-primary">
              {anomalias.length > 0
                ? `+${formatPercent(Math.max(...anomalias.map((a) => a.variacaoPct)))}`
                : "—"}
            </p>
          </div>
          <div className="rounded-lg border border-border bg-card p-4 shadow-sm">
            <div className="mb-1 flex items-center gap-1.5">
              <ArrowUpRight className="h-4 w-4 text-red-500" />
              <span className="text-[11px] text-muted">Maior salto (R$)</span>
            </div>
            <p className="text-xl font-bold text-red-primary">
              {anomalias.length > 0
                ? formatCurrency(
                    Math.max(...anomalias.map((a) => a.variacaoAbs))
                  )
                : "—"}
            </p>
          </div>
        </div>

        {/* Chart + Filters side-by-side */}
        {chartData.length > 0 && (
          <div className="mb-6 flex flex-col gap-4 lg:flex-row">
            {/* Chart */}
            <div className="min-w-0 flex-1 rounded-lg border border-border bg-card p-4 shadow-sm">
              <h2 className="mb-3 font-serif text-base font-bold text-foreground">
                Anomalias por Órgão
                {hasActiveFilters && (
                  <span className="ml-2 text-xs font-normal text-amber-600">
                    (filtrado)
                  </span>
                )}
              </h2>
              <div className="h-56">
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart
                    data={chartData}
                    layout="vertical"
                    margin={{ left: 5, right: 10 }}
                  >
                    <CartesianGrid strokeDasharray="3 3" stroke="var(--border)" />
                    <XAxis
                      type="number"
                      tick={{ fontSize: 9, fill: "var(--muted)" }}
                    />
                    <YAxis
                      type="category"
                      dataKey="orgao"
                      tick={{ fontSize: 9, fill: "var(--foreground)", fontWeight: 600 }}
                      width={55}
                    />
                    <Tooltip content={<ChartTooltip />} />
                    <Bar
                      dataKey="count"
                      fill="#F59E0B"
                      name="Anomalias"
                      radius={[0, 4, 4, 0]}
                    />
                  </BarChart>
                </ResponsiveContainer>
              </div>
            </div>

            {/* Filters panel */}
            <div className="w-full rounded-lg border border-border bg-card p-4 shadow-sm lg:w-60 lg:flex-shrink-0 lg:self-start">
              <div className="mb-3 flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <Filter className="h-4 w-4 text-muted" />
                  <h3 className="text-sm font-bold text-foreground">Filtros</h3>
                </div>
                {hasActiveFilters && (
                  <button
                    onClick={clearFilters}
                    className="flex items-center gap-1 rounded-md px-2 py-1 text-[10px] font-medium text-red-primary hover:bg-red-50"
                  >
                    <X className="h-3 w-3" />
                    Limpar
                  </button>
                )}
              </div>

              <div className="space-y-3">
                <div>
                  <label className="mb-1 flex items-center gap-1.5 text-[11px] font-medium text-muted">
                    <MapPin className="h-3 w-3" />
                    Estado
                  </label>
                  <select
                    value={filterEstado}
                    onChange={(e) => {
                      setFilterEstado(e.target.value);
                      setFilterOrgao("");
                    }}
                    className="w-full rounded-lg border border-border bg-card px-3 py-1.5 text-xs text-foreground focus:border-navy focus:outline-none focus:ring-1 focus:ring-navy"
                  >
                    <option value="">Todos os estados</option>
                    {uniqueEstados.map((e) => (
                      <option key={e} value={e}>
                        {e}
                      </option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="mb-1 flex items-center gap-1.5 text-[11px] font-medium text-muted">
                    <Building2 className="h-3 w-3" />
                    Órgão
                  </label>
                  <select
                    value={filterOrgao}
                    onChange={(e) => setFilterOrgao(e.target.value)}
                    className="w-full rounded-lg border border-border bg-card px-3 py-1.5 text-xs text-foreground focus:border-navy focus:outline-none focus:ring-1 focus:ring-navy"
                  >
                    <option value="">Todos os órgãos</option>
                    {uniqueOrgaos.map((o) => (
                      <option key={o} value={o}>
                        {o}
                      </option>
                    ))}
                  </select>
                </div>

                {/* Filter summary */}
                {hasActiveFilters && (
                  <div className="rounded-md bg-amber-50 p-2.5 dark:bg-amber-950">
                    <p className="text-[11px] font-medium text-amber-700 dark:text-amber-300">
                      {formatNumber(filteredAnomalias.length)} de{" "}
                      {formatNumber(anomalias.length)} anomalias
                    </p>
                    {filterEstado && (
                      <p className="mt-0.5 text-[10px] text-amber-600 dark:text-amber-400">
                        Estado: {filterEstado}
                      </p>
                    )}
                    {filterOrgao && (
                      <p className="mt-0.5 text-[10px] text-amber-600 dark:text-amber-400">
                        Órgão: {filterOrgao}
                      </p>
                    )}
                  </div>
                )}
              </div>
            </div>
          </div>
        )}

        {/* Main table */}
        <div className="rounded-lg border border-border bg-card p-4 shadow-sm">
          <div className="mb-3 flex items-center justify-between">
            <h2 className="font-serif text-base font-bold text-foreground">
              Membros com variação atípica
              <span className="ml-2 text-xs font-normal text-muted">
                ({filteredAnomalias.length} resultados em {currentYear})
              </span>
            </h2>
          </div>

          {filteredAnomalias.length === 0 ? (
            <div className="py-12 text-center">
              <AlertTriangle className="mx-auto mb-3 h-8 w-8 text-muted" />
              <p className="text-sm text-muted">
                {hasActiveFilters
                  ? "Nenhuma anomalia encontrada com os filtros selecionados."
                  : `Nenhuma anomalia detectada com variação > ${minVariacao}% em ${currentYear}.`}
              </p>
              <p className="mt-1 text-xs text-muted">
                {hasActiveFilters
                  ? "Tente ajustar ou limpar os filtros."
                  : "Tente reduzir o filtro de variação mínima."}
              </p>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead>
                  <tr className="border-b border-border text-left text-[11px] uppercase tracking-wider text-muted">
                    <th className="pb-2 pr-4">#</th>
                    <th className="pb-2 pr-4">Nome</th>
                    <th className="pb-2 pr-4">Órgão</th>
                    <th className="pb-2 pr-4">Período</th>
                    <th className="pb-2 pr-4 text-right">Mês anterior</th>
                    <th className="pb-2 pr-4 text-right">Mês seguinte</th>
                    <th className="pb-2 pr-4 text-right">Variação</th>
                    <th className="pb-2 text-right">Salto (R$)</th>
                  </tr>
                </thead>
                <tbody>
                  {filteredAnomalias.map((a, i) => {
                    const barWidth = Math.min(
                      (a.variacaoAbs /
                        (filteredAnomalias[0]?.variacaoAbs || 1)) *
                        100,
                      100
                    );
                    return (
                      <tr
                        key={`${a.nome}-${a.orgao}-${a.mesAtual}`}
                        className="border-b border-border"
                      >
                        <td className="py-2.5 pr-4 text-xs text-muted">
                          {i + 1}
                        </td>
                        <td className="py-2.5 pr-4">
                          <div className="font-medium text-foreground">{a.nome}</div>
                          <div className="text-[10px] text-muted">
                            {a.cargo}
                          </div>
                        </td>
                        <td className="py-2.5 pr-4">
                          <Link
                            href={`/orgao/${encodeURIComponent(a.orgao)}?ano=${currentYear}`}
                            className="text-xs font-medium text-foreground hover:underline"
                          >
                            {a.orgao}
                          </Link>
                          <div className="text-[10px] text-muted">
                            {a.estado}
                          </div>
                        </td>
                        <td className="py-2.5 pr-4 text-xs text-muted">
                          {formatMes(a.mesAnterior)} → {formatMes(a.mesAtual)}
                        </td>
                        <td className="py-2.5 pr-4 text-right text-xs text-muted">
                          {formatCurrencyFull(a.totalAnterior)}
                        </td>
                        <td className="py-2.5 pr-4 text-right text-xs font-semibold text-foreground">
                          {formatCurrencyFull(a.totalAtual)}
                        </td>
                        <td className="py-2.5 pr-4 text-right">
                          <span className="inline-flex items-center gap-0.5 rounded bg-amber-100 px-1.5 py-0.5 text-xs font-bold text-amber-700 dark:bg-amber-900 dark:text-amber-300">
                            +{formatPercent(a.variacaoPct)}
                          </span>
                        </td>
                        <td className="py-2.5 text-right">
                          <div className="text-xs font-semibold text-red-primary">
                            +{formatCurrency(a.variacaoAbs)}
                          </div>
                          <div className="mt-0.5 h-1.5 w-full overflow-hidden rounded-full bg-surface">
                            <div
                              className="h-full rounded-full bg-red-400"
                              style={{ width: `${barWidth}%` }}
                            />
                          </div>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          )}
        </div>
      </div>
      <Footer />
    </div>
  );
}
