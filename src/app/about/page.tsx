import { SITE_LOCATION, TIKTOK_HANDLE, TIKTOK_URL } from "@/lib/constants";

export const metadata = { title: "About — Riet's Retreat and Polish" };

export default function AboutPage() {
  return (
    <section className="bg-ink py-20">
      <div className="mx-auto max-w-3xl px-6 sm:px-8">
        <p className="font-sans text-xs tracking-widest2 text-gold/80">Our story</p>
        <h1 className="mt-4 font-display text-4xl text-cream sm:text-5xl">
          About Riet&rsquo;s Retreat and Polish
        </h1>

        <div className="mt-10 space-y-6 font-body text-lg leading-relaxed text-cream/75">
          <p>
            Riet&rsquo;s Retreat and Polish opened its doors in Juja with a
            simple aim: bring salon and barber work of a genuinely high standard to
            Juja, without losing the warmth of a neighbourhood shop.
          </p>
          <p>
            Every cut, style, treatment and manicure is carried out with care by a
            small team who know their craft — whether you visit us in the chair or
            invite us to your home for a house call.
          </p>
          <p>
            The salon has built a loyal following on TikTok as{" "}
            <a
              href={TIKTOK_URL}
              target="_blank"
              rel="noopener noreferrer"
              className="text-gold underline decoration-gold/40 underline-offset-4"
            >
              {TIKTOK_HANDLE}
            </a>
            , where finished looks are shared for the community to see.
          </p>
        </div>

        <div className="mt-14 border-t border-gold/15 pt-10">
          <h2 className="font-display text-2xl text-gold">Find us</h2>
          <p className="mt-3 font-body text-lg text-cream/70">{SITE_LOCATION}</p>
        </div>
      </div>
    </section>
  );
}
