"use client";

import { useState, useMemo, useCallback } from "react";
import { getKPIs } from "@/data/mock-data";
import type { Member } from "@/data/mock-data";
import { removeAccents } from "@/lib/utils";
import { Header } from "@/components/header";
import { KPICards } from "@/components/kpi-cards";
import { FilterBar, defaultFilters, type FilterState } from "@/components/filter-bar";
import { Leaderboard } from "@/components/leaderboard";
import { Footer } from "@/components/footer";
import { AlertTriangle } from "lucide-react";

function sortMembers(members: Member[], sortBy: string): Member[] {
  const sorted = [...members];
  switch (sortBy) {
    case "maior_remuneracao":
      return sorted.sort((a, b) => b.remuneracaoTotal - a.remuneracaoTotal);
    case "maior_acima_teto":
      return sorted.sort((a, b) => b.acimaTeto - a.acimaTeto);
    case "maior_percentual":
      return sorted.sort((a, b) => b.percentualAcimaTeto - a.percentualAcimaTeto);
    case "nome_az":
      return sorted.sort((a, b) => a.nome.localeCompare(b.nome, "pt-BR"));
    case "orgao":
      return sorted.sort((a, b) => a.orgao.localeCompare(b.orgao));
    default:
      return sorted;
  }
}

interface HomeClientProps {
  members: Member[];
  dataMonth?: string;
  availableMonths?: { value: string; label: string }[];
  currentMonth?: string;
}

export function HomeClient({ members, dataMonth, availableMonths, currentMonth }: HomeClientProps) {
  const [filters, setFilters] = useState<FilterState>(defaultFilters);
  const [searchQuery, setSearchQuery] = useState("");
  const [highlightMemberId, setHighlightMemberId] = useState<number | null>(null);

  const handleSearch = useCallback((query: string) => {
    setSearchQuery(query);
  }, []);

  const handleSelectMember = useCallback((id: number) => {
    setHighlightMemberId(id);
    setSearchQuery("");
  }, []);

  const filteredMembers = useMemo(() => {
    let result = members;

    // Search filter
    if (searchQuery.length >= 2) {
      const normalized = removeAccents(searchQuery.toLowerCase());
      result = result.filter((m) => {
        const nameMatch = removeAccents(m.nome.toLowerCase()).includes(normalized);
        const orgaoMatch = removeAccents(m.orgao.toLowerCase()).includes(normalized);
        const cargoMatch = removeAccents(m.cargo.toLowerCase()).includes(normalized);
        return nameMatch || orgaoMatch || cargoMatch;
      });
    }

    // Estado filter
    if (filters.estado) {
      result = result.filter((m) => m.estado === filters.estado);
    }

    // Orgao filter
    if (filters.orgao) {
      result = result.filter((m) => m.orgao === filters.orgao);
    }

    // Cargo filter
    if (filters.cargos.length > 0) {
      result = result.filter((m) => filters.cargos.includes(m.cargo));
    }

    // Salary range filter
    if (filters.salarioMin > 0) {
      result = result.filter((m) => m.remuneracaoTotal >= filters.salarioMin);
    }
    if (filters.salarioMax < 300000) {
      result = result.filter((m) => m.remuneracaoTotal <= filters.salarioMax);
    }

    // Sort
    result = sortMembers(result, filters.sortBy);

    return result;
  }, [members, searchQuery, filters]);

  const kpis = useMemo(() => getKPIs(filteredMembers), [filteredMembers]);

  const isDecember = currentMonth?.endsWith("-12");

  return (
    <div className="min-h-screen bg-background">
      <Header
        onSearch={handleSearch}
        onSelectMember={handleSelectMember}
        dataMonth={dataMonth}
      />

      <main className="mx-auto max-w-6xl px-4 py-6 sm:px-6 lg:px-8">
        {/* KPIs */}
        <section className="mb-6">
          <KPICards data={kpis} />
        </section>

        {isDecember && (
          <div className="mb-6 flex items-start gap-3 rounded-xl border border-amber-200 bg-amber-50 px-4 py-3">
            <AlertTriangle className="mt-0.5 h-5 w-5 flex-shrink-0 text-amber-500" />
            <div>
              <p className="text-sm font-semibold text-amber-800">
                Dezembro costuma apresentar valores atípicos
              </p>
              <p className="mt-0.5 text-xs text-amber-700">
                Neste mês é comum o pagamento de retroativos acumulados, férias, 13º salário e abonos, o que
                eleva significativamente os valores individuais em relação aos demais meses.
              </p>
            </div>
          </div>
        )}

        {/* Filters */}
        <section className="mb-6">
          <FilterBar
            filters={filters}
            onFiltersChange={setFilters}
            totalResults={members.length}
            filteredResults={filteredMembers.length}
            availableMonths={availableMonths}
            currentMonth={currentMonth}
          />
        </section>

        {/* Ranking */}
        <section>
          <Leaderboard
            members={filteredMembers}
            highlightMemberId={highlightMemberId}
          />
        </section>
      </main>

      <Footer />
    </div>
  );
}
