import type { Member } from "@/data/mock-data";
import { TETO_CONSTITUCIONAL } from "./constants";

export interface StateStats {
  estado: string;
  totalMembros: number;
  membrosAcimaTeto: number;
  totalAcimaTeto: number;
  mediaRemuneracao: number;
  maiorRemuneracao: number;
  percentualAcimaTeto: number;
}

export interface OrgaoStats {
  orgao: string;
  estado: string;
  totalMembros: number;
  membrosAcimaTeto: number;
  totalAcimaTeto: number;
  mediaRemuneracao: number;
  mediaAcimaTeto: number;
  maiorRemuneracao: number;
  percentualAcimaTeto: number;
  membros: Member[];
  transparenciaScore: number;
}

export function getStatsByEstado(members: Member[]): Map<string, StateStats> {
  const map = new Map<string, StateStats>();

  for (const m of members) {
    let stats = map.get(m.estado);
    if (!stats) {
      stats = {
        estado: m.estado,
        totalMembros: 0,
        membrosAcimaTeto: 0,
        totalAcimaTeto: 0,
        mediaRemuneracao: 0,
        maiorRemuneracao: 0,
        percentualAcimaTeto: 0,
      };
      map.set(m.estado, stats);
    }
    stats.totalMembros++;
    if (m.acimaTeto > 0) {
      stats.membrosAcimaTeto++;
      stats.totalAcimaTeto += m.acimaTeto;
    }
    stats.maiorRemuneracao = Math.max(stats.maiorRemuneracao, m.remuneracaoTotal);
  }

  for (const stats of map.values()) {
    stats.mediaRemuneracao = members
      .filter((m) => m.estado === stats.estado)
      .reduce((acc, m) => acc + m.remuneracaoTotal, 0) / stats.totalMembros;
    stats.percentualAcimaTeto = (stats.membrosAcimaTeto / stats.totalMembros) * 100;
  }

  return map;
}

export function getStatsByOrgao(members: Member[]): Map<string, OrgaoStats> {
  const map = new Map<string, OrgaoStats>();
  // TODO: Replace with real transparency data. Currently a deterministic
  // placeholder based on orgao name hash — does NOT reflect actual transparency.
  const seed = 12345;

  for (const m of members) {
    let stats = map.get(m.orgao);
    if (!stats) {
      // Generate a deterministic transparency score based on orgao name
      let hash = seed;
      for (let i = 0; i < m.orgao.length; i++) {
        hash = ((hash << 5) - hash + m.orgao.charCodeAt(i)) | 0;
      }
      const score = 40 + (Math.abs(hash) % 60); // 40-99 range

      // Federal MPs have members across multiple states; show "Federal"
      const isFederalMP = ["MPF", "MPT", "MPM", "MPDFT"].includes(m.orgao);
      stats = {
        orgao: m.orgao,
        estado: isFederalMP ? "Federal" : m.estado,
        totalMembros: 0,
        membrosAcimaTeto: 0,
        totalAcimaTeto: 0,
        mediaRemuneracao: 0,
        mediaAcimaTeto: 0,
        maiorRemuneracao: 0,
        percentualAcimaTeto: 0,
        membros: [],
        transparenciaScore: score,
      };
      map.set(m.orgao, stats);
    }
    stats.totalMembros++;
    stats.membros.push(m);
    if (m.acimaTeto > 0) {
      stats.membrosAcimaTeto++;
      stats.totalAcimaTeto += m.acimaTeto;
    }
    stats.maiorRemuneracao = Math.max(stats.maiorRemuneracao, m.remuneracaoTotal);
  }

  for (const stats of map.values()) {
    const totalRemun = stats.membros.reduce((acc, m) => acc + m.remuneracaoTotal, 0);
    stats.mediaRemuneracao = totalRemun / stats.totalMembros;
    stats.mediaAcimaTeto = stats.membrosAcimaTeto > 0
      ? stats.totalAcimaTeto / stats.membrosAcimaTeto
      : 0;
    stats.percentualAcimaTeto = (stats.membrosAcimaTeto / stats.totalMembros) * 100;
    stats.membros.sort((a, b) => b.remuneracaoTotal - a.remuneracaoTotal);
  }

  return map;
}

export const SALARY_COMPARISONS = [
  { profissao: "Professor(a) da rede pública", salario: 4500 },
  { profissao: "Enfermeiro(a) do SUS", salario: 4750 },
  { profissao: "Policial Militar", salario: 5200 },
  { profissao: "Salário mediano brasileiro", salario: 2800 },
  { profissao: "Salário mínimo", salario: 1518 },
] as const;

export function getSalaryComparison(remuneracao: number) {
  return SALARY_COMPARISONS.map((c) => ({
    ...c,
    mesesEquivalentes: Math.round(remuneracao / c.salario),
    anosEquivalentes: (remuneracao / c.salario / 12).toFixed(1),
  }));
}
