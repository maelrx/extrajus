import Link from "next/link";
import { ArrowLeft } from "lucide-react";
import { Footer } from "@/components/footer";

export default function SobrePage() {
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

        <h1 className="font-serif text-3xl font-bold text-foreground">Sobre o ExtraTeto</h1>

        <div className="mt-8 space-y-6 text-sm leading-relaxed text-foreground">
          <p>
            O <strong>ExtraTeto</strong> é uma ferramenta de fiscalização cidadã que transforma
            dados públicos dispersos sobre remunerações do sistema de Justiça brasileiro em
            informação acessível e compreensível para qualquer pessoa.
          </p>

          <p>
            No Brasil, milhares de juízes, desembargadores, promotores e procuradores recebem
            remunerações mensais que ultrapassam o teto constitucional de R$46.366,19 —
            o equivalente ao salário de um ministro do Supremo Tribunal Federal. Isso acontece
            por meio de &quot;penduricalhos&quot;: verbas indenizatórias, direitos eventuais e
            direitos pessoais que, na prática, multiplicam os vencimentos acima do limite legal.
          </p>

          <p>
            Esses dados são públicos por força da Lei de Acesso à Informação, mas estão espalhados
            em dezenas de sites de tribunais, em formatos diferentes e de difícil acesso para o
            cidadão comum. O ExtraTeto reúne tudo em um só lugar.
          </p>

          <section>
            <h2 className="mt-8 font-serif text-xl font-bold text-foreground">O que NÃO somos</h2>
            <ul className="mt-3 list-disc space-y-2 pl-5">
              <li>Não somos um órgão oficial do governo</li>
              <li>Não fazemos juízo de valor sobre a legalidade das remunerações</li>
              <li>Não produzimos os dados — apenas os organizamos e apresentamos</li>
              <li>Não temos vínculo com partidos políticos ou organizações partidárias</li>
            </ul>
          </section>

          <section>
            <h2 className="mt-8 font-serif text-xl font-bold text-foreground">Créditos</h2>
            <p className="mt-2">
              Este projeto é inspirado e utiliza dados do{" "}
              <a
                href="https://dadosjusbr.org"
                target="_blank"
                rel="noopener noreferrer"
                className="font-medium text-foreground underline hover:text-red-primary"
              >
                DadosJusBr
              </a>
              , um projeto open source mantido por cidadãos e organizações comprometidas
              com a transparência pública.
            </p>
          </section>

          <section>
            <h2 className="mt-8 font-serif text-xl font-bold text-foreground">Contato</h2>
            <p className="mt-2">
              Encontrou um erro nos dados? Tem sugestões? Entre em contato pelo email{" "}
              <strong>contato@extrateto.org</strong>.
            </p>
          </section>
        </div>
      </div>
      <Footer />
    </div>
  );
}
