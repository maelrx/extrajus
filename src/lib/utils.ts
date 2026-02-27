import { clsx, type ClassValue } from "clsx";
import { twMerge } from "tailwind-merge";

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

export function formatCurrency(value: number): string {
  return new Intl.NumberFormat("pt-BR", {
    style: "currency",
    currency: "BRL",
    minimumFractionDigits: 0,
    maximumFractionDigits: 0,
  }).format(value);
}

export function formatCurrencyFull(value: number): string {
  return new Intl.NumberFormat("pt-BR", {
    style: "currency",
    currency: "BRL",
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  }).format(value);
}

export function formatPercent(value: number): string {
  return `${value.toFixed(1)}%`;
}

export function formatNumber(value: number): string {
  return new Intl.NumberFormat("pt-BR").format(value);
}

export function formatCompactCurrency(value: number): string {
  if (value >= 1_000_000_000) {
    return `R$${(value / 1_000_000_000).toFixed(1)} bi`;
  }
  if (value >= 1_000_000) {
    return `R$${(value / 1_000_000).toFixed(1)} mi`;
  }
  if (value >= 1_000) {
    return `R$${(value / 1_000).toFixed(0)} mil`;
  }
  return formatCurrency(value);
}

export function removeAccents(str: string): string {
  return str.normalize("NFD").replace(/[\u0300-\u036f]/g, "");
}

export function slugify(name: string): string {
  return removeAccents(name)
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-|-$/g, "");
}

export function memberUrl(orgao: string, nome: string): string {
  const orgaoSlug = slugify(orgao);
  const nomeSlug = slugify(nome);
  return `/membro/${orgaoSlug}/${nomeSlug}`;
}
