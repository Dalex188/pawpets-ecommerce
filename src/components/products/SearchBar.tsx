"use client";

import { useRouter, useSearchParams } from "next/navigation";
import { useRef } from "react";

export function SearchBar() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const inputRef = useRef<HTMLInputElement>(null);

  function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    const formData = new FormData(e.currentTarget);
    const q = formData.get("q") as string;

    const next = new URLSearchParams(searchParams.toString());
    next.delete("page");

    if (q?.trim()) {
      next.set("q", q.trim());
    } else {
      next.delete("q");
    }

    const qs = next.toString();
    router.push(`/productos${qs ? `?${qs}` : ""}`);
  }

  return (
    <form onSubmit={handleSubmit} role="search" className="flex gap-2">
      <input
        ref={inputRef}
        type="search"
        name="q"
        defaultValue={searchParams.get("q") ?? ""}
        placeholder="Buscar productos..."
        className="w-full rounded-lg border border-gray-200 bg-gray-50 px-3 py-2 text-sm text-foreground placeholder:text-foreground/40 focus:border-primary focus:outline-none focus:ring-1 focus:ring-primary"
      />
      <button
        type="submit"
        className="flex items-center gap-1.5 rounded-lg bg-primary px-4 py-2 text-sm font-semibold text-white transition-colors hover:bg-primary/90"
      >
        <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
          <path strokeLinecap="round" strokeLinejoin="round" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
        </svg>
        Buscar
      </button>
    </form>
  );
}
