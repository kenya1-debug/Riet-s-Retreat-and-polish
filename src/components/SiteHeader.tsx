"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useState } from "react";
import { NAV_LINKS } from "@/lib/constants";

export default function SiteHeader() {
  const pathname = usePathname();
  const [open, setOpen] = useState(false);

  return (
    <header className="sticky top-0 z-40 border-b border-gold/20 bg-ink/95 backdrop-blur">
      <div className="mx-auto flex max-w-6xl items-center justify-between px-5 py-4 sm:px-8">
        <Link href="/" className="font-display text-xl tracking-wide text-cream sm:text-2xl">
          Riet&rsquo;s <span className="text-gold">Retreat</span> &amp; Polish
        </Link>

        <nav className="hidden items-center gap-8 font-sans text-sm text-cream/80 md:flex">
          {NAV_LINKS.map((link) => (
            <Link
              key={link.href}
              href={link.href}
              className={`transition-colors hover:text-gold ${
                pathname === link.href ? "text-gold" : ""
              }`}
            >
              {link.label}
            </Link>
          ))}
        </nav>

        <div className="hidden items-center gap-3 md:flex">
          <Link
            href="/callin"
            className="font-sans text-sm text-cream/80 transition-colors hover:text-gold"
          >
            House Service
          </Link>
          <Link
            href="/booking"
            className="rounded-sm border border-gold px-4 py-2 font-sans text-sm text-gold transition-colors hover:bg-gold hover:text-ink"
          >
            Book Now
          </Link>
        </div>

        <button
          aria-label="Toggle menu"
          aria-expanded={open}
          onClick={() => setOpen((v) => !v)}
          className="flex flex-col gap-1.5 md:hidden"
        >
          <span className="h-px w-6 bg-gold" />
          <span className="h-px w-6 bg-gold" />
          <span className="h-px w-6 bg-gold" />
        </button>
      </div>

      {open && (
        <nav className="border-t border-gold/20 bg-ink px-5 pb-6 pt-2 font-sans text-cream/85 md:hidden">
          {NAV_LINKS.concat([{ href: "/callin", label: "House Service" }]).map((link) => (
            <Link
              key={link.href}
              href={link.href}
              onClick={() => setOpen(false)}
              className="block border-b border-gold/10 py-3 text-sm"
            >
              {link.label}
            </Link>
          ))}
          <Link
            href="/booking"
            onClick={() => setOpen(false)}
            className="mt-4 block rounded-sm border border-gold px-4 py-3 text-center text-sm text-gold"
          >
            Book Now
          </Link>
        </nav>
      )}
    </header>
  );
}
