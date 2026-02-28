import { eq, desc, asc, like, and, gte, lte, sql, count } from "drizzle-orm";
import { getDb } from "./index";
import { membros, historicoMensal } from "./schema";
import type { Member } from "@/data/mock-data";

interface QueryFilters {
  estado?: string;
  orgao?: string;
  cargo?: string;
  nome?: string;
  acimaTeto?: boolean;
  salarioMin?: number;
  salarioMax?: number;
  mesReferencia?: string;
  sortBy?: string;
  page?: number;
  limit?: number;
}

/**
 * Fetches members from the database with filters, sorting, and pagination.
 */
export function queryMembros(filters: QueryFilters = {}) {
  const db = getDb();
  const conditions = [];

  if (filters.estado) {
    conditions.push(eq(membros.estado, filters.estado));
  }
  if (filters.orgao) {
    conditions.push(eq(membros.orgao, filters.orgao));
  }
  if (filters.cargo) {
    conditions.push(eq(membros.cargo, filters.cargo));
  }
  if (filters.nome) {
    conditions.push(like(membros.nome, `%${filters.nome}%`));
  }
  if (filters.acimaTeto) {
    conditions.push(gte(membros.acimaTeto, 0.01));
  }
  if (filters.salarioMin) {
    conditions.push(gte(membros.remuneracaoTotal, filters.salarioMin));
  }
  if (filters.salarioMax) {
    conditions.push(lte(membros.remuneracaoTotal, filters.salarioMax));
  }
  if (filters.mesReferencia) {
    conditions.push(eq(membros.mesReferencia, filters.mesReferencia));
  }

  const where = conditions.length > 0 ? and(...conditions) : undefined;

  // Sorting
  let orderBy;
  switch (filters.sortBy) {
    case "maior_remuneracao":
      orderBy = desc(membros.remuneracaoTotal);
      break;
    case "maior_acima_teto":
      orderBy = desc(membros.acimaTeto);
      break;
    case "maior_percentual":
      orderBy = desc(membros.percentualAcimaTeto);
      break;
    case "nome_az":
      orderBy = asc(membros.nome);
      break;
    case "orgao":
      orderBy = asc(membros.orgao);
      break;
    default:
      orderBy = desc(membros.remuneracaoTotal);
  }

  const page = filters.page || 1;
  const limit = Math.min(filters.limit || 50, 200);
  const offset = (page - 1) * limit;

  const data = db
    .select()
    .from(membros)
    .where(where)
    .orderBy(orderBy)
    .limit(limit)
    .offset(offset)
    .all();

  const totalResult = db
    .select({ count: count() })
    .from(membros)
    .where(where)
    .get();

  const total = totalResult?.count || 0;

  return {
    data: data.map(rowToMember),
    meta: {
      total,
      page,
      limit,
      totalPages: Math.ceil(total / limit),
    },
  };
}

/**
 * Fetch all members (for client-side use, limited to latest month).
 */
export function getAllMembros(mesReferencia?: string): Member[] {
  const db = getDb();

  // Get latest month if not specified
  const latestMonth = mesReferencia || db
    .select({ mes: membros.mesReferencia })
    .from(membros)
    .orderBy(desc(membros.mesReferencia))
    .limit(1)
    .get()?.mes;

  if (!latestMonth) return [];

  const rows = db
    .select()
    .from(membros)
    .where(eq(membros.mesReferencia, latestMonth))
    .orderBy(desc(membros.remuneracaoTotal))
    .all();

  return rows.map(rowToMember);
}

/**
 * Get monthly history for a specific member by name and organ.
 */
export function getMembroHistory(nome: string, orgao: string) {
  const db = getDb();

  const membro = db
    .select({ id: membros.id })
    .from(membros)
    .where(and(eq(membros.nome, nome), eq(membros.orgao, orgao)))
    .limit(1)
    .get();

  if (!membro) return [];

  return db
    .select()
    .from(historicoMensal)
    .where(eq(historicoMensal.membroId, membro.id))
    .all();
}

/**
 * Check if database has any data.
 */
export function hasData(): boolean {
  const db = getDb();
  const result = db.select({ count: count() }).from(membros).get();
  return (result?.count || 0) > 0;
}

/**
 * Get the latest reference month in the database.
 */
export function getLatestMonth(): string | null {
  const db = getDb();
  const result = db
    .select({ mes: membros.mesReferencia })
    .from(membros)
    .orderBy(desc(membros.mesReferencia))
    .limit(1)
    .get();
  return result?.mes || null;
}

/**
 * Convert a database row to a Member object (compatible with existing components).
 */
function rowToMember(row: typeof membros.$inferSelect): Member {
  return {
    id: row.id,
    nome: row.nome,
    cargo: row.cargo as Member["cargo"],
    orgao: row.orgao,
    estado: row.estado,
    remuneracaoBase: row.remuneracaoBase,
    verbasIndenizatorias: row.verbasIndenizatorias,
    direitosEventuais: row.direitosEventuais,
    direitosPessoais: row.direitosPessoais,
    remuneracaoTotal: row.remuneracaoTotal,
    acimaTeto: row.acimaTeto,
    percentualAcimaTeto: row.percentualAcimaTeto,
    abateTeto: 0,
    historico: [], // Loaded separately if needed
  };
}
