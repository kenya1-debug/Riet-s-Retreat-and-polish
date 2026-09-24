import { getSiteSettings } from "@/lib/settings";
import { TIKTOK_HANDLE } from "@/lib/constants";

export const metadata = { title: "Contact — Riet's Retreat and Polish" };

export default async function ContactPage() {
  const { contact } = await getSiteSettings();
  const mapQuery = encodeURIComponent(contact.address);

  return (
    <section className="bg-ink py-20">
      <div className="mx-auto max-w-5xl px-6 sm:px-8">
        <p className="font-sans text-xs tracking-widest2 text-gold/80">Get in touch</p>
        <h1 className="mt-4 font-display text-4xl text-cream sm:text-5xl">Contact Us</h1>

        <div className="mt-14 grid gap-14 md:grid-cols-2">
          <dl className="space-y-8 font-sans">
            <div>
              <dt className="text-sm text-cream/50">Phone</dt>
              <dd className="mt-1">
                <a href={`tel:${contact.phone}`} className="font-display text-2xl text-gold">
                  {contact.phone}
                </a>
              </dd>
            </div>
            <div>
              <dt className="text-sm text-cream/50">WhatsApp</dt>
              <dd className="mt-1">
                <a
                  href={`https://wa.me/${contact.whatsapp.replace(/[^\d]/g, "")}`}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="font-display text-2xl text-gold"
                >
                  {contact.whatsapp}
                </a>
              </dd>
            </div>
            <div>
              <dt className="text-sm text-cream/50">Email</dt>
              <dd className="mt-1">
                <a href={`mailto:${contact.email}`} className="font-display text-2xl text-gold">
                  {contact.email}
                </a>
              </dd>
            </div>
            <div>
              <dt className="text-sm text-cream/50">Location</dt>
              <dd className="mt-1 font-body text-lg text-cream/80">{contact.address}</dd>
            </div>
            <div>
              <dt className="text-sm text-cream/50">TikTok</dt>
              <dd className="mt-1">
                <a
                  href={contact.tiktok}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="font-display text-2xl text-gold"
                >
                  {TIKTOK_HANDLE}
                </a>
              </dd>
            </div>
          </dl>

          <div className="h-80 w-full overflow-hidden border border-gold/20 md:h-auto">
            <iframe
              title="Salon location map"
              className="h-full w-full grayscale invert-[.92]"
              loading="lazy"
              referrerPolicy="no-referrer-when-downgrade"
              src={`https://maps.google.com/maps?q=${mapQuery}&output=embed`}
            />
          </div>
        </div>
      </div>
    </section>
  );
}
