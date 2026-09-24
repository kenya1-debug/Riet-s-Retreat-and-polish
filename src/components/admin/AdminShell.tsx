"use client";

import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { createClient } from "@/lib/supabase/client";

const LINKS = [
  { href: "/admin", label: "Overview" },
  { href: "/admin/bookings", label: "Bookings" },
  { href: "/admin/walkins", label: "Walk-ins" },
  { href: "/admin/staff", label: "Staff" },
  { href: "/admin/sales", label: "Sales" },
  { href: "/admin/reports", label: "Reports" },
  { href: "/admin/content", label: "Site Content" },
];

export default function AdminShell({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  const router = useRouter();

  if (pathname === "/admin/login") {
    return <div className="min-h-screen bg-ink">{children}</div>;
  }

  async function signOut() {
    const supabase = createClient();
    await supabase.auth.signOut();
    router.push("/admin/login");
    router.refresh();
  }

  return (
    <div className="flex min-h-screen bg-onyx text-cream">
      <aside className="hidden w-60 shrink-0 border-r border-gold/15 bg-ink md:block">
        <div className="px-6 py-6">
          <p className="font-display text-lg text-cream">Riet&rsquo;s <span className="text-gold">Admin</span></p>
        </div>
        <nav className="mt-2 flex flex-col font-sans text-sm">
          {LINKS.map((link) => (
            <Link
              key={link.href}
              href={link.href}
              className={`border-l-2 px-6 py-3 transition-colors ${
                pathname === link.href
                  ? "border-gold bg-onyx text-gold"
                  : "border-transparent text-cream/60 hover:text-cream"
              }`}
            >
              {link.label}
            </Link>
          ))}
        </nav>
        <button
          onClick={signOut}
          className="mx-6 mt-8 border border-gold/30 px-4 py-2 font-sans text-xs text-cream/70 hover:border-gold hover:text-gold"
        >
          Sign out
        </button>
      </aside>

      <div className="flex-1">
        <div className="flex items-center justify-between border-b border-gold/15 bg-ink px-5 py-4 md:hidden">
          <p className="font-display text-base">Riet&rsquo;s Admin</p>
          <button onClick={signOut} className="font-sans text-xs text-gold">
            Sign out
          </button>
        </div>
        <nav className="flex gap-4 overflow-x-auto border-b border-gold/15 bg-ink px-5 py-3 font-sans text-xs md:hidden">
          {LINKS.map((link) => (
            <Link
              key={link.href}
              href={link.href}
              className={pathname === link.href ? "text-gold" : "text-cream/60"}
            >
              {link.label}
            </Link>
          ))}
        </nav>
        <main className="p-5 sm:p-8">{children}</main>
      </div>
    </div>
  );
}
