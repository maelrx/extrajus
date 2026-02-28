import Link from "next/link";
import { ArrowLeft, Code2, ExternalLink } from "lucide-react";
import { Footer } from "@/components/footer";

const endpoints = [
  {
    method: "GET",
    path: "/api/v1/membros",
    description: "Lista membros do Judiciário/MP com remunerações",
    params: [
      { name: "estado", type: "string", desc: "Sigla do estado (ex: SP, RJ)" },
      { name: "orgao", type: "string", desc: "Nome do órgão (ex: TJ-SP, MP-RJ)" },
      { name: "cargo", type: "string", desc: "Cargo (ex: Juiz(a), Desembargador(a))" },
      { name: "nome", type: "string", desc: "Busca por nome (parcial, sem acentos)" },
      { name: "acima_teto", type: "boolean", desc: "Filtrar apenas acima do teto (true/false)" },
      { name: "sort", type: "string", desc: "Ordenação: maior_remuneracao, maior_acima_teto, nome" },
      { name: "page", type: "number", desc: "Página (default: 1)" },
      { name: "limit", type: "number", desc: "Itens por página (default: 50, max: 200)" },
    ],
    example: "/api/v1/membros?estado=SP&acima_teto=true&limit=10",
  },
  {
    method: "GET",
    path: "/api/v1/orgaos",
    description: "Estatísticas agregadas por órgão/tribunal",
    params: [],
    example: "/api/v1/orgaos",
  },
  {
    method: "GET",
    path: "/api/v1/estados",
    description: "Estatísticas agregadas por estado",
    params: [],
    example: "/api/v1/estados",
  },
];

export default function ApiDocsPage() {
  return (
    <div className="min-h-screen bg-background">
      <div className="mx-auto max-w-4xl px-4 py-12 sm:px-6">
        <Link
          href="/"
          className="mb-8 inline-flex items-center gap-1.5 text-sm text-muted hover:text-foreground transition-colors"
        >
          <ArrowLeft className="h-4 w-4" />
          Voltar ao ranking
        </Link>

        <div className="mb-8 flex items-center gap-3">
          <Code2 className="h-6 w-6 text-foreground" />
          <div>
            <h1 className="font-serif text-3xl font-bold text-foreground">API Pública</h1>
            <p className="text-sm text-muted">
              Acesse os dados do ExtraTeto programaticamente. Uso livre para fins de pesquisa e jornalismo.
            </p>
          </div>
        </div>

        <div className="mb-8 rounded-lg border border-amber-200 bg-amber-50 p-4 text-sm text-amber-800 dark:border-amber-900/30 dark:bg-amber-950 dark:text-amber-200">
          <strong>Base URL:</strong>{" "}
          <code className="rounded bg-amber-100 px-1.5 py-0.5 text-xs dark:bg-amber-900">
            https://extrateto.org/api/v1
          </code>
          <p className="mt-1 text-xs text-amber-600 dark:text-amber-400">
            A API retorna JSON. Não requer autenticação. Rate limit: 100 requests/minuto.
          </p>
        </div>

        <div className="space-y-8">
          {endpoints.map((ep) => (
            <div
              key={ep.path}
              className="rounded-lg border border-border bg-card p-5 shadow-sm"
            >
              <div className="mb-3 flex items-center gap-2">
                <span className="rounded bg-green-100 px-2 py-0.5 text-xs font-bold text-green-700 dark:bg-green-900 dark:text-green-300">
                  {ep.method}
                </span>
                <code className="text-sm font-medium text-foreground">{ep.path}</code>
              </div>
              <p className="mb-4 text-sm text-muted">{ep.description}</p>

              {ep.params.length > 0 && (
                <>
                  <h3 className="mb-2 text-xs font-semibold uppercase tracking-wider text-muted">
                    Parâmetros
                  </h3>
                  <table className="mb-4 w-full text-sm">
                    <thead>
                      <tr className="border-b border-border text-left text-[11px] text-muted">
                        <th className="pb-1 pr-4">Nome</th>
                        <th className="pb-1 pr-4">Tipo</th>
                        <th className="pb-1">Descrição</th>
                      </tr>
                    </thead>
                    <tbody>
                      {ep.params.map((p) => (
                        <tr key={p.name} className="border-b border-border">
                          <td className="py-1.5 pr-4">
                            <code className="rounded bg-surface px-1 text-xs text-foreground">
                              {p.name}
                            </code>
                          </td>
                          <td className="py-1.5 pr-4 text-xs text-muted">
                            {p.type}
                          </td>
                          <td className="py-1.5 text-xs text-muted">
                            {p.desc}
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </>
              )}

              <div className="rounded-md bg-gray-900 p-3">
                <div className="mb-1 flex items-center justify-between">
                  <span className="text-[10px] text-gray-500">Exemplo</span>
                  <a
                    href={ep.example}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="flex items-center gap-1 text-[10px] text-blue-400 hover:underline"
                  >
                    Testar <ExternalLink className="h-2.5 w-2.5" />
                  </a>
                </div>
                <code className="text-xs text-green-400">
                  curl {ep.example}
                </code>
              </div>
            </div>
          ))}
        </div>

        <div className="mt-8 rounded-lg border border-border bg-card p-5 shadow-sm">
          <h2 className="mb-3 font-serif text-lg font-bold text-foreground">
            Formato de Resposta
          </h2>
          <div className="rounded-md bg-gray-900 p-3">
            <pre className="text-xs text-gray-300">{`{
  "data": [
    {
      "id": 1,
      "nome": "Nome Completo",
      "cargo": "Desembargador(a)",
      "orgao": "TJ-SP",
      "estado": "SP",
      "remuneracaoBase": 33689,
      "verbasIndenizatorias": 89200,
      "direitosEventuais": 42100,
      "direitosPessoais": 22443,
      "remuneracaoTotal": 187432,
      "acimaTeto": 141066,
      "percentualAcimaTeto": 304.2
    }
  ],
  "meta": {
    "total": 200,
    "page": 1,
    "limit": 50,
    "totalPages": 4
  }
}`}</pre>
          </div>
        </div>
      </div>
      <Footer />
    </div>
  );
}
