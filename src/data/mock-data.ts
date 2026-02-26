import { TETO_CONSTITUCIONAL, type Cargo } from "@/lib/constants";

export interface MonthlyRecord {
  mes: string; // "2025-01" format
  remuneracaoBase: number;
  verbasIndenizatorias: number;
  direitosEventuais: number;
  direitosPessoais: number;
  remuneracaoTotal: number;
}

export interface Member {
  id: number;
  nome: string;
  cargo: Cargo;
  orgao: string;
  estado: string;
  remuneracaoBase: number;
  verbasIndenizatorias: number;
  direitosEventuais: number;
  direitosPessoais: number;
  remuneracaoTotal: number;
  acimaTeto: number;
  percentualAcimaTeto: number;
  historico: MonthlyRecord[];
}

// Deterministic pseudo-random number generator
function seededRandom(seed: number): () => number {
  let s = seed;
  return () => {
    s = (s * 16807 + 0) % 2147483647;
    return (s - 1) / 2147483646;
  };
}

const rand = seededRandom(42);

function randBetween(min: number, max: number): number {
  return Math.round(min + rand() * (max - min));
}

function pick<T>(arr: readonly T[]): T {
  return arr[Math.floor(rand() * arr.length)];
}

const FIRST_NAMES = [
  "José", "Maria", "João", "Ana", "Carlos", "Fernanda", "Paulo",
  "Juliana", "Marcos", "Luciana", "Roberto", "Patrícia", "Fernando",
  "Adriana", "Ricardo", "Cláudia", "Antônio", "Márcia", "Luiz",
  "Cristina", "Pedro", "Sandra", "Francisco", "Rosana", "Rafael",
  "Renata", "Marcelo", "Simone", "Eduardo", "Andréa", "Sérgio",
  "Vanessa", "Alexandre", "Tatiana", "Daniel", "Fabiana", "Gustavo",
  "Eliana", "Rogério", "Mônica", "André", "Helena", "Márcio",
  "Beatriz", "Rodrigo", "Carolina", "Leandro", "Daniela", "Thiago",
  "Camila", "Bruno", "Viviane", "Felipe", "Aline", "Fábio",
  "Priscila", "Gilberto", "Denise", "Henrique", "Raquel",
];

const LAST_NAMES = [
  "Silva", "Santos", "Oliveira", "Souza", "Lima", "Pereira",
  "Ferreira", "Costa", "Rodrigues", "Almeida", "Nascimento", "Araújo",
  "Carvalho", "Ribeiro", "Gomes", "Martins", "Barbosa", "Rocha",
  "Correia", "Dias", "Moreira", "Nunes", "Vieira", "Monteiro",
  "Cardoso", "Campos", "Teixeira", "Moura", "Freitas", "Mendes",
  "Ramos", "Pinto", "Barros", "Machado", "Melo", "Lopes",
  "Andrade", "Cavalcanti", "Miranda", "Azevedo", "Fonseca", "Guimarães",
  "Rezende", "Duarte", "Sampaio", "Cunha", "Bastos", "Nogueira",
  "Pinheiro", "Braga",
];

const ESTADO_ORGAO_MAP: Record<string, string[]> = {
  AC: ["TJ-AC", "MP-AC", "TRE-AC"],
  AL: ["TJ-AL", "MP-AL", "TRE-AL"],
  AM: ["TJ-AM", "MP-AM", "TRE-AM"],
  AP: ["TJ-AP", "MP-AP", "TRE-AP"],
  BA: ["TJ-BA", "MP-BA", "TRE-BA"],
  CE: ["TJ-CE", "MP-CE", "TRE-CE"],
  DF: ["TJ-DF", "MPDFT", "TRE-DF", "STF", "STJ", "TST", "TSE", "STM", "MPF", "MPT", "MPM", "TRF-1"],
  ES: ["TJ-ES", "MP-ES", "TRE-ES"],
  GO: ["TJ-GO", "MP-GO", "TRE-GO"],
  MA: ["TJ-MA", "MP-MA", "TRE-MA"],
  MG: ["TJ-MG", "MP-MG", "TRE-MG", "TRF-6", "TRT-3"],
  MS: ["TJ-MS", "MP-MS", "TRE-MS", "TRT-24"],
  MT: ["TJ-MT", "MP-MT", "TRE-MT", "TRT-23"],
  PA: ["TJ-PA", "MP-PA", "TRE-PA", "TRT-8"],
  PB: ["TJ-PB", "MP-PB", "TRE-PB", "TRT-13"],
  PE: ["TJ-PE", "MP-PE", "TRE-PE", "TRT-6"],
  PI: ["TJ-PI", "MP-PI", "TRE-PI"],
  PR: ["TJ-PR", "MP-PR", "TRE-PR", "TRT-9", "TRF-4"],
  RJ: ["TJ-RJ", "MP-RJ", "TRE-RJ", "TRF-2", "TRT-1"],
  RN: ["TJ-RN", "MP-RN", "TRE-RN"],
  RO: ["TJ-RO", "MP-RO", "TRE-RO", "TRT-14"],
  RR: ["TJ-RR", "MP-RR", "TRE-RR"],
  RS: ["TJ-RS", "MP-RS", "TRE-RS", "TRT-4"],
  SC: ["TJ-SC", "MP-SC", "TRE-SC", "TRT-12"],
  SE: ["TJ-SE", "MP-SE", "TRE-SE"],
  SP: ["TJ-SP", "MP-SP", "TRE-SP", "TRF-3", "TRT-2", "TRT-15"],
  TO: ["TJ-TO", "MP-TO", "TRE-TO"],
};

function getCargoForOrgao(orgao: string): Cargo {
  if (orgao.startsWith("MP") || ["MPF", "MPT", "MPM", "MPDFT"].includes(orgao)) {
    return rand() > 0.5 ? "Promotor(a)" : "Procurador(a)";
  }
  if (["STF", "STJ", "TST", "TSE", "STM"].includes(orgao)) {
    return "Ministro(a)";
  }
  if (orgao.startsWith("TJ-") && rand() > 0.4) {
    return "Desembargador(a)";
  }
  if (orgao.startsWith("TJ-")) {
    return "Juiz(a)";
  }
  return rand() > 0.5 ? "Desembargador(a)" : "Juiz(a)";
}

function generateMonthlyHistory(
  baseRemun: number,
  verbas: number,
  eventuais: number,
  pessoais: number
): MonthlyRecord[] {
  const months: MonthlyRecord[] = [];
  const startDate = new Date(2024, 0); // Jan 2024
  const endDate = new Date(2025, 5);   // Jun 2025

  for (let d = new Date(startDate); d <= endDate; d.setMonth(d.getMonth() + 1)) {
    const monthStr = `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, "0")}`;
    const variation = 0.85 + rand() * 0.3; // 85% to 115% variation
    const spikeChance = rand();
    const spike = spikeChance > 0.92 ? 1.5 + rand() * 1.5 : 1; // 8% chance of spike (retroativos)

    const mVerbas = Math.round(verbas * variation * spike);
    const mEventuais = Math.round(eventuais * variation * (spikeChance > 0.95 ? spike * 1.2 : 1));
    const mPessoais = Math.round(pessoais * (0.95 + rand() * 0.1));
    const mTotal = baseRemun + mVerbas + mEventuais + mPessoais;

    months.push({
      mes: monthStr,
      remuneracaoBase: baseRemun,
      verbasIndenizatorias: mVerbas,
      direitosEventuais: mEventuais,
      direitosPessoais: mPessoais,
      remuneracaoTotal: mTotal,
    });
  }
  return months;
}

function generateMembers(): Member[] {
  const members: Member[] = [];
  const usedNames = new Set<string>();
  const estados = Object.keys(ESTADO_ORGAO_MAP);

  // Weight distribution: SP, RJ, MG, DF get more members
  const stateWeights: Record<string, number> = {
    SP: 30, RJ: 22, MG: 18, DF: 15, RS: 12, PR: 10, BA: 9,
    PE: 8, CE: 7, PA: 6, GO: 6, SC: 6, MA: 5, ES: 5,
    AM: 4, MT: 4, MS: 4, PB: 4, RN: 4, PI: 3, AL: 3,
    SE: 3, TO: 3, RO: 3, AP: 2, RR: 2, AC: 2,
  };

  const weightedEstados: string[] = [];
  for (const e of estados) {
    const w = stateWeights[e] || 2;
    for (let i = 0; i < w; i++) weightedEstados.push(e);
  }

  for (let i = 0; i < 200; i++) {
    let nome: string;
    do {
      const first = pick(FIRST_NAMES);
      const mid = pick(LAST_NAMES);
      const last = pick(LAST_NAMES);
      nome = mid === last ? `${first} ${mid} de ${pick(LAST_NAMES)}` : `${first} ${mid} ${last}`;
    } while (usedNames.has(nome));
    usedNames.add(nome);

    const estado = pick(weightedEstados);
    const orgaos = ESTADO_ORGAO_MAP[estado];
    const orgao = pick(orgaos);
    const cargo = getCargoForOrgao(orgao);

    // Generate remuneration - biased toward above teto
    let remuneracaoBase: number;
    let verbasIndenizatorias: number;
    let direitosEventuais: number;
    let direitosPessoais: number;

    const tier = rand();
    if (tier < 0.05) {
      // Top 5%: extreme outliers (R$150k-263k total)
      remuneracaoBase = randBetween(33000, 39293);
      verbasIndenizatorias = randBetween(60000, 140000);
      direitosEventuais = randBetween(20000, 60000);
      direitosPessoais = randBetween(15000, 35000);
    } else if (tier < 0.20) {
      // 15%: high (R$100k-150k total)
      remuneracaoBase = randBetween(33000, 39293);
      verbasIndenizatorias = randBetween(35000, 70000);
      direitosEventuais = randBetween(10000, 30000);
      direitosPessoais = randBetween(8000, 22000);
    } else if (tier < 0.55) {
      // 35%: medium-high (R$60k-100k total)
      remuneracaoBase = randBetween(30000, 39293);
      verbasIndenizatorias = randBetween(15000, 40000);
      direitosEventuais = randBetween(3000, 15000);
      direitosPessoais = randBetween(5000, 15000);
    } else if (tier < 0.80) {
      // 25%: just above teto (R$47k-60k total)
      remuneracaoBase = randBetween(30000, 39293);
      verbasIndenizatorias = randBetween(5000, 15000);
      direitosEventuais = randBetween(1000, 5000);
      direitosPessoais = randBetween(2000, 8000);
    } else {
      // 20%: below or at teto
      remuneracaoBase = randBetween(25000, 35000);
      verbasIndenizatorias = randBetween(0, 8000);
      direitosEventuais = randBetween(0, 3000);
      direitosPessoais = randBetween(0, 5000);
    }

    const remuneracaoTotal = remuneracaoBase + verbasIndenizatorias + direitosEventuais + direitosPessoais;
    const acimaTeto = Math.max(0, remuneracaoTotal - TETO_CONSTITUCIONAL);
    const percentualAcimaTeto = acimaTeto > 0 ? ((acimaTeto / TETO_CONSTITUCIONAL) * 100) : 0;

    members.push({
      id: i + 1,
      nome,
      cargo,
      orgao,
      estado,
      remuneracaoBase,
      verbasIndenizatorias,
      direitosEventuais,
      direitosPessoais,
      remuneracaoTotal,
      acimaTeto,
      percentualAcimaTeto,
      historico: generateMonthlyHistory(remuneracaoBase, verbasIndenizatorias, direitosEventuais, direitosPessoais),
    });
  }

  // Sort by highest total remuneration
  members.sort((a, b) => b.remuneracaoTotal - a.remuneracaoTotal);

  return members;
}

export const mockMembers: Member[] = generateMembers();

export function getKPIs(members: Member[]) {
  const acimaTeto = members.filter((m) => m.acimaTeto > 0);
  const totalAcimaTeto = acimaTeto.reduce((acc, m) => acc + m.acimaTeto, 0);
  const mediaAcimaTeto = acimaTeto.length > 0 ? totalAcimaTeto / acimaTeto.length : 0;
  const maiorRemuneracao = members.length > 0 ? members[0].remuneracaoTotal : 0;
  const percentualAcimaTeto = members.length > 0 ? (acimaTeto.length / members.length) * 100 : 0;

  return {
    totalAcimaTeto: totalAcimaTeto * 12, // annualized
    numAcimaTeto: acimaTeto.length,
    maiorRemuneracao,
    mediaAcimaTeto,
    percentualAcimaTeto,
  };
}
