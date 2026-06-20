import type { Metadata } from "next";
import { Nunito } from "next/font/google";
import { cn } from "@/lib/utils";
import { ClientSessionProvider } from "@/components/ui/ClientSessionProvider";
import { Navbar } from "@/components/layout/Navbar";
import { Footer } from "@/components/layout/Footer";
import "./globals.css";

const nunito = Nunito({
  subsets: ["latin"],
  weight: ["400", "500", "600", "700", "800"],
  display: "swap",
});

export const metadata: Metadata = {
  title: "PawPets",
  description: "E-commerce de productos para mascotas",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="es">
      <body
        className={cn(
          nunito.className,
          "flex min-h-screen flex-col",
        )}
      >
        <ClientSessionProvider>
          <Navbar />
          <main className="flex-1">{children}</main>
          <Footer />
        </ClientSessionProvider>
      </body>
    </html>
  );
}
