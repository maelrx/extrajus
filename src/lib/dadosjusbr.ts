/**
 * DadosJusBr Data Pipeline
 *
 * This module provides the integration layer with the DadosJusBr API
 * (https://dadosjusbr.org) for fetching real judiciary compensation data.
 *
 * The pipeline follows these steps:
 * 1. Fetch raw data from DadosJusBr API
 * 2. Normalize fields to our internal schema
 * 3. Compute derived values (acimaTeto, percentual, etc.)
 * 4. Store in local cache (future: database)
 *
 * Currently uses mock data. Replace with real API calls when ready.
 */

import type { Member } from "@/data/mock-data";
import type { Cargo } from "@/lib/constants";
import { TETO_CONSTITUCIONAL } from "@/lib/constants";

// DadosJusBr API base URL
const DADOSJUSBR_API = "https://api.dadosjusbr.org/v2";

// Supported organs in DadosJusBr
export const DADOSJUSBR_ORGAOS = [
  // Tribunais de Justiça
  "tjac", "tjal", "tjam", "tjap", "tjba", "tjce", "tjdft", "tjes",
  "tjgo", "tjma", "tjmg", "tjms", "tjmt", "tjpa", "tjpb", "tjpe",
  "tjpi", "tjpr", "tjrj", "tjrn", "tjro", "tjrr", "tjrs", "tjsc",
  "tjse", "tjsp", "tjto",
  // Ministérios Públicos Estaduais
  "mppb", "mpac", "mpal", "mpam", "mpap", "mpba", "mpce",
  "mpes", "mpgo", "mpma", "mpmg", "mpms", "mpmt", "mppa", "mppe",
  "mppi", "mppr", "mprj", "mprn", "mpro", "mprr", "mprs", "mpsc",
  "mpse", "mpsp", "mpto",
  // Ministério Público da União (ramos)
  "mpf", "mpt", "mpm", "mpdft",
] as const;

export type DadosJusBrOrgao = (typeof DADOSJUSBR_ORGAOS)[number];

/**
 * Raw data format from DadosJusBr API
 */
interface DadosJusBrMembro {
  reg: string;
  name: string;
  role: string;
  type: string;
  workplace: string;
  active: boolean;
  income: {
    total: number;
    wage: number;
    perks: {
      total: number;
      food: number;
      transportation: number;
      housing: number;
      health: number;
      others: number;
    };
    other: {
      total: number;
      personal_benefits: number;
      eventual_benefits: number;
      trust_position: number;
      daily: number;
      gratification: number;
      origin_pos: number;
      others: number;
    };
  };
  discounts: {
    total: number;
    prev_contribution: number;
    ceil_retention: number;
    income_tax: number;
  };
}

interface DadosJusBrResponse {
  agency: {
    id: string;
    name: string;
    type: string;
    entity: string;
    uf: string;
  };
  month: number;
  year: number;
  members: DadosJusBrMembro[];
}

/**
 * Maps a DadosJusBr organ ID to our internal organ name
 */
function mapOrgaoId(id: string): string {
  // Federal MP branches (ramos do MPU)
  const federalMPs: Record<string, string> = {
    mpf: "MPF",
    mpt: "MPT",
    mpm: "MPM",
    mpdft: "MPDFT",
  };
  if (federalMPs[id]) return federalMPs[id];

  const prefix = id.substring(0, 2).toUpperCase();
  const suffix = id.substring(2).toUpperCase();

  if (prefix === "TJ") {
    return suffix === "DFT" ? "TJ-DF" : `TJ-${suffix}`;
  }
  if (prefix === "MP") {
    return `MP-${suffix}`;
  }
  return id.toUpperCase();
}

/**
 * Maps a DadosJusBr role string to our internal cargo
 */
function mapCargo(role: string, orgaoType: string): Cargo {
  const r = role.toLowerCase();
  if (r.includes("desembargador")) return "Desembargador(a)";
  if (r.includes("juiz") || r.includes("juíz")) return "Juiz(a)";
  if (r.includes("ministro")) return "Ministro(a)";
  if (r.includes("promotor")) return "Promotor(a)";
  if (r.includes("procurador")) return "Procurador(a)";
  if (r.includes("defensor")) return "Defensor(a) Público(a)";

  // Fallback based on organ type
  if (orgaoType.startsWith("MP")) return "Promotor(a)";
  return "Juiz(a)";
}

/**
 * Normalizes a DadosJusBr member to our internal schema
 */
function normalizeMembro(
  raw: DadosJusBrMembro,
  orgao: string,
  estado: string,
  orgaoType: string,
  id: number
): Member {
  const remuneracaoBase = raw.income.wage;
  const verbasIndenizatorias = raw.income.perks.total;
  const direitosEventuais = raw.income.other.eventual_benefits + raw.income.other.daily + raw.income.other.gratification;
  const direitosPessoais = raw.income.other.personal_benefits + raw.income.other.trust_position;
  const remuneracaoTotal = raw.income.total;
  const acimaTeto = Math.max(0, remuneracaoTotal - TETO_CONSTITUCIONAL);
  const percentualAcimaTeto = acimaTeto > 0 ? (acimaTeto / TETO_CONSTITUCIONAL) * 100 : 0;

  return {
    id,
    nome: raw.name,
    cargo: mapCargo(raw.role, orgaoType),
    orgao,
    estado,
    remuneracaoBase,
    verbasIndenizatorias,
    direitosEventuais,
    direitosPessoais,
    remuneracaoTotal,
    acimaTeto,
    percentualAcimaTeto,
    historico: [], // Filled by fetching multiple months
  };
}

/**
 * Fetches data for a specific organ and month from DadosJusBr API.
 *
 * Usage (when ready for real data):
 *   const data = await fetchOrgaoMonth("tjsp", 2025, 6);
 */
export async function fetchOrgaoMonth(
  orgaoId: DadosJusBrOrgao,
  year: number,
  month: number
): Promise<Member[]> {
  const url = `${DADOSJUSBR_API}/orgao/${orgaoId}/${year}/${month}`;

  const response = await fetch(url, {
    headers: { Accept: "application/json" },
    next: { revalidate: 86400 }, // Cache for 24h
  });

  if (!response.ok) {
    throw new Error(`DadosJusBr API error: ${response.status} for ${orgaoId} ${year}/${month}`);
  }

  const data: DadosJusBrResponse = await response.json();

  return data.members.map((m, i) =>
    normalizeMembro(
      m,
      mapOrgaoId(data.agency.id),
      data.agency.uf,
      data.agency.type,
      i + 1
    )
  );
}

/**
 * Fetches data for all supported organs for a given month.
 * Runs requests in parallel with concurrency limit.
 */
export async function fetchAllOrgaos(
  year: number,
  month: number,
  concurrency = 5
): Promise<Member[]> {
  const allMembers: Member[] = [];
  let nextId = 1;

  // Process in batches
  for (let i = 0; i < DADOSJUSBR_ORGAOS.length; i += concurrency) {
    const batch = DADOSJUSBR_ORGAOS.slice(i, i + concurrency);
    const results = await Promise.allSettled(
      batch.map((orgaoId) => fetchOrgaoMonth(orgaoId, year, month))
    );

    for (const result of results) {
      if (result.status === "fulfilled") {
        for (const member of result.value) {
          allMembers.push({ ...member, id: nextId++ });
        }
      }
      // Skip failed organs silently — not all organs have data for all months
    }
  }

  return allMembers.sort((a, b) => b.remuneracaoTotal - a.remuneracaoTotal);
}

/**
 * Builds monthly history for a member by fetching multiple months.
 * For use in the detailed member view.
 */
export async function fetchMemberHistory(
  orgaoId: DadosJusBrOrgao,
  memberName: string,
  year: number,
  months: number = 12
): Promise<{ mes: string; remuneracaoBase: number; remuneracaoTotal: number }[]> {
  const history: { mes: string; remuneracaoBase: number; remuneracaoTotal: number }[] = [];

  for (let i = 0; i < months; i++) {
    let m = new Date(year, 0).getMonth() - i;
    let y = year;
    if (m < 0) {
      m += 12;
      y -= 1;
    }
    const monthNum = m + 1;

    try {
      const members = await fetchOrgaoMonth(orgaoId, y, monthNum);
      const match = members.find(
        (member) => member.nome.toLowerCase() === memberName.toLowerCase()
      );
      if (match) {
        const monthNames = ["Jan", "Fev", "Mar", "Abr", "Mai", "Jun", "Jul", "Ago", "Set", "Out", "Nov", "Dez"];
        history.unshift({
          mes: `${monthNames[m]}/${String(y).slice(2)}`,
          remuneracaoBase: match.remuneracaoBase,
          remuneracaoTotal: match.remuneracaoTotal,
        });
      }
    } catch {
      // Month not available, skip
    }
  }

  return history;
}
