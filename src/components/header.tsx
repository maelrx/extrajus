"use client";

import { SearchBar } from "./search-bar";

interface HeaderProps {
  onSearch: (query: string) => void;
  onSelectMember: (id: number) => void;
  dataMonth?: string;
}

export function Header({ onSearch, onSelectMember, dataMonth }: HeaderProps) {
  return (
    <header className="sticky top-0 z-30 border-b border-gray-100 bg-white/95 backdrop-blur-sm">
      <div className="flex items-center justify-between gap-4 px-4 py-3 sm:px-6 lg:px-8">
        {/* Search */}
        <div className="flex flex-1">
          <SearchBar
            onSearch={onSearch}
            onSelectMember={onSelectMember}
          />
        </div>

        {/* Status badges */}
        <div className="hidden shrink-0 items-center gap-2 text-[11px] text-gray-500 sm:flex">
          <span className="rounded-full border border-gray-100 bg-gray-50 px-3 py-1 font-medium">
            📅 {dataMonth || "Jun/2025"}
          </span>
          <span className="rounded-full border border-gray-100 bg-gray-50 px-3 py-1 font-medium">
            DadosJusBr / CNJ
          </span>
        </div>
      </div>
    </header>
  );
}
