"use client";

import { useMemo, useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { ArrowLeft, Building2, ChevronRight, Search } from "lucide-react";
import type { Member } from "@/data/mock-data";
import { getStatsByOrgao, type OrgaoStats } from "@/lib/aggregations";
import { formatCurrency, formatNumber, formatPercent, removeAccents } from "@/lib/utils";
import { Footer } from "@/components/footer";
import { ORGAOS_POR_TIPO } from "@/lib/constants";

type SortKey = "totalAcimaTeto" | "totalMembros" | "percentualAcimaTeto" | "mediaAcimaTeto";

const SORT_OPTIONS: { value: SortKey; label: string }[] = [
  { value: "totalAcimaTeto", label: "Total acima do teto" },
  { value: "totalMembros", label: "Nº de membros" },
  { value: "percentualAcimaTeto", label: "% acima do teto" },
  { value: "mediaAcimaTeto", label: "Média acima do teto" },
];

const TIPO_OPTIONS = ["Todos", ...Object.keys(ORGAOS_POR_TIPO)] as const;

function getOrgaoTipo(orgao: string): string {
  for (const [tipo, orgaos] of Object.entries(ORGAOS_POR_TIPO)) {
    if ((orgaos as readonly string[]).includes(orgao)) return tipo;
  }
  return "Outros";
}

function BarInline({ value, max }: { value: number; max: number }) {
  const pct = max > 0 ? Math.min((value / max) * 100, 100) : 0;
  return (
    <div className="h-1.5 w-16 overflow-hidden rounded-full bg-gray-100 sm:w-24">
      <div
        className="h-full rounded-full bg-red-primary/70"
        style={{ width: `${pct}%` }}
      />
    </div>
  );
}

interface OrgaoListClientProps {
  members: Member[];
  availableYears: { value: string; label: string }[];
  currentYear: string;
}

export function OrgaoListClient({ members, availableYears, currentYear }: OrgaoListClientProps) {
  const router = useRouter();
  const [sortBy, setSortBy] = useState<SortKey>("totalAcimaTeto");
  const [tipoFilter, setTipoFilter] = useState("Todos");
  const [search, setSearch] = useState("");

  const allOrgaoStats = useMemo(() => {
    return Array.from(getStatsByOrgao(members).values());
  }, [members]);

  const filteredStats = useMemo(() => {
    let result = allOrgaoStats;

    if (tipoFilter !== "Todos") {
      const orgaosInTipo = ORGAOS_POR_TIPO[tipoFilter as keyof typeof ORGAOS_POR_TIPO] as readonly string[];
      result = result.filter((o) => orgaosInTipo.includes(o.orgao));
    }

    if (search.length >= 2) {
      const q = removeAccents(search.toLowerCase());
      result = result.filter(
        (o) =>
          removeAccents(o.orgao.toLowerCase()).includes(q) ||
          removeAccents(o.estado.toLowerCase()).includes(q)
      );
    }

    return result.sort((a, b) => b[sortBy] - a[sortBy]);
  }, [allOrgaoStats, sortBy, tipoFilter, search]);

  const maxValue = useMemo(() => {
    if (filteredStats.length === 0) return 1;
    return filteredStats[0][sortBy];
  }, [filteredStats, sortBy]);

  const totals = useMemo(() => ({
    orgaos: filteredStats.length,
    membros: filteredStats.reduce((s, o) => s + o.totalMembros, 0),
    totalAcima: filteredStats.reduce((s, o) => s + o.totalAcimaTeto, 0),
  }), [filteredStats]);

  function formatValue(orgao: OrgaoStats) {
    switch (sortBy) {
      case "totalAcimaTeto": return formatCurrency(orgao.totalAcimaTeto);
      case "totalMembros": return formatNumber(orgao.totalMembros);
      case "percentualAcimaTeto": return formatPercent(orgao.percentualAcimaTeto);
      case "mediaAcimaTeto": return formatCurrency(orgao.mediaAcimaTeto);
    }
  }

  return (
    <div className="min-h-screen bg-background">
      <div className="mx-auto max-w-5xl px-4 py-8 sm:px-6 lg:px-8">
        <Link
          href="/"
          className="mb-6 inline-flex items-center gap-1.5 text-sm text-gray-500 hover:text-navy"
        >
          <ArrowLeft className="h-4 w-4" />
          Voltar ao ranking
        </Link>

        <div className="mb-6 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <Building2 className="h-6 w-6 text-navy" />
            <h1 className="font-serif text-2xl font-bold text-navy sm:text-3xl">
              Órgãos do Judiciário
            </h1>
          </div>
          <div className="flex items-center gap-2">
            <span className="text-xs font-medium text-gray-500">Ano:</span>
            <select
              value={currentYear}
              onChange={(e) => router.push(`/orgao?ano=${e.target.value}`)}
              className="rounded-lg border border-gray-200 bg-white px-3 py-1.5 text-sm font-medium text-navy shadow-sm focus:border-navy focus:outline-none focus:ring-1 focus:ring-navy"
            >
              {availableYears.map((y) => (
                <option key={y.value} value={y.value}>
                  {y.label}
                </option>
              ))}
            </select>
          </div>
        </div>

        {/* Summary */}
        <div className="mb-5 flex flex-wrap gap-4 text-xs text-gray-500">
          <span><strong className="text-navy">{totals.orgaos}</strong> órgãos</span>
          <span><strong className="text-navy">{formatNumber(totals.membros)}</strong> membros</span>
          <span>Total acima do teto: <strong className="text-red-primary">{formatCurrency(totals.totalAcima)}</strong></span>
        </div>

        {/* Filters */}
        <div className="mb-4 flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
          <div className="flex flex-wrap gap-1.5">
            {TIPO_OPTIONS.map((tipo) => (
              <button
                key={tipo}
                onClick={() => setTipoFilter(tipo)}
                className={`rounded-full px-3 py-1 text-[11px] font-medium transition-colors ${
                  tipoFilter === tipo
                    ? "bg-navy text-white"
                    : "bg-surface text-gray-600 hover:bg-gray-200"
                }`}
              >
                {tipo === "Todos" ? "Todos" : tipo.replace("Tribunais ", "").replace("Regionais ", "R. ")}
              </button>
            ))}
          </div>
          <div className="relative">
            <Search className="absolute left-2.5 top-1/2 h-3.5 w-3.5 -translate-y-1/2 text-gray-400" />
            <input
              type="text"
              placeholder="Buscar órgão..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="w-full rounded-lg border border-gray-200 bg-white py-1.5 pl-8 pr-3 text-xs text-navy placeholder-gray-400 focus:border-navy focus:outline-none focus:ring-1 focus:ring-navy sm:w-48"
            />
          </div>
        </div>

        {/* Sort */}
        <div className="mb-3 flex gap-1.5">
          {SORT_OPTIONS.map((opt) => (
            <button
              key={opt.value}
              onClick={() => setSortBy(opt.value)}
              className={`rounded-md px-2.5 py-1 text-[11px] font-medium transition-colors ${
                sortBy === opt.value
                  ? "bg-navy/10 text-navy"
                  : "text-gray-400 hover:text-gray-600"
              }`}
            >
              {opt.label}
            </button>
          ))}
        </div>

        {/* Table */}
        <div className="rounded-lg border border-gray-100 bg-white shadow-sm">
          {/* Header */}
          <div className="hidden border-b border-gray-100 px-4 py-2 text-[11px] uppercase tracking-wider text-gray-400 sm:grid sm:grid-cols-[2rem_1fr_5rem_6rem_6rem_6rem_1.5rem]  sm:items-center sm:gap-2">
            <span>#</span>
            <span>Órgão</span>
            <span className="text-right">Membros</span>
            <span className="text-right">% acima</span>
            <span className="text-right">Valor</span>
            <span />
            <span />
          </div>

          {/* Rows */}
          {filteredStats.map((orgao, i) => (
            <Link
              key={orgao.orgao}
              href={`/orgao/${encodeURIComponent(orgao.orgao)}?ano=${currentYear}`}
              className="group flex items-center gap-2 border-b border-gray-50 px-4 py-2.5 transition-colors hover:bg-surface/80 sm:grid sm:grid-cols-[2rem_1fr_5rem_6rem_6rem_6rem_1.5rem]"
            >
              <span className="w-8 shrink-0 text-xs text-gray-400 sm:w-auto">
                {i + 1}
              </span>
              <div className="min-w-0 flex-1 sm:flex-none">
                <span className="text-sm font-semibold text-navy group-hover:text-red-primary">
                  {orgao.orgao}
                </span>
                <span className="ml-1.5 text-[11px] text-gray-400">
                  {orgao.estado}
                </span>
                <span className="ml-1.5 hidden text-[11px] text-gray-300 lg:inline">
                  {getOrgaoTipo(orgao.orgao)}
                </span>
              </div>
              <span className="hidden text-right text-xs text-gray-500 sm:block">
                {formatNumber(orgao.totalMembros)}
              </span>
              <span className="hidden text-right text-xs text-gray-500 sm:block">
                {formatPercent(orgao.percentualAcimaTeto)}
              </span>
              <span className="ml-auto text-right text-xs font-semibold text-red-primary sm:ml-0">
                {formatValue(orgao)}
              </span>
              <BarInline value={orgao[sortBy]} max={maxValue} />
              <ChevronRight className="hidden h-3.5 w-3.5 text-gray-300 group-hover:text-navy sm:block" />
            </Link>
          ))}

          {filteredStats.length === 0 && (
            <p className="px-4 py-8 text-center text-sm text-gray-400">
              Nenhum órgão encontrado.
            </p>
          )}
        </div>
      </div>
      <Footer />
    </div>
  );
}
