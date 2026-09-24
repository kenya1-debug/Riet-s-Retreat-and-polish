import Link from "next/link";
import { SITE_LOCATION, TIKTOK_HANDLE, TIKTOK_URL } from "@/lib/constants";
import type { SiteContact, SiteHours } from "@/lib/types";

export default function SiteFooter({
  hours,
  contact,
}: {
  hours: SiteHours;
  contact: SiteContact;
}) {
  return (
    <footer className="border-t border-gold/20 bg-ink text-cream/80">
      <div className="mx-auto grid max-w-6xl gap-10 px-5 py-14 sm:px-8 md:grid-cols-3">
        <div>
          <p className="font-display text-lg text-cream">Riet&rsquo;s Retreat &amp; Polish</p>
          <p className="mt-3 font-body text-[15px] leading-relaxed text-cream/70">
            {SITE_LOCATION}
          </p>
          <a
            href={TIKTOK_URL}
            target="_blank"
            rel="noopener noreferrer"
            className="mt-4 inline-flex items-center gap-2 font-sans text-sm text-gold transition-colors hover:text-gold-soft"
          >
            <TikTokMark />
            {TIKTOK_HANDLE} on TikTok
          </a>
        </div>

        <div>
          <p className="font-sans text-sm text-gold">Hours</p>
          <dl className="mt-3 space-y-1.5 font-sans text-sm text-cream/70">
            <div className="flex justify-between gap-6">
              <dt>Monday – Friday</dt>
              <dd>{hours.monday_friday}</dd>
            </div>
            <div className="flex justify-between gap-6">
              <dt>Saturday</dt>
              <dd>{hours.saturday}</dd>
            </div>
            <div className="flex justify-between gap-6">
              <dt>Sunday</dt>
              <dd>{hours.sunday}</dd>
            </div>
          </dl>
        </div>

        <div>
          <p className="font-sans text-sm text-gold">Reach us</p>
          <ul className="mt-3 space-y-1.5 font-sans text-sm text-cream/70">
            <li>
              <a href={`tel:${contact.phone}`} className="hover:text-gold">
                {contact.phone}
              </a>
            </li>
            <li>
              <a
                href={`https://wa.me/${contact.whatsapp.replace(/[^\d]/g, "")}`}
                target="_blank"
                rel="noopener noreferrer"
                className="hover:text-gold"
              >
                WhatsApp: {contact.whatsapp}
              </a>
            </li>
            <li>
              <a href={`mailto:${contact.email}`} className="hover:text-gold">
                {contact.email}
              </a>
            </li>
          </ul>
          <Link
            href="/contact"
            className="mt-4 inline-block font-sans text-sm text-gold underline decoration-gold/40 underline-offset-4 hover:text-gold-soft"
          >
            Full contact details
          </Link>
        </div>
      </div>
      <div className="rule-gold" />
      <p className="px-5 py-5 text-center font-sans text-xs text-cream/40 sm:px-8">
        © {new Date().getFullYear()} Riet&rsquo;s Retreat and Polish. All rights reserved.
      </p>
    </footer>
  );
}

function TikTokMark() {
  return (
    <svg width="16" height="16" viewBox="0 0 24 24" fill="currentColor" aria-hidden="true">
      <path d="M16.6 5.2c-.9-.8-1.4-2-1.4-3.2h-3.2v13.6a2.7 2.7 0 1 1-2.2-2.7v-3.3a6 6 0 1 0 5.4 6V9.1a7.1 7.1 0 0 0 4.1 1.3V7.2c-1 0-2-.3-2.7-1z" />
    </svg>
  );
}
