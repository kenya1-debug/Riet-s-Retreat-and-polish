import { createClient } from "@/lib/supabase/server";
import { DEFAULT_CONTACT, DEFAULT_HOURS } from "@/lib/constants";
import type { SiteContact, SiteHero, SiteHours } from "@/lib/types";

// Reads editable site copy (hours / contact / hero text) from the
// site_settings table, falling back to sensible defaults if the table
// hasn't been seeded yet or Supabase isn't configured — so the site
// never breaks even before the client's admin has set anything.
export async function getSiteSettings() {
  const fallback = {
    hours: DEFAULT_HOURS as SiteHours,
    contact: DEFAULT_CONTACT as SiteContact,
    hero: {
      tagline: "Juja's home of retreat, refinement and polish.",
      subtext:
        "Hair, grooming and nail care crafted with care — in our chair, or at your door.",
    } as SiteHero,
  };

  try {
    const supabase = await createClient();
    const { data, error } = await supabase.from("site_settings").select("key, value");
    if (error || !data) return fallback;

    const map = Object.fromEntries(data.map((row) => [row.key, row.value]));
    return {
      hours: (map.hours as SiteHours) ?? fallback.hours,
      contact: (map.contact as SiteContact) ?? fallback.contact,
      hero: (map.hero as SiteHero) ?? fallback.hero,
    };
  } catch {
    return fallback;
  }
}
