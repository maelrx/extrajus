import { NextRequest, NextResponse } from "next/server";

function openDB() {
  // eslint-disable-next-line @typescript-eslint/no-require-imports
  const Database = require("better-sqlite3");
  const path = require("path");
  const fs = require("fs");

  const dbPath = path.join(process.cwd(), "data", "extrateto.db");
  if (!fs.existsSync(dbPath)) return null;

  const db = new Database(dbPath, { readonly: true });
  db.pragma("journal_mode = WAL");
  return db;
}

export async function GET(request: NextRequest) {
  const q = request.nextUrl.searchParams.get("q")?.trim();
  if (!q || q.length < 2) {
    return NextResponse.json([]);
  }

  const db = openDB();
  if (!db) return NextResponse.json([]);

  try {
    // Remove acentos e prepara query FTS: "joao silva" → "joao* silva*"
    const normalized = q
      .normalize("NFD")
      .replace(/[\u0300-\u036f]/g, "")
      .replace(/[^\w\s-]/g, "");
    const ftsQuery = normalized
      .split(/\s+/)
      .filter(Boolean)
      .map((t) => `${t}*`)
      .join(" ");

    // Check if FTS table exists
    const ftsExists = db
      .prepare(
        "SELECT name FROM sqlite_master WHERE type='table' AND name='membros_fts'"
      )
      .get();

    let rows;

    if (ftsExists) {
      rows = db
        .prepare(
          `SELECT m.id, m.nome, m.cargo, m.orgao, m.estado, m.remuneracao_total
           FROM membros_fts fts
           JOIN membros m ON m.id = fts.rowid
           WHERE membros_fts MATCH ?
           ORDER BY m.remuneracao_total DESC
           LIMIT 8`
        )
        .all(ftsQuery);
    } else {
      // Fallback: LIKE query if FTS not yet built
      const like = `%${normalized}%`;
      rows = db
        .prepare(
          `SELECT id, nome, cargo, orgao, estado, remuneracao_total
           FROM membros
           WHERE nome LIKE ? OR cargo LIKE ? OR orgao LIKE ?
           ORDER BY remuneracao_total DESC
           LIMIT 8`
        )
        .all(like, like, like);
    }

    db.close();

    return NextResponse.json(
      (rows as Record<string, unknown>[]).map((r) => ({
        id: r.id,
        nome: r.nome,
        cargo: r.cargo,
        orgao: r.orgao,
        estado: r.estado,
        remuneracaoTotal: r.remuneracao_total,
      }))
    );
  } catch {
    db.close();
    return NextResponse.json([]);
  }
}
