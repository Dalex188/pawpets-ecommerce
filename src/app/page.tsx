export default function HomePage() {
  return (
    <section className="flex flex-col items-center justify-center px-4 py-24 text-center">
      <h1 className="text-4xl font-extrabold tracking-tight text-primary sm:text-5xl md:text-6xl">
        Bienvenido a PawPets
      </h1>
      <p className="mt-4 max-w-2xl text-lg text-foreground/70 sm:text-xl">
        Todo lo que tu mascota necesita en un solo lugar. Encuentra los mejores
        productos para perros, gatos, aves, peces y más.
      </p>

      {/* Featured products — to be implemented in Catalog module */}
      <div className="mt-16 grid w-full max-w-5xl grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3">
        <div className="rounded-xl border border-dashed border-primary/30 bg-primary/5 p-8 text-center text-primary/50">
          Producto destacado próximamente
        </div>
        <div className="rounded-xl border border-dashed border-secondary/30 bg-secondary/5 p-8 text-center text-secondary/50">
          Producto destacado próximamente
        </div>
        <div className="rounded-xl border border-dashed border-accent/30 bg-accent/5 p-8 text-center text-accent/50">
          Producto destacado próximamente
        </div>
      </div>
    </section>
  );
}
