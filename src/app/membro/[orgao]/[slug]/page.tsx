import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { getMemberProfile } from "@/data/get-members";
import { formatCurrency } from "@/lib/utils";
import { MemberProfileView } from "@/components/member-profile";

interface Props {
  params: Promise<{ orgao: string; slug: string }>;
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { orgao, slug } = await params;
  const member = getMemberProfile(orgao, slug);

  if (!member) {
    return { title: "Membro não encontrado" };
  }

  const description = `${member.nome} — ${member.cargo} no ${member.orgao}. Remuneração total de ${formatCurrency(member.remuneracaoAtual)}, com ${formatCurrency(member.acimaTeto)} acima do teto constitucional.`;

  return {
    title: `${member.nome} — ${member.orgao}`,
    description,
    openGraph: {
      title: `${member.nome} — ${member.orgao} | ExtraTeto`,
      description,
      type: "profile",
    },
    twitter: {
      card: "summary",
      title: `${member.nome} — ${member.orgao} | ExtraTeto`,
      description,
    },
  };
}

export default async function MembroPage({ params }: Props) {
  const { orgao, slug } = await params;
  const member = getMemberProfile(orgao, slug);

  if (!member) notFound();

  return <MemberProfileView member={member} />;
}
