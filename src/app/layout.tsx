import type { Metadata } from "next";
import { Playfair_Display, Cormorant_Garamond, Jost } from "next/font/google";
import "./globals.css";
import SiteHeader from "@/components/SiteHeader";
import SiteFooter from "@/components/SiteFooter";
import { getSiteSettings } from "@/lib/settings";

const playfair = Playfair_Display({
  subsets: ["latin"],
  weight: ["500", "600", "700"],
  variable: "--font-playfair",
  display: "swap",
});

const cormorant = Cormorant_Garamond({
  subsets: ["latin"],
  weight: ["400", "500", "600"],
  variable: "--font-cormorant",
  display: "swap",
});

const jost = Jost({
  subsets: ["latin"],
  weight: ["400", "500", "600"],
  variable: "--font-jost",
  display: "swap",
});

export const metadata: Metadata = {
  title: "Riet's Retreat and Polish — Salon & Barber, Juja",
  description:
    "Riet's Retreat and Polish is Juja's premium salon and barber shop for hair, grooming and nail care — in-salon or at your home. Book online today.",
};

export default async function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const { hours, contact } = await getSiteSettings();

  return (
    <html lang="en" className={`${playfair.variable} ${cormorant.variable} ${jost.variable}`}>
      <body className="min-h-screen bg-ink font-sans text-cream antialiased">
        <SiteHeader />
        <main>{children}</main>
        <SiteFooter hours={hours} contact={contact} />
      </body>
    </html>
  );
}
