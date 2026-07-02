// ──────────────────────────────────────────────
// PawPets — Hero Section (RSC)
// ──────────────────────────────────────────────
// Full-width hero with background image, gradient
// overlay, headline, subheadline, and CTA.
// ──────────────────────────────────────────────

import Link from "next/link";

const HERO_IMAGE =
  "https://picsum.photos/seed/pawpets-hero/1920/600";

export function HeroSection() {
  return (
    <section
      className="relative flex min-h-[400px] items-center justify-start bg-gradient-to-r from-black/60 to-transparent bg-cover bg-center md:min-h-[500px]"
      style={{ backgroundImage: `url(${HERO_IMAGE})` }}
    >
      {/* Fallback gradient when image fails to load */}
      <div className="pointer-events-none absolute inset-0 bg-primary/20" />

      {/* Content */}
      <div className="relative z-10 mx-auto w-full max-w-7xl px-4 sm:px-6 lg:px-8">
        <div className="max-w-lg">
          <h1 className="text-4xl font-bold text-white md:text-6xl">
            Todo para tu mascota
          </h1>
          <p className="mt-4 text-lg text-gray-200 md:text-xl">
            Encontrá todo lo que necesitás para mimar a tu compañero
          </p>
          <Link
            href="/productos"
            className="mt-6 inline-block rounded-lg bg-primary px-8 py-3 text-white transition-colors hover:bg-primary/90"
          >
            Ver productos
          </Link>
        </div>
      </div>
    </section>
  );
}
