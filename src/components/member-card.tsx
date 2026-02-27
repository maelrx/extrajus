"use client";

import { useState, useRef, useEffect } from "react";
import Link from "next/link";
import { motion, AnimatePresence } from "framer-motion";
import { ChevronDown, Copy, Share2, AlertTriangle, Loader2, ExternalLink } from "lucide-react";
import type { Member, MonthlyRecord } from "@/data/mock-data";
import { TETO_CONSTITUCIONAL } from "@/lib/constants";
import { formatCurrency, formatCurrencyFull, formatPercent, memberUrl } from "@/lib/utils";
import { SalaryBar } from "./salary-bar";
import { TemporalChart } from "./temporal-chart";

interface MemberCardProps {
  member: Member;
  rank: number;
  isExpanded: boolean;
  onToggle: () => void;
}

function RankBadge({ rank }: { rank: number }) {
  if (rank === 1) {
    return (
      <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-gradient-to-br from-amber-300 to-amber-500 text-xs font-bold text-white shadow-md">
        #1
      </div>
    );
  }
  if (rank === 2) {
    return (
      <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-gradient-to-br from-gray-300 to-gray-400 text-xs font-bold text-white shadow-sm">
        #2
      </div>
    );
  }
  if (rank === 3) {
    return (
      <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-gradient-to-br from-orange-300 to-orange-500 text-xs font-bold text-white shadow-sm">
        #3
      </div>
    );
  }
  return (
    <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-gray-100 text-xs font-bold text-gray-400">
      #{rank}
    </div>
  );
}

export function MemberCard({ member, rank, isExpanded, onToggle }: MemberCardProps) {
  const [copied, setCopied] = useState(false);
  const [historico, setHistorico] = useState<MonthlyRecord[]>(member.historico);
  const [loadingHistory, setLoadingHistory] = useState(false);
  const cardRef = useRef<HTMLDivElement>(null);

  // Fetch history when expanded
  useEffect(() => {
    if (isExpanded && historico.length === 0 && !loadingHistory) {
      setLoadingHistory(true);
      fetch(`/api/v1/membros/historico?nome=${encodeURIComponent(member.nome)}&orgao=${encodeURIComponent(member.orgao)}`)
        .then((r) => r.json())
        .then((res) => {
          if (res.data) setHistorico(res.data);
        })
        .catch(() => {})
        .finally(() => setLoadingHistory(false));
    }
  }, [isExpanded, historico.length, loadingHistory, member.nome, member.orgao]);

  // Check for spike months (>2x their average)
  const avgTotal =
    historico.length > 0
      ? historico.reduce((acc, h) => acc + h.remuneracaoTotal, 0) / historico.length
      : 0;
  const hasSpikeMonths = historico.some((h) => h.remuneracaoTotal > avgTotal * 2);

  async function handleCopy() {
    const text = `${member.nome} — ${member.cargo} (${member.orgao})\nRemuneração Total: ${formatCurrencyFull(member.remuneracaoTotal)}\nAcima do Teto: ${formatCurrencyFull(member.acimaTeto)} (+${formatPercent(member.percentualAcimaTeto)})\nFonte: ExtraTeto / DadosJusBr`;
    await navigator.clipboard.writeText(text);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  }

  async function handleShare() {
    const text = `${member.nome} recebe ${formatCurrency(member.remuneracaoTotal)}/mês como ${member.cargo} no ${member.orgao}. Isso é ${formatCurrency(member.acimaTeto)} acima do teto constitucional. Veja mais em ExtraTeto.`;
    if (navigator.share) {
      try {
        await navigator.share({ text, title: `ExtraTeto — ${member.nome}` });
      } catch {
        // User cancelled
      }
    } else {
      await navigator.clipboard.writeText(text);
    }
  }

  // Scroll expanded card into view
  useEffect(() => {
    if (isExpanded && cardRef.current) {
      setTimeout(() => {
        cardRef.current?.scrollIntoView({ behavior: "smooth", block: "nearest" });
      }, 100);
    }
  }, [isExpanded]);

  const isTop3 = rank <= 3;
  const isFirst = rank === 1;

  return (
    <div
      ref={cardRef}
      className={`group relative overflow-hidden rounded-xl border bg-white transition-all duration-200 hover:-translate-y-0.5 hover:shadow-lg ${
        isFirst
          ? "border-2 border-amber-400 shadow-md shadow-amber-100"
          : "border-gray-100 shadow-sm"
      }`}
    >
      {/* Main content */}
      <button
        onClick={onToggle}
        className="w-full px-4 py-3 text-left sm:px-5 sm:py-4"
      >
        <div className="flex flex-col gap-2 sm:flex-row sm:items-start sm:gap-3">
          {/* Rank + Info */}
          <div className="flex items-start gap-2.5 sm:flex-1">
            <RankBadge rank={rank} />
            <div className="min-w-0 flex-1">
              <div className="flex items-center gap-2">
                <h3 className={`truncate font-bold text-navy ${isTop3 ? "text-sm sm:text-base" : "text-sm"}`}>
                  {member.nome}
                </h3>
                {member.remuneracaoBase === 0 && (
                  <span
                    title="Remuneração base informada como R$ 0,00 no DadosJusBr"
                    className="flex items-center gap-0.5 rounded bg-amber-100 px-1.5 py-0.5 text-[9px] font-semibold text-amber-700"
                  >
                    <AlertTriangle className="h-2.5 w-2.5" />
                    Base R$ 0
                  </span>
                )}
                {hasSpikeMonths && (
                  <span title="Mês com pico de pagamento detectado">
                    <AlertTriangle className="h-3 w-3 shrink-0 text-amber-500" />
                  </span>
                )}
              </div>
              <div className="mt-0.5 flex flex-wrap items-center gap-1.5">
                <span className="rounded bg-gray-100 px-1.5 py-0.5 text-[10px] font-medium text-gray-600">
                  {member.cargo}
                </span>
                <span className="text-[11px] text-gray-400">
                  {member.orgao} &middot; {member.estado}
                </span>
              </div>
            </div>
          </div>

          {/* Remuneration summary */}
          <div className="flex items-center gap-3 sm:shrink-0 sm:text-right">
            <div>
              <p className={`font-bold text-navy ${isTop3 ? "text-lg sm:text-xl" : "text-base sm:text-lg"}`}>
                {formatCurrency(member.remuneracaoTotal)}
              </p>
              {member.acimaTeto > 0 && (
                <p className={`font-semibold text-red-primary ${isTop3 ? "text-xs" : "text-[11px]"}`}>
                  +{formatCurrency(member.acimaTeto)} acima do teto ({formatPercent(member.percentualAcimaTeto)})
                </p>
              )}
              {member.acimaTeto === 0 && (
                <p className="text-[11px] font-semibold text-green-accent">
                  Dentro do teto
                </p>
              )}
            </div>
            <ChevronDown
              className={`h-4 w-4 shrink-0 text-gray-300 transition-transform ${
                isExpanded ? "rotate-180" : ""
              }`}
            />
          </div>
        </div>

        {/* Salary bar */}
        <div className="mt-3">
          <SalaryBar
            remuneracaoBase={member.remuneracaoBase}
            verbasIndenizatorias={member.verbasIndenizatorias}
            direitosEventuais={member.direitosEventuais}
            direitosPessoais={member.direitosPessoais}
            remuneracaoTotal={member.remuneracaoTotal}
          />
        </div>
      </button>

      {/* Expanded details */}
      <AnimatePresence>
        {isExpanded && (
          <motion.div
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: "auto", opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            transition={{ duration: 0.3, ease: "easeInOut" }}
            className="overflow-hidden"
          >
            <div className="border-t border-gray-100 bg-gray-50/50 p-5 sm:p-6">
              {/* Breakdown table */}
              <h4 className="mb-3 text-[11px] font-bold uppercase tracking-wider text-gray-400">
                Detalhamento da Remuneração
              </h4>
              <div className="mb-5 overflow-hidden rounded-lg border border-gray-100 bg-white">
                <table className="w-full text-sm">
                  <tbody>
                    <tr className="border-b border-gray-50">
                      <td className="px-4 py-2.5 text-gray-600">Remuneração Base</td>
                      <td className="px-4 py-2.5 text-right font-semibold text-navy">
                        {formatCurrencyFull(member.remuneracaoBase)}
                      </td>
                    </tr>
                    <tr className="border-b border-gray-50">
                      <td className="px-4 py-2.5 text-gray-600">Verbas Indenizatórias</td>
                      <td className="px-4 py-2.5 text-right font-semibold text-red-primary">
                        {formatCurrencyFull(member.verbasIndenizatorias)}
                      </td>
                    </tr>
                    <tr className="border-b border-gray-50">
                      <td className="px-4 py-2.5 text-gray-600">Direitos Eventuais</td>
                      <td className="px-4 py-2.5 text-right font-semibold text-red-primary">
                        {formatCurrencyFull(member.direitosEventuais)}
                      </td>
                    </tr>
                    <tr className="border-b border-gray-50">
                      <td className="px-4 py-2.5 text-gray-600">Direitos Pessoais</td>
                      <td className="px-4 py-2.5 text-right font-semibold text-red-primary">
                        {formatCurrencyFull(member.direitosPessoais)}
                      </td>
                    </tr>
                    <tr className="border-t-2 border-gray-200 bg-gray-50/80">
                      <td className="px-4 py-3 font-bold text-navy">Total</td>
                      <td className="px-4 py-3 text-right font-bold text-navy">
                        {formatCurrencyFull(member.remuneracaoTotal)}
                      </td>
                    </tr>
                    {member.acimaTeto > 0 && (
                      <tr className="bg-red-50/50">
                        <td className="px-4 py-2.5 font-semibold text-red-primary">
                          Acima do Teto (R${formatCurrency(TETO_CONSTITUCIONAL).replace("R$", "").trim()})
                        </td>
                        <td className="px-4 py-2.5 text-right font-bold text-red-primary">
                          +{formatCurrencyFull(member.acimaTeto)}
                        </td>
                      </tr>
                    )}
                  </tbody>
                </table>
              </div>

              {/* Temporal chart */}
              {loadingHistory && (
                <div className="mt-4 flex items-center gap-2 text-xs text-gray-400">
                  <Loader2 className="h-4 w-4 animate-spin" />
                  Carregando evolução mensal...
                </div>
              )}
              {historico.length > 0 && (
                <TemporalChart historico={historico} nome={member.nome} />
              )}
              {!loadingHistory && historico.length === 0 && (
                <p className="mt-4 text-xs text-gray-400">
                  Sem dados históricos disponíveis.
                </p>
              )}

              {/* Actions */}
              <div className="mt-5 flex items-center gap-2">
                <Link
                  href={memberUrl(member.orgao, member.nome)}
                  onClick={(e) => e.stopPropagation()}
                  className="flex items-center gap-1.5 rounded-lg border border-red-200 bg-red-50 px-3 py-2 text-xs font-medium text-red-primary shadow-sm transition-all hover:border-red-300 hover:bg-red-100 hover:shadow-md active:scale-[0.98]"
                >
                  <ExternalLink className="h-3.5 w-3.5" />
                  Ver perfil completo
                </Link>
                <button
                  onClick={(e) => {
                    e.stopPropagation();
                    handleCopy();
                  }}
                  className="flex items-center gap-1.5 rounded-lg border border-gray-200 bg-white px-3 py-2 text-xs font-medium text-gray-600 shadow-sm transition-all hover:border-gray-300 hover:shadow-md active:scale-[0.98]"
                >
                  <Copy className="h-3.5 w-3.5" />
                  {copied ? "Copiado!" : "Copiar dados"}
                </button>
                <button
                  onClick={(e) => {
                    e.stopPropagation();
                    handleShare();
                  }}
                  className="flex items-center gap-1.5 rounded-lg border border-gray-200 bg-white px-3 py-2 text-xs font-medium text-gray-600 shadow-sm transition-all hover:border-gray-300 hover:shadow-md active:scale-[0.98]"
                >
                  <Share2 className="h-3.5 w-3.5" />
                  Compartilhar
                </button>
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
