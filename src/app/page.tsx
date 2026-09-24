import Link from "next/link";
import { createClient } from "@/lib/supabase/server";
import { getSiteSettings } from "@/lib/settings";
import type { Service, Testimonial } from "@/lib/types";

export const revalidate = 60;

async function getHomeData() {
  const supabase = await createClient();
  const [{ data: services }, { data: testimonials }] = await Promise.all([
    supabase
      .from("services")
      .select("*")
      .eq("active", true)
      .order("sort_order")
      .limit(4),
    supabase
      .from("testimonials")
      .select("*")
      .eq("active", true)
      .order("sort_order")
      .limit(3),
  ]);
  return {
    services: (services ?? []) as Service[],
    testimonials: (testimonials ?? []) as Testimonial[],
  };
}

export default async function HomePage() {
  const { hours, hero } = await getSiteSettings();
  const { services, testimonials } = await getHomeData();

  return (
    <>
      {/* Hero */}
      <section className="relative overflow-hidden border-b border-gold/20 bg-ink">
        <div className="mx-auto flex max-w-4xl flex-col items-center px-6 py-28 text-center sm:py-36">
          <p className="font-sans text-xs tracking-widest2 text-gold/80">Kabarnet, Baringo County</p>
          <h1 className="mt-6 font-display text-4xl leading-tight text-cream sm:text-6xl">
            {hero.tagline}
          </h1>
          <p className="mx-auto mt-6 max-w-xl font-body text-lg leading-relaxed text-cream/70 sm:text-xl">
            {hero.subtext}
          </p>
          <div className="mt-10 flex flex-col gap-4 sm:flex-row">
            <Link
              href="/booking"
              className="rounded-sm bg-gold px-8 py-3 font-sans text-sm text-ink transition-colors hover:bg-gold-soft"
            >
              Book Now
            </Link>
            <Link
              href="/callin"
              className="rounded-sm border border-gold/60 px-8 py-3 font-sans text-sm text-cream transition-colors hover:border-gold hover:text-gold"
            >
              Request Home / Call-in Service
            </Link>
          </div>
        </div>
      </section>

      {/* Services teaser */}
      <section className="bg-parchment py-20">
        <div className="mx-auto max-w-6xl px-6 sm:px-8">
          <div className="flex flex-col items-start justify-between gap-4 sm:flex-row sm:items-end">
            <div>
              <h2 className="font-display text-3xl text-ink sm:text-4xl">A few of our services</h2>
              <p className="mt-2 max-w-md font-body text-base text-ink/60">
                Hair, grooming and nail care — see the full list and prices.
              </p>
            </div>
            <Link
              href="/services"
              className="font-sans text-sm text-ink underline decoration-gold underline-offset-4"
            >
              View all services
            </Link>
          </div>

          <div className="mt-10 grid gap-px overflow-hidden border border-ink/10 sm:grid-cols-2 lg:grid-cols-4">
            {services.map((s) => (
              <div key={s.id} className="bg-parchment p-6">
                <p className="font-display text-lg text-ink">{s.name}</p>
                <p className="mt-2 font-sans text-sm text-ink/50">{s.duration_minutes} min</p>
                <p className="mt-4 font-sans text-lg text-gold">
                  KES {Number(s.price_kes).toLocaleString()}
                </p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Hours */}
      <section className="bg-ink py-20">
        <div className="mx-auto max-w-3xl px-6 text-center sm:px-8">
          <h2 className="font-display text-3xl text-cream sm:text-4xl">When we&rsquo;re open</h2>
          <dl className="mx-auto mt-10 max-w-sm space-y-4 font-sans text-cream/80">
            <div className="flex justify-between border-b border-gold/15 pb-3">
              <dt>Monday – Friday</dt>
              <dd className="text-gold">{hours.monday_friday}</dd>
            </div>
            <div className="flex justify-between border-b border-gold/15 pb-3">
              <dt>Saturday</dt>
              <dd className="text-gold">{hours.saturday}</dd>
            </div>
            <div className="flex justify-between pb-3">
              <dt>Sunday</dt>
              <dd className="text-gold">{hours.sunday}</dd>
            </div>
          </dl>
        </div>
      </section>

      {/* Testimonials */}
      {testimonials.length > 0 && (
        <section className="bg-parchment py-20">
          <div className="mx-auto max-w-5xl px-6 sm:px-8">
            <h2 className="text-center font-display text-3xl text-ink sm:text-4xl">
              What clients say
            </h2>
            <div className="mt-12 grid gap-10 sm:grid-cols-3">
              {testimonials.map((t) => (
                <figure key={t.id} className="text-center">
                  <blockquote className="font-body text-lg leading-relaxed text-ink/80">
                    &ldquo;{t.quote}&rdquo;
                  </blockquote>
                  <figcaption className="mt-4 font-sans text-sm text-ink/50">
                    {t.customer_name}
                  </figcaption>
                </figure>
              ))}
            </div>
          </div>
        </section>
      )}

      {/* Closing CTA */}
      <section className="bg-ink py-24 text-center">
        <div className="mx-auto max-w-2xl px-6">
          <h2 className="font-display text-3xl text-cream sm:text-4xl">Ready for your polish?</h2>
          <p className="mt-4 font-body text-lg text-cream/70">
            Reserve your seat, or invite us to you.
          </p>
          <div className="mt-8 flex flex-col justify-center gap-4 sm:flex-row">
            <Link
              href="/booking"
              className="rounded-sm bg-gold px-8 py-3 font-sans text-sm text-ink transition-colors hover:bg-gold-soft"
            >
              Book Now
            </Link>
            <Link
              href="/gallery"
              className="rounded-sm border border-gold/60 px-8 py-3 font-sans text-sm text-cream transition-colors hover:border-gold hover:text-gold"
            >
              See our work
            </Link>
          </div>
        </div>
      </section>
    </>
  );
}
