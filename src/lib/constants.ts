export const TETO_CONSTITUCIONAL = 46366.19;
export const TETO_2024 = 44008.52;
export const SALARIO_MINIMO = 1518.0;

export const ESTADOS = [
  { sigla: "AC", nome: "Acre" },
  { sigla: "AL", nome: "Alagoas" },
  { sigla: "AM", nome: "Amazonas" },
  { sigla: "AP", nome: "Amapá" },
  { sigla: "BA", nome: "Bahia" },
  { sigla: "CE", nome: "Ceará" },
  { sigla: "DF", nome: "Distrito Federal" },
  { sigla: "ES", nome: "Espírito Santo" },
  { sigla: "GO", nome: "Goiás" },
  { sigla: "MA", nome: "Maranhão" },
  { sigla: "MG", nome: "Minas Gerais" },
  { sigla: "MS", nome: "Mato Grosso do Sul" },
  { sigla: "MT", nome: "Mato Grosso" },
  { sigla: "PA", nome: "Pará" },
  { sigla: "PB", nome: "Paraíba" },
  { sigla: "PE", nome: "Pernambuco" },
  { sigla: "PI", nome: "Piauí" },
  { sigla: "PR", nome: "Paraná" },
  { sigla: "RJ", nome: "Rio de Janeiro" },
  { sigla: "RN", nome: "Rio Grande do Norte" },
  { sigla: "RO", nome: "Rondônia" },
  { sigla: "RR", nome: "Roraima" },
  { sigla: "RS", nome: "Rio Grande do Sul" },
  { sigla: "SC", nome: "Santa Catarina" },
  { sigla: "SE", nome: "Sergipe" },
  { sigla: "SP", nome: "São Paulo" },
  { sigla: "TO", nome: "Tocantins" },
] as const;

export const CARGOS = [
  "Juiz(a)",
  "Desembargador(a)",
  "Ministro(a)",
  "Promotor(a)",
  "Procurador(a)",
  "Defensor(a) Público(a)",
] as const;

export type Cargo = (typeof CARGOS)[number];

export const ORGAOS_POR_TIPO = {
  "Tribunais de Justiça": [
    "TJ-AC", "TJ-AL", "TJ-AM", "TJ-AP", "TJ-BA", "TJ-CE", "TJ-DF",
    "TJ-ES", "TJ-GO", "TJ-MA", "TJ-MG", "TJ-MS", "TJ-MT", "TJ-PA",
    "TJ-PB", "TJ-PE", "TJ-PI", "TJ-PR", "TJ-RJ", "TJ-RN", "TJ-RO",
    "TJ-RR", "TJ-RS", "TJ-SC", "TJ-SE", "TJ-SP", "TJ-TO",
  ],
  "Tribunais Regionais Federais": [
    "TRF-1", "TRF-2", "TRF-3", "TRF-4", "TRF-5", "TRF-6",
  ],
  "Tribunais Regionais do Trabalho": [
    "TRT-1", "TRT-2", "TRT-3", "TRT-4", "TRT-5", "TRT-6",
    "TRT-7", "TRT-8", "TRT-9", "TRT-10", "TRT-11", "TRT-12",
    "TRT-13", "TRT-14", "TRT-15", "TRT-18", "TRT-23", "TRT-24",
  ],
  "Tribunais Regionais Eleitorais": [
    "TRE-AC", "TRE-AL", "TRE-AM", "TRE-AP", "TRE-BA", "TRE-CE",
    "TRE-DF", "TRE-ES", "TRE-GO", "TRE-MA", "TRE-MG", "TRE-MS",
    "TRE-MT", "TRE-PA", "TRE-PB", "TRE-PE", "TRE-PI", "TRE-PR",
    "TRE-RJ", "TRE-RN", "TRE-RO", "TRE-RR", "TRE-RS", "TRE-SC",
    "TRE-SE", "TRE-SP", "TRE-TO",
  ],
  "Ministérios Públicos Estaduais": [
    "MP-AC", "MP-AL", "MP-AM", "MP-AP", "MP-BA", "MP-CE",
    "MP-ES", "MP-GO", "MP-MA", "MP-MG", "MP-MS", "MP-MT", "MP-PA",
    "MP-PB", "MP-PE", "MP-PI", "MP-PR", "MP-RJ", "MP-RN", "MP-RO",
    "MP-RR", "MP-RS", "MP-SC", "MP-SE", "MP-SP", "MP-TO",
  ],
  "Ministério Público da União": [
    "MPF", "MPT", "MPM", "MPDFT",
  ],
  "Tribunais Superiores": [
    "STF", "STJ", "TST", "TSE", "STM",
  ],
} as const;

export const ALL_ORGAOS = Object.values(ORGAOS_POR_TIPO).flat();

export const SORT_OPTIONS = [
  { value: "maior_remuneracao", label: "Maior remuneração total" },
  { value: "maior_acima_teto", label: "Maior valor acima do teto" },
  { value: "maior_percentual", label: "Maior % de penduricalhos" },
  { value: "nome_az", label: "Nome A-Z" },
  { value: "orgao", label: "Tribunal" },
] as const;

export type SortOption = (typeof SORT_OPTIONS)[number]["value"];

export const ITEMS_PER_PAGE = 50;
