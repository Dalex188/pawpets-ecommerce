"use client";

// ──────────────────────────────────────────────
// PawPets — Admin Sidebar Navigation
// ──────────────────────────────────────────────
// Fixed sidebar with navigation links.
// Highlights current route using usePathname.
// ──────────────────────────────────────────────

import Link from "next/link";
import { usePathname } from "next/navigation";
import { signOut } from "next-auth/react";
import { cn } from "@/lib/utils";

const NAV_LINKS = [
  { label: "Dashboard", href: "/admin" },
  { label: "Productos", href: "/admin/products" },
  { label: "Pedidos", href: "/admin/orders" },
];

export function AdminSidebar() {
  const pathname = usePathname();

  return (
    <aside className="fixed inset-y-0 left-0 z-20 hidden w-64 flex-col border-r bg-white lg:flex">
      <div className="flex h-16 items-center border-b px-6">
        <Link href="/admin" className="text-xl font-extrabold tracking-tight">
          <span className="text-secondary">PAW</span>
          <span className="text-accent">PETS</span>
          <span className="ml-2 text-xs font-normal text-muted-foreground">
            Admin
          </span>
        </Link>
      </div>
      <nav className="flex-1 space-y-1 px-3 py-4">
        {NAV_LINKS.map((link) => {
          const isActive = pathname === link.href;

          return (
            <Link
              key={link.href}
              href={link.href}
              className={cn(
                "flex items-center rounded-lg px-4 py-2.5 text-sm font-medium transition-colors",
                isActive
                  ? "bg-primary text-white"
                  : "text-foreground/70 hover:bg-gray-100 hover:text-foreground",
              )}
            >
              {link.label}
            </Link>
          );
        })}
      </nav>
      <div className="border-t px-3 py-3">
        <button
          onClick={() => signOut({ callbackUrl: "/" })}
          className="flex w-full items-center rounded-lg px-4 py-2.5 text-sm font-medium text-red-600 transition-colors hover:bg-red-50"
        >
          Cerrar sesión
        </button>
      </div>
    </aside>
  );
}
