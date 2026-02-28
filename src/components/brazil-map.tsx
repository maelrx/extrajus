"use client";

import { useMemo } from "react";
import type { StateStats } from "@/lib/aggregations";
import { formatCurrency, formatNumber, formatPercent } from "@/lib/utils";
import { useState } from "react";

// Grid-based Brazil map layout (row, col positions)
// Aligned by geographic regions:
// Norte (AC, AM, AP, PA, RO, RR, TO)
// Nordeste (AL, BA, CE, MA, PB, PE, PI, RN, SE)
// Centro-Oeste (DF, GO, MS, MT)
// Sudeste (ES, MG, RJ, SP)
// Sul (PR, RS, SC)
const STATE_GRID: Record<string, { row: number; col: number }> = {
  // Norte
  RR: { row: 0, col: 2 }, AP: { row: 0, col: 4 },
  AM: { row: 1, col: 1 }, PA: { row: 1, col: 3 },
  AC: { row: 2, col: 0 }, RO: { row: 2, col: 1 }, TO: { row: 2, col: 3 },
  // Nordeste
  MA: { row: 1, col: 5 }, CE: { row: 1, col: 6 }, RN: { row: 1, col: 7 },
  PI: { row: 2, col: 5 }, PE: { row: 2, col: 6 }, PB: { row: 2, col: 7 },
  BA: { row: 3, col: 5 }, SE: { row: 3, col: 6 }, AL: { row: 3, col: 7 },
  // Centro-Oeste
  MT: { row: 3, col: 1 }, GO: { row: 3, col: 2 }, DF: { row: 3, col: 3 },
  MS: { row: 4, col: 1 },
  // Sudeste
  MG: { row: 4, col: 4 }, ES: { row: 4, col: 5 },
  SP: { row: 5, col: 2 }, RJ: { row: 5, col: 4 },
  // Sul
  PR: { row: 6, col: 2 },
  SC: { row: 7, col: 2 },
  RS: { row: 8, col: 2 },
};

function getColorIntensity(value: number, min: number, max: number): string {
  if (max === min) return "bg-red-200";
  const ratio = (value - min) / (max - min);
  if (ratio < 0.15) return "bg-red-100";
  if (ratio < 0.3) return "bg-red-200";
  if (ratio < 0.45) return "bg-red-300";
  if (ratio < 0.6) return "bg-red-400 text-white";
  if (ratio < 0.75) return "bg-red-500 text-white";
  if (ratio < 0.9) return "bg-red-600 text-white";
  return "bg-red-700 text-white";
}

interface BrazilMapProps {
  stateStats: Map<string, StateStats>;
  metric: "totalAcimaTeto" | "membrosAcimaTeto" | "percentualAcimaTeto";
  onStateClick: (estado: string) => void;
}

export function BrazilMap({ stateStats, metric, onStateClick }: BrazilMapProps) {
  const [hoveredState, setHoveredState] = useState<string | null>(null);

  const { min, max } = useMemo(() => {
    const values = Array.from(stateStats.values()).map((s) => s[metric]);
    return { min: Math.min(...values), max: Math.max(...values) };
  }, [stateStats, metric]);

  const hoveredStats = hoveredState ? stateStats.get(hoveredState) : null;

  return (
    <div className="relative">
      {/* Map grid */}
      <div
        className="mx-auto grid w-fit gap-1"
        style={{
          gridTemplateColumns: "repeat(8, 48px)",
          gridTemplateRows: "repeat(9, 48px)",
        }}
      >
        {Object.entries(STATE_GRID).map(([sigla, pos]) => {
          const stats = stateStats.get(sigla);
          const value = stats ? stats[metric] : 0;
          const colorClass = stats
            ? getColorIntensity(value, min, max)
            : "bg-surface";

          return (
            <button
              key={sigla}
              onClick={() => onStateClick(sigla)}
              onMouseEnter={() => setHoveredState(sigla)}
              onMouseLeave={() => setHoveredState(null)}
              className={`flex items-center justify-center rounded-md text-xs font-bold transition-all hover:scale-110 hover:shadow-md ${colorClass} ${
                hoveredState === sigla ? "ring-2 ring-navy ring-offset-1" : ""
              }`}
              style={{
                gridRow: pos.row + 1,
                gridColumn: pos.col + 1,
              }}
            >
              {sigla}
            </button>
          );
        })}
      </div>

      {/* Tooltip */}
      {hoveredStats && (
        <div className="absolute left-1/2 top-0 z-10 -translate-x-1/2 -translate-y-full rounded-lg border border-border bg-card p-3 text-xs shadow-lg">
          <p className="font-bold text-foreground">{hoveredStats.estado}</p>
          <p className="text-muted">
            {formatNumber(hoveredStats.totalMembros)} membros &middot;{" "}
            {formatNumber(hoveredStats.membrosAcimaTeto)} acima do teto
          </p>
          <p className="mt-1 font-semibold text-red-primary">
            Total acima: {formatCurrency(hoveredStats.totalAcimaTeto)}/mês
          </p>
          <p className="text-muted">
            {formatPercent(hoveredStats.percentualAcimaTeto)} acima do teto
          </p>
        </div>
      )}

      {/* Legend */}
      <div className="mt-4 flex items-center justify-center gap-1">
        <span className="text-[10px] text-muted">Menor</span>
        {["bg-red-100", "bg-red-200", "bg-red-300", "bg-red-400", "bg-red-500", "bg-red-600", "bg-red-700"].map(
          (c) => (
            <div key={c} className={`h-3 w-6 rounded-sm ${c}`} />
          )
        )}
        <span className="text-[10px] text-muted">Maior</span>
      </div>
    </div>
  );
}
