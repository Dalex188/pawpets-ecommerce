import { notFound } from "next/navigation";
import type { Metadata } from "next";
import { getProductBySlug } from "@/lib/products";
import { Breadcrumbs } from "@/components/products/Breadcrumbs";
import { ProductGallery } from "@/components/products/ProductGallery";
import { ProductInfo } from "@/components/products/ProductInfo";

interface Props {
  params: { slug: string };
}

/**
 * Generate dynamic metadata for SEO — title, description, og:image.
 */
export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const product = await getProductBySlug(params.slug);

  if (!product) {
    return { title: "Producto no encontrado — PawPets" };
  }

  const images: string[] = JSON.parse(product.images);

  return {
    title: `${product.name} — PawPets`,
    description: product.description ?? `Comprá ${product.name} al mejor precio en PawPets`,
    openGraph: {
      title: product.name,
      description: product.description ?? undefined,
      images: images[0] ? [{ url: images[0] }] : undefined,
    },
  };
}

export default async function ProductDetailPage({ params }: Props) {
  const product = await getProductBySlug(params.slug);

  if (!product) {
    notFound();
  }

  const images: string[] = JSON.parse(product.images);

  const breadcrumbItems = [
    { label: "Inicio", href: "/" },
    { label: "Productos", href: "/productos" },
    {
      label: product.category.name,
      href: `/productos?categoria=${product.category.slug}`,
    },
    { label: product.name },
  ];

  return (
    <div className="mx-auto max-w-7xl px-4 py-6 sm:px-6 lg:px-8">
      {/* Breadcrumbs */}
      <Breadcrumbs items={breadcrumbItems} />

      {/* Product detail layout */}
      <div className="mt-6 grid grid-cols-1 gap-8 lg:grid-cols-2">
        {/* Gallery */}
        <ProductGallery images={product.images} productName={product.name} />

        {/* Info */}
        <ProductInfo product={product} />
      </div>
    </div>
  );
}
