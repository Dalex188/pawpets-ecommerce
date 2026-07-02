// ──────────────────────────────────────────────
// PawPets — Admin Layout
// ──────────────────────────────────────────────
// Role-guarded layout: checks ADMIN role, renders
// sidebar navigation + page content.
// ──────────────────────────────────────────────

import { auth } from "@/lib/auth";
import { redirect } from "next/navigation";
import { AdminSidebar } from "@/components/admin/AdminSidebar";

export default async function AdminLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const session = await auth();

  if (!session?.user?.role || session.user.role !== "ADMIN") {
    redirect("/");
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <AdminSidebar />
      <main className="lg:pl-64 p-6">{children}</main>
    </div>
  );
}
