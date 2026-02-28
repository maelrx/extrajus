import Link from "next/link";
import { ArrowLeft } from "lucide-react";
import { Footer } from "@/components/footer";

export default function MetodologiaPage() {
  return (
    <div className="min-h-screen bg-background">
      <div className="mx-auto max-w-3xl px-4 py-12 sm:px-6">
        <Link
          href="/"
          className="mb-8 inline-flex items-center gap-1.5 text-sm text-muted hover:text-foreground transition-colors"
        >
          <ArrowLeft className="h-4 w-4" />
          Voltar ao ranking
        </Link>

        <h1 className="font-serif text-3xl font-bold text-foreground">Metodologia</h1>
        <p className="mt-2 text-sm text-muted">
          Como os dados são coletados, processados e apresentados.
        </p>

        <div className="mt-8 space-y-8 text-sm leading-relaxed text-foreground">
          <section>
            <h2 className="font-serif text-xl font-bold text-foreground">Fontes de Dados</h2>
            <p className="mt-2">
              Os dados exibidos no ExtraTeto são obtidos de fontes públicas oficiais,
              disponibilizadas em cumprimento à Lei de Acesso à Informação (Lei 12.527/2011).
            </p>
            <ul className="mt-3 list-disc space-y-2 pl-5">
              <li>
                <strong>DadosJusBr</strong> (dadosjusbr.org) — Projeto open source que coleta e
                padroniza dados de remuneração de membros do Judiciário e Ministério Público
                de 93 órgãos. Período: Janeiro/2018 a Junho/2025.
              </li>
              <li>
                <strong>CNJ — Painel de Remuneração dos Magistrados</strong> — Planilhas
                padronizadas publicadas por cada tribunal com dados de remuneração de magistrados.
              </li>
              <li>
                <strong>CNMP — Portal da Transparência</strong> — Dados de remuneração de
                membros dos Ministérios Públicos estaduais e federal.
              </li>
            </ul>
          </section>

          <section>
            <h2 className="font-serif text-xl font-bold text-foreground">Teto Constitucional</h2>
            <p className="mt-2">
              O teto remuneratório do funcionalismo público brasileiro é definido pelo
              Art. 37, XI da Constituição Federal como o subsídio mensal dos Ministros do
              Supremo Tribunal Federal.
            </p>
            <ul className="mt-3 list-disc space-y-1 pl-5">
              <li>Teto 2025: R$46.366,19/mês</li>
              <li>Teto 2024: R$44.008,52/mês</li>
            </ul>
          </section>

          <section>
            <h2 className="font-serif text-xl font-bold text-foreground">Cálculos</h2>
            <ul className="mt-2 list-disc space-y-2 pl-5">
              <li>
                <strong>Remuneração Total</strong> = Remuneração Base + Verbas Indenizatórias
                + Direitos Eventuais + Direitos Pessoais
              </li>
              <li>
                <strong>Acima do Teto</strong> = max(0, Remuneração Total - Teto Constitucional)
              </li>
              <li>
                <strong>% Acima do Teto</strong> = (Acima do Teto / Teto) x 100
              </li>
              <li>
                <strong>Alertas de Pico</strong>: Meses em que a remuneração total excede 2x
                a média individual do membro, indicando possível pagamento retroativo.
              </li>
            </ul>
          </section>

          <section>
            <h2 className="font-serif text-xl font-bold text-foreground">Cobertura dos Dados</h2>
            <p className="mt-2">
              O ExtraTeto não cobre a totalidade dos órgãos do Judiciário e Ministério Público
              brasileiros. A disponibilidade depende de cada órgão publicar seus dados em formato
              acessível ao DadosJusBr.
            </p>

            <div className="mt-4 rounded-lg border border-amber-200 bg-amber-50 p-4 dark:border-amber-900/30 dark:bg-amber-950">
              <h3 className="font-semibold text-amber-900 dark:text-amber-100">Órgãos ausentes na base</h3>
              <ul className="mt-2 list-disc space-y-1 pl-5 text-amber-800 dark:text-amber-200">
                <li>
                  <strong>Ministérios Públicos federais</strong>: MPF, MPT, MPM e MPDFT
                  não estão incluídos na base.
                </li>
                <li>
                  <strong>9 MPs estaduais</strong> sem dados: DF, MS, MT, PA, RR, RS, SC, SE e TO.
                </li>
                <li>
                  Atualmente a base cobre <strong>18 de 31</strong> Ministérios Públicos
                  e a maioria dos Tribunais de Justiça estaduais.
                </li>
              </ul>
            </div>

            <div className="mt-4 rounded-lg border border-blue-200 bg-blue-50 p-4 dark:border-blue-900/30 dark:bg-blue-950">
              <h3 className="font-semibold text-blue-900 dark:text-blue-100">Ativos e inativos</h3>
              <p className="mt-1 text-blue-800 dark:text-blue-200">
                Os dados provêm das folhas de pagamento dos órgãos, que incluem membros
                <strong> ativos, inativos (aposentados) e pensionistas</strong>. Isso significa que:
              </p>
              <ul className="mt-2 list-disc space-y-1 pl-5 text-blue-800 dark:text-blue-200">
                <li>
                  O número de <strong>desembargadores</strong> na base (~3.400) é significativamente
                  maior que o total de ativos no país (~1.600), pois inclui aposentados que
                  continuam na folha de pagamento.
                </li>
                <li>
                  O número de <strong>juízes</strong> (~14.500) e <strong>promotores</strong> (~7.900)
                  aparece abaixo do total real do país (respectivamente ~18.900 e ~13.600),
                  devido à cobertura incompleta dos órgãos.
                </li>
                <li>
                  Não é possível distinguir ativos de aposentados nos dados disponíveis, pois
                  a fonte não fornece essa classificação.
                </li>
              </ul>
            </div>
          </section>

          <section>
            <h2 className="font-serif text-xl font-bold text-foreground">Outras Limitações</h2>
            <ul className="mt-2 list-disc space-y-2 pl-5">
              <li>
                Os dados originais podem conter erros de lançamento pelos próprios órgãos.
              </li>
              <li>
                Alguns tribunais não publicam dados completos ou os publicam com atraso.
              </li>
              <li>
                Verbas indenizatórias podem incluir itens legalmente excluídos do teto,
                como auxílio-mudança. O debate jurídico sobre quais verbas contam para o
                teto ainda está em andamento.
              </li>
            </ul>
          </section>

          <section>
            <h2 className="font-serif text-xl font-bold text-foreground">Base Legal</h2>
            <ul className="mt-2 list-disc space-y-2 pl-5">
              <li>
                Constituição Federal, Art. 37, XI — Teto remuneratório
              </li>
              <li>
                Lei 12.527/2011 — Lei de Acesso à Informação
              </li>
              <li>
                ARE 652777/SP (STF) — Legitimidade da publicação nominal de remunerações
              </li>
              <li>
                Resolução CNJ nº 215/2015 — Publicidade das remunerações de magistrados
              </li>
            </ul>
          </section>
        </div>
      </div>
      <Footer />
    </div>
  );
}
