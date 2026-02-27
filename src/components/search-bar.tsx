"use client";

import { useState, useRef, useEffect, useCallback } from "react";
import { useRouter } from "next/navigation";
import { Search, X } from "lucide-react";
import { formatCurrency, memberUrl } from "@/lib/utils";

interface SearchResult {
  id: number;
  nome: string;
  cargo: string;
  orgao: string;
  estado: string;
  remuneracaoTotal: number;
}

interface SearchBarProps {
  onSearch: (query: string) => void;
  onSelectMember: (id: number) => void;
}

export function SearchBar({ onSearch, onSelectMember }: SearchBarProps) {
  const router = useRouter();
  const [query, setQuery] = useState("");
  const [suggestions, setSuggestions] = useState<SearchResult[]>([]);
  const [isOpen, setIsOpen] = useState(false);
  const [selectedIndex, setSelectedIndex] = useState(-1);
  const inputRef = useRef<HTMLInputElement>(null);
  const containerRef = useRef<HTMLDivElement>(null);
  const abortRef = useRef<AbortController | null>(null);

  const fetchSuggestions = useCallback(async (value: string) => {
    if (value.length < 2) {
      setSuggestions([]);
      setIsOpen(false);
      return;
    }

    // Cancel previous request
    abortRef.current?.abort();
    const controller = new AbortController();
    abortRef.current = controller;

    try {
      const res = await fetch(
        `/api/search?q=${encodeURIComponent(value)}`,
        { signal: controller.signal }
      );
      if (!res.ok) return;
      const data: SearchResult[] = await res.json();
      setSuggestions(data);
      setIsOpen(data.length > 0);
    } catch {
      // Aborted or network error — ignore
    }
  }, []);

  const handleSearch = useCallback(
    (value: string) => {
      setQuery(value);
      setSelectedIndex(-1);
      fetchSuggestions(value);
    },
    [fetchSuggestions]
  );

  // Debounced search for filtering the main list
  useEffect(() => {
    const timer = setTimeout(() => {
      onSearch(query);
    }, 300);
    return () => clearTimeout(timer);
  }, [query, onSearch]);

  // Close dropdown on outside click
  useEffect(() => {
    function handleClickOutside(e: MouseEvent) {
      if (
        containerRef.current &&
        !containerRef.current.contains(e.target as Node)
      ) {
        setIsOpen(false);
      }
    }
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  function handleKeyDown(e: React.KeyboardEvent) {
    if (!isOpen) return;

    if (e.key === "ArrowDown") {
      e.preventDefault();
      setSelectedIndex((prev) =>
        Math.min(prev + 1, suggestions.length - 1)
      );
    } else if (e.key === "ArrowUp") {
      e.preventDefault();
      setSelectedIndex((prev) => Math.max(prev - 1, -1));
    } else if (e.key === "Enter" && selectedIndex >= 0) {
      e.preventDefault();
      const s = suggestions[selectedIndex];
      router.push(memberUrl(s.orgao, s.nome));
      setIsOpen(false);
    } else if (e.key === "Escape") {
      setIsOpen(false);
    }
  }

  return (
    <div ref={containerRef} className="relative w-full max-w-xl">
      <div className="relative">
        <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-gray-400" />
        <input
          ref={inputRef}
          type="text"
          value={query}
          onChange={(e) => handleSearch(e.target.value)}
          onKeyDown={handleKeyDown}
          onFocus={() => {
            if (suggestions.length > 0) setIsOpen(true);
          }}
          placeholder="Buscar por nome, tribunal ou cargo..."
          className="w-full rounded-lg border border-gray-200 bg-surface py-2.5 pl-10 pr-10 text-sm text-navy placeholder-gray-400 transition-colors focus:border-navy focus:outline-none focus:ring-1 focus:ring-navy/20"
        />
        {query && (
          <button
            onClick={() => {
              setQuery("");
              setSuggestions([]);
              setIsOpen(false);
              onSearch("");
              inputRef.current?.focus();
            }}
            className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600"
          >
            <X className="h-4 w-4" />
          </button>
        )}
      </div>

      {/* Autocomplete dropdown */}
      {isOpen && suggestions.length > 0 && (
        <div className="absolute top-full z-50 mt-1 w-full rounded-lg border border-gray-200 bg-white shadow-lg">
          {suggestions.map((member, index) => (
            <a
              key={member.id}
              href={memberUrl(member.orgao, member.nome)}
              onClick={(e) => {
                e.preventDefault();
                router.push(memberUrl(member.orgao, member.nome));
                setIsOpen(false);
              }}
              className={`flex w-full items-center justify-between px-4 py-2.5 text-left text-sm transition-colors first:rounded-t-lg last:rounded-b-lg ${
                index === selectedIndex ? "bg-surface" : "hover:bg-gray-50"
              }`}
            >
              <div>
                <span className="font-medium text-navy">{member.nome}</span>
                <span className="ml-2 text-xs text-gray-500">
                  {member.cargo} &middot; {member.orgao}
                </span>
              </div>
              <span className="text-xs font-medium text-red-primary">
                {formatCurrency(member.remuneracaoTotal)}
              </span>
            </a>
          ))}
        </div>
      )}
    </div>
  );
}
