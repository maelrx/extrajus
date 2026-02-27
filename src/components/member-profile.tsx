"use client";

import { useState } from "react";
import Link from "next/link";
import { motion } from "framer-motion";
import {
  ArrowLeft,
  Copy,
  Share2,
  TrendingUp,
  Calendar,
  Award,
  DollarSign,
  AlertTriangle,
  Building2,
  MapPin,
  Briefcase,
} from "lucide-react";
import type { MemberProfile } from "@/data/get-members";
import { TETO_CONSTITUCIONAL, SALARIO_MINIMO } from "@/lib/constants";
import {
  formatCurrency,
  formatCurrencyFull,
  formatPercent,
  formatCompactCurrency,
} from "@/lib/utils";
import { SalaryBar } from "./salary-bar";
import { TemporalChart } from "./temporal-chart";

function formatMonthLabel(mes: string) {
  const [year, month] = mes.split("-");
  const months = [
    "Jan", "Fev", "Mar", "Abr", "Mai", "Jun",
    "Jul", "Ago", "Set", "Out", "Nov", "Dez",
  ];
  return `${months[parseInt(month) - 1]}/${year}`;
}

const fadeUp = {
  hidden: { opacity: 0, y: 20 },
  visible: (i: number) => ({
    opacity: 1,
    y: 0,
    transition: { delay: i * 0.05, duration: 0.4, ease: "easeOut" as const },
  }),
};

export function MemberProfileView({ member }: { member: MemberProfile }) {
  const [copied, setCopied] = useState(false);

  const salariosMinimos = Math.round(member.acimaTeto / SALARIO_MINIMO);
  const salariosMinimosTotal = Math.round(member.totalAcimaTeto / SALARIO_MINIMO);

  async function handleCopy() {
    const text = `${member.nome} — ${member.cargo} (${member.orgao})\nRemuneração Total: ${formatCurrencyFull(member.remuneracaoAtual)}\nAcima do Teto: ${formatCurrencyFull(member.acimaTeto)} (+${formatPercent(member.percentualAcimaTeto)})\nTotal acumulado acima do teto: ${formatCurrencyFull(member.totalAcimaTeto)}\nFonte: ExtraTeto / DadosJusBr`;
    await navigator.clipboard.writeText(text);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  }

  async function handleShare() {
    const text = `${member.nome} recebe ${formatCurrency(member.remuneracaoAtual)}/mês como ${member.cargo} no ${member.orgao}. Isso é ${formatCurrency(member.acimaTeto)} acima do teto constitucional (+${formatPercent(member.percentualAcimaTeto)}). No total, já recebeu ${formatCurrency(member.totalAcimaTeto)} acima do teto. Veja mais em ExtraTeto.`;
    if (navigator.share) {
      try {
        await navigator.share({ text, title: `ExtraTeto — ${member.nome}` });
      } catch { /* cancelled */ }
    } else {
      await navigator.clipboard.writeText(text);
    }
  }

  return (
    <div className="min-h-screen bg-gray-50/30">
      <div className="mx-auto max-w-4xl px-4 py-6 sm:px-6 sm:py-8">
        {/* Back */}
        <Link
          href="/"
          className="mb-6 inline-flex items-center gap-1.5 text-sm font-medium text-gray-500 transition-colors hover:text-navy"
        >
          <ArrowLeft className="h-4 w-4" />
          Voltar ao ranking
        </Link>

        {/* Header card */}
        <motion.div
          initial="hidden"
          animate="visible"
          custom={0}
          variants={fadeUp}
          className="mb-6 overflow-hidden rounded-2xl border border-gray-100 bg-white shadow-sm"
        >
          <div className="border-b border-gray-50 bg-gradient-to-r from-navy/5 to-transparent px-5 py-5 sm:px-8 sm:py-6">
            <div className="flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
              <div>
                <h1 className="font-serif text-xl font-bold text-navy sm:text-2xl">
                  {member.nome}
                </h1>
                <div className="mt-2 flex flex-wrap items-center gap-2">
                  <span className="inline-flex items-center gap-1 rounded-full bg-gray-100 px-2.5 py-1 text-xs font-medium text-gray-700">
                    <Briefcase className="h-3 w-3 text-gray-400" />
                    {member.cargo}
                  </span>
                  <span className="inline-flex items-center gap-1 rounded-full bg-gray-100 px-2.5 py-1 text-xs font-medium text-gray-700">
                    <Building2 className="h-3 w-3 text-gray-400" />
                    {member.orgao}
                  </span>
                  <span className="inline-flex items-center gap-1 rounded-full bg-gray-100 px-2.5 py-1 text-xs font-medium text-gray-700">
                    <MapPin className="h-3 w-3 text-gray-400" />
                    {member.estado}
                  </span>
                </div>
              </div>

              <div className="flex items-center gap-4">
                {member.rankNoOrgao > 0 && (
                  <div className="text-center">
                    <div className={`flex h-12 w-12 items-center justify-center rounded-full text-sm font-bold text-white shadow ${
                      member.rankNoOrgao === 1
                        ? "bg-gradient-to-br from-amber-300 to-amber-500"
                        : member.rankNoOrgao <= 3
                          ? "bg-gradient-to-br from-gray-300 to-gray-500"
                          : "bg-gray-400"
                    }`}>
                      #{member.rankNoOrgao}
                    </div>
                    <p className="mt-1 text-[10px] font-medium text-gray-400">
                      de {member.totalNoOrgao}
                    </p>
                  </div>
                )}
              </div>
            </div>
          </div>

          {/* Current month */}
          <div className="px-5 py-5 sm:px-8 sm:py-6">
            <div className="mb-1 flex items-center gap-2">
              <p className="text-[11px] font-semibold uppercase tracking-wider text-gray-400">
                Remuneração em {formatMonthLabel(member.mesRecente)}
              </p>
              {member.remuneracaoBase === 0 && (
                <span className="inline-flex items-center gap-0.5 rounded bg-amber-100 px-1.5 py-0.5 text-[9px] font-semibold text-amber-700">
                  <AlertTriangle className="h-2.5 w-2.5" />
                  Base R$ 0
                </span>
              )}
            </div>
            <div className="flex flex-col gap-1 sm:flex-row sm:items-baseline sm:gap-3">
              <p className="text-3xl font-bold text-navy sm:text-4xl">
                {formatCurrency(member.remuneracaoAtual)}
              </p>
              {member.acimaTeto > 0 && (
                <p className="text-base font-semibold text-red-primary sm:text-lg">
                  +{formatCurrency(member.acimaTeto)} acima do teto
                  <span className="ml-1 text-sm">
                    ({formatPercent(member.percentualAcimaTeto)})
                  </span>
                </p>
              )}
            </div>

            <div className="mt-4">
              <SalaryBar
                remuneracaoBase={member.remuneracaoBase}
                verbasIndenizatorias={member.verbasIndenizatorias}
                direitosEventuais={member.direitosEventuais}
                direitosPessoais={member.direitosPessoais}
                remuneracaoTotal={member.remuneracaoAtual}
              />
            </div>
          </div>
        </motion.div>

        {/* KPI cards */}
        <div className="mb-6 grid grid-cols-2 gap-3 sm:grid-cols-4">
          <motion.div
            initial="hidden" animate="visible" custom={1} variants={fadeUp}
            className="rounded-xl border border-gray-100 bg-white p-4 shadow-sm"
          >
            <div className="mb-2 flex h-8 w-8 items-center justify-center rounded-lg bg-red-50">
              <DollarSign className="h-4 w-4 text-red-primary" />
            </div>
            <p className="text-[10px] font-semibold uppercase tracking-wider text-gray-400">
              Total acima do teto
            </p>
            <p className="mt-1 text-lg font-bold text-red-primary">
              {formatCompactCurrency(member.totalAcimaTeto)}
            </p>
            <p className="text-[10px] text-gray-400">
              em {member.mesesComDados} {member.mesesComDados === 1 ? "mês" : "meses"}
            </p>
          </motion.div>

          <motion.div
            initial="hidden" animate="visible" custom={2} variants={fadeUp}
            className="rounded-xl border border-gray-100 bg-white p-4 shadow-sm"
          >
            <div className="mb-2 flex h-8 w-8 items-center justify-center rounded-lg bg-blue-50">
              <TrendingUp className="h-4 w-4 text-blue-500" />
            </div>
            <p className="text-[10px] font-semibold uppercase tracking-wider text-gray-400">
              Média mensal
            </p>
            <p className="mt-1 text-lg font-bold text-navy">
              {formatCurrency(member.mediaTotal)}
            </p>
            <p className="text-[10px] text-gray-400">
              remuneração total
            </p>
          </motion.div>

          <motion.div
            initial="hidden" animate="visible" custom={3} variants={fadeUp}
            className="rounded-xl border border-gray-100 bg-white p-4 shadow-sm"
          >
            <div className="mb-2 flex h-8 w-8 items-center justify-center rounded-lg bg-amber-50">
              <Award className="h-4 w-4 text-amber-500" />
            </div>
            <p className="text-[10px] font-semibold uppercase tracking-wider text-gray-400">
              Mês de pico
            </p>
            <p className="mt-1 text-lg font-bold text-navy">
              {formatCurrency(member.valorPico)}
            </p>
            <p className="text-[10px] text-gray-400">
              em {formatMonthLabel(member.mesPico)}
            </p>
          </motion.div>

          <motion.div
            initial="hidden" animate="visible" custom={4} variants={fadeUp}
            className="rounded-xl border border-gray-100 bg-white p-4 shadow-sm"
          >
            <div className="mb-2 flex h-8 w-8 items-center justify-center rounded-lg bg-purple-50">
              <Calendar className="h-4 w-4 text-purple-500" />
            </div>
            <p className="text-[10px] font-semibold uppercase tracking-wider text-gray-400">
              Salários mínimos
            </p>
            <p className="mt-1 text-lg font-bold text-navy">
              {salariosMinimos}x
            </p>
            <p className="text-[10px] text-gray-400">
              acima do teto/mês
            </p>
          </motion.div>
        </div>

        {/* Salary comparison context */}
        {member.acimaTeto > 0 && (
          <motion.div
            initial="hidden" animate="visible" custom={5} variants={fadeUp}
            className="mb-6 rounded-xl border border-amber-100 bg-amber-50/50 p-4 sm:p-5"
          >
            <h3 className="mb-2 text-xs font-bold uppercase tracking-wider text-amber-700">
              Para contextualizar
            </h3>
            <div className="grid grid-cols-1 gap-3 text-sm text-amber-900 sm:grid-cols-2">
              <p>
                Somente o valor <strong>acima do teto</strong> deste mês
                ({formatCurrency(member.acimaTeto)}) equivale a{" "}
                <strong>{salariosMinimos} salários mínimos</strong>.
              </p>
              <p>
                No total acumulado, este membro já recebeu{" "}
                <strong>{formatCurrency(member.totalAcimaTeto)}</strong> acima
                do teto constitucional — o equivalente a{" "}
                <strong>{salariosMinimosTotal.toLocaleString("pt-BR")} salários mínimos</strong>.
              </p>
            </div>
          </motion.div>
        )}

        {/* Breakdown table */}
        <motion.div
          initial="hidden" animate="visible" custom={6} variants={fadeUp}
          className="mb-6 overflow-hidden rounded-xl border border-gray-100 bg-white shadow-sm"
        >
          <div className="border-b border-gray-50 px-5 py-4">
            <h2 className="text-sm font-bold text-navy">
              Detalhamento da Remuneração — {formatMonthLabel(member.mesRecente)}
            </h2>
          </div>
          <table className="w-full text-sm">
            <tbody>
              <tr className="border-b border-gray-50">
                <td className="px-5 py-3 text-gray-600">Remuneração Base</td>
                <td className="px-5 py-3 text-right font-semibold text-navy">
                  {formatCurrencyFull(member.remuneracaoBase)}
                </td>
              </tr>
              <tr className="border-b border-gray-50">
                <td className="px-5 py-3 text-gray-600">Verbas Indenizatórias</td>
                <td className="px-5 py-3 text-right font-semibold text-red-primary">
                  {formatCurrencyFull(member.verbasIndenizatorias)}
                </td>
              </tr>
              <tr className="border-b border-gray-50">
                <td className="px-5 py-3 text-gray-600">Direitos Eventuais</td>
                <td className="px-5 py-3 text-right font-semibold text-red-primary">
                  {formatCurrencyFull(member.direitosEventuais)}
                </td>
              </tr>
              <tr className="border-b border-gray-50">
                <td className="px-5 py-3 text-gray-600">Direitos Pessoais</td>
                <td className="px-5 py-3 text-right font-semibold text-red-primary">
                  {formatCurrencyFull(member.direitosPessoais)}
                </td>
              </tr>
              <tr className="border-t-2 border-gray-200 bg-gray-50/80">
                <td className="px-5 py-3.5 font-bold text-navy">Total</td>
                <td className="px-5 py-3.5 text-right font-bold text-navy">
                  {formatCurrencyFull(member.remuneracaoAtual)}
                </td>
              </tr>
              {member.acimaTeto > 0 && (
                <tr className="bg-red-50/50">
                  <td className="px-5 py-3 font-semibold text-red-primary">
                    Acima do Teto (R$ {TETO_CONSTITUCIONAL.toLocaleString("pt-BR", { minimumFractionDigits: 2 })})
                  </td>
                  <td className="px-5 py-3 text-right font-bold text-red-primary">
                    +{formatCurrencyFull(member.acimaTeto)}
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </motion.div>

        {/* Temporal chart */}
        {member.historico.length > 1 && (
          <motion.div
            initial="hidden" animate="visible" custom={7} variants={fadeUp}
            className="mb-6 overflow-hidden rounded-xl border border-gray-100 bg-white p-5 shadow-sm sm:p-6"
          >
            <TemporalChart historico={member.historico} nome={member.nome} />
          </motion.div>
        )}

        {/* Monthly history table */}
        {member.historico.length > 1 && (
          <motion.div
            initial="hidden" animate="visible" custom={8} variants={fadeUp}
            className="mb-6 overflow-hidden rounded-xl border border-gray-100 bg-white shadow-sm"
          >
            <div className="border-b border-gray-50 px-5 py-4">
              <h2 className="text-sm font-bold text-navy">
                Histórico Mensal Completo
              </h2>
            </div>
            <div className="overflow-x-auto">
              <table className="w-full text-xs sm:text-sm">
                <thead>
                  <tr className="border-b border-gray-100 bg-gray-50/50">
                    <th className="px-4 py-2.5 text-left font-semibold text-gray-500">Mês</th>
                    <th className="px-4 py-2.5 text-right font-semibold text-gray-500">Base</th>
                    <th className="px-4 py-2.5 text-right font-semibold text-gray-500">Verbas</th>
                    <th className="px-4 py-2.5 text-right font-semibold text-gray-500">Eventuais</th>
                    <th className="px-4 py-2.5 text-right font-semibold text-gray-500">Pessoais</th>
                    <th className="px-4 py-2.5 text-right font-semibold text-gray-500">Total</th>
                    <th className="px-4 py-2.5 text-right font-semibold text-red-primary">Acima do teto</th>
                  </tr>
                </thead>
                <tbody>
                  {[...member.historico].reverse().map((h, i) => (
                    <tr
                      key={h.mes}
                      className={`border-b border-gray-50 ${i % 2 === 0 ? "" : "bg-gray-50/30"}`}
                    >
                      <td className="whitespace-nowrap px-4 py-2.5 font-medium text-navy">
                        {formatMonthLabel(h.mes)}
                      </td>
                      <td className="px-4 py-2.5 text-right text-gray-600">
                        {formatCurrency(h.remuneracaoBase)}
                      </td>
                      <td className="px-4 py-2.5 text-right text-gray-600">
                        {formatCurrency(h.verbasIndenizatorias)}
                      </td>
                      <td className="px-4 py-2.5 text-right text-gray-600">
                        {formatCurrency(h.direitosEventuais)}
                      </td>
                      <td className="px-4 py-2.5 text-right text-gray-600">
                        {formatCurrency(h.direitosPessoais)}
                      </td>
                      <td className="px-4 py-2.5 text-right font-semibold text-navy">
                        {formatCurrency(h.remuneracaoTotal)}
                      </td>
                      <td className={`px-4 py-2.5 text-right font-semibold ${h.acimaTeto > 0 ? "text-red-primary" : "text-green-600"}`}>
                        {h.acimaTeto > 0
                          ? `+${formatCurrency(h.acimaTeto)}`
                          : "—"}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </motion.div>
        )}

        {/* Actions */}
        <motion.div
          initial="hidden" animate="visible" custom={9} variants={fadeUp}
          className="flex flex-wrap items-center gap-3"
        >
          <button
            onClick={handleCopy}
            className="flex items-center gap-1.5 rounded-lg border border-gray-200 bg-white px-4 py-2.5 text-sm font-medium text-gray-600 shadow-sm transition-all hover:border-gray-300 hover:shadow-md active:scale-[0.98]"
          >
            <Copy className="h-4 w-4" />
            {copied ? "Copiado!" : "Copiar dados"}
          </button>
          <button
            onClick={handleShare}
            className="flex items-center gap-1.5 rounded-lg border border-gray-200 bg-white px-4 py-2.5 text-sm font-medium text-gray-600 shadow-sm transition-all hover:border-gray-300 hover:shadow-md active:scale-[0.98]"
          >
            <Share2 className="h-4 w-4" />
            Compartilhar
          </button>
          <Link
            href={`/?orgao=${encodeURIComponent(member.orgao)}`}
            className="flex items-center gap-1.5 rounded-lg border border-gray-200 bg-white px-4 py-2.5 text-sm font-medium text-gray-600 shadow-sm transition-all hover:border-gray-300 hover:shadow-md active:scale-[0.98]"
          >
            <Building2 className="h-4 w-4" />
            Ver todos do {member.orgao}
          </Link>
        </motion.div>

        {/* Source */}
        <p className="mt-8 text-center text-[11px] text-gray-400">
          Dados públicos obtidos via{" "}
          <a
            href="https://dadosjusbr.org"
            target="_blank"
            rel="noopener noreferrer"
            className="underline hover:text-gray-600"
          >
            DadosJusBr
          </a>{" "}
          · Referência: {formatMonthLabel(member.mesRecente)}
        </p>
      </div>
    </div>
  );
}
