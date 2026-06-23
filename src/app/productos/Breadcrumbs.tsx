import { Breadcrumbs as BreadcrumbsUI } from "@/components/products/Breadcrumbs";
import type { BreadcrumbItem } from "@/components/products/Breadcrumbs";

interface Props {
  categoria?: string;
  subcategoria?: string;
  categoryName?: string;
}

export default function Breadcrumbs({ categoria, subcategoria, categoryName }: Props) {
  const items: BreadcrumbItem[] = [{ label: "Inicio", href: "/" }];

  if (!categoria) {
    items.push({ label: "Productos" });
  } else if (categoria && !subcategoria) {
    items.push({ label: "Productos", href: "/productos" });
    items.push({ label: categoryName ?? categoria });
  } else {
    items.push({ label: "Productos", href: "/productos" });
    items.push({
      label: categoryName ?? categoria,
      href: `/productos?categoria=${categoria}`,
    });
    items.push({ label: subcategoria! });
  }

  return <BreadcrumbsUI items={items} />;
}
