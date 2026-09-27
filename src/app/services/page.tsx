import Link from "next/link";
import { createClient } from "@/lib/supabase/server";
import type { Service } from "@/lib/types";

export const revalidate = 60;
export const metadata = { title: "Services — Riet's Retreat and Polish" };

export default async function ServicesPage() {
  const supabase = await createClient();
  const { data } = await supabase
    .from("services")
    .select("*")
    .eq("active", true)
    .order("sort_order");

  const services = (data ?? []) as Service[];
  const categories = Array.from(new Set(services.map((s) => s.category)));

  return (
    <section className="bg-ink py-20">
      <div className="mx-auto max-w-4xl px-6 sm:px-8">
        <p className="font-sans text-xs tracking-widest2 text-gold/80">Menu</p>
        <h1 className="mt-4 font-display text-4xl text-cream sm:text-5xl">Our Services</h1>
        <p className="mt-4 max-w-xl font-body text-lg text-cream/70">
          Prices and durations below are a starting guide — your stylist will confirm
          before beginning any service. All prices in Kenyan Shillings (KES).
        </p>

        <div className="mt-14 space-y-14">
          {categories.map((category) => (
            <div key={category}>
              <h2 className="font-display text-2xl text-gold">{category}</h2>
              <div className="mt-2 rule-gold" />
              <ul className="mt-6 divide-y divide-gold/10">
                {services
                  .filter((s) => s.category === category)
                  .map((s) => (
                    <li key={s.id} className="flex items-start justify-between gap-6 py-5">
                      <div>
                        <p className="font-display text-lg text-cream">{s.name}</p>
                        {s.description && (
                          <p className="mt-1 font-body text-[15px] text-cream/60">
                            {s.description}
                          </p>
                        )}
                        <p className="mt-1 font-sans text-xs text-cream/40">
                          {s.duration_minutes} min
                        </p>
                      </div>
                      <p className="whitespace-nowrap font-sans text-lg text-gold">
                        KES {Number(s.price_kes).toLocaleString()}
                      </p>
                    </li>
                  ))}
              </ul>
            </div>
          ))}

          {services.length === 0 && (
            <p className="font-body text-cream/60">
              Services will appear here shortly — check back soon.
            </p>
          )}
        </div>

        <div className="mt-16 flex flex-col gap-4 sm:flex-row">
          <Link
            href="/booking"
            className="rounded-sm bg-gold px-8 py-3 text-center font-sans text-sm text-ink transition-colors hover:bg-gold-soft"
          >
            Book a service
          </Link>
          <Link
            href="/callin"
            className="rounded-sm border border-gold/60 px-8 py-3 text-center font-sans text-sm text-cream transition-colors hover:border-gold hover:text-gold"
          >
            Request home service
          </Link>
        </div>
      </div>
    </section>
  );
}
