import Link from "next/link";
import { Suspense } from "react";
import { NavbarMobile } from "./NavbarMobile";
import { SearchBar } from "@/components/products/SearchBar";

export function Navbar() {
  return (
    <header className="sticky top-0 z-30 bg-white shadow">
      <div className="mx-auto flex h-16 max-w-7xl items-center justify-between px-4 sm:px-6 lg:px-8">
        {/* Logo */}
        <Link href="/" className="flex items-center gap-1 text-2xl font-extrabold tracking-tight">
          <span className="text-secondary">PAW</span>
          <span className="text-accent">PETS</span>
        </Link>

        {/* Desktop navigation */}
        <nav className="hidden items-center gap-8 md:flex">
          <Link
            href="/"
            className="text-sm font-semibold text-foreground/70 transition-colors hover:text-primary"
          >
            Inicio
          </Link>
          <Link
            href="/productos"
            className="text-sm font-semibold text-foreground/70 transition-colors hover:text-primary"
          >
            Productos
          </Link>
          <Link
            href="/productos?categoria=perros"
            className="text-sm font-semibold text-foreground/70 transition-colors hover:text-primary"
          >
            Perros
          </Link>
          <Link
            href="/productos?categoria=gatos"
            className="text-sm font-semibold text-foreground/70 transition-colors hover:text-primary"
          >
            Gatos
          </Link>
          <Link
            href="/productos?categoria=aves"
            className="text-sm font-semibold text-foreground/70 transition-colors hover:text-primary"
          >
            Aves
          </Link>
        </nav>

        {/* Right section */}
        <div className="flex items-center gap-4">
          {/* Search — using SearchBar component wrapped in Suspense */}
          <div className="hidden items-center sm:flex">
            <Suspense fallback={null}>
              <SearchBar />
            </Suspense>
          </div>

          {/* Cart icon */}
          <button
            type="button"
            className="relative rounded-md p-2 text-foreground/70 hover:bg-gray-100 hover:text-primary"
            aria-label="Carrito de compras"
          >
            <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                d="M3 3h2l.4 2M7 13h10l4-8H5.4M7 13L5.4 5M7 13l-2.293 2.293c-.63.63-.184 1.707.707 1.707H17m0 0a2 2 0 100 4 2 2 0 000-4zm-8 2a2 2 0 100 4 2 2 0 000-4z"
              />
            </svg>
            <span className="absolute -right-1 -top-1 flex h-4 w-4 items-center justify-center rounded-full bg-accent text-[10px] font-bold text-white">
              0
            </span>
          </button>

          {/* Login / Profile */}
          <Link
            href="/login"
            className="hidden rounded-lg bg-primary px-4 py-2 text-sm font-semibold text-white transition-colors hover:bg-primary/90 sm:inline-block"
          >
            Iniciar sesión
          </Link>

          {/* Mobile hamburger */}
          <NavbarMobile />
        </div>
      </div>
    </header>
  );
}
