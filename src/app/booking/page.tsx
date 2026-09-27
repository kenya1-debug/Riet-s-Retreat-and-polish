import { createClient } from "@/lib/supabase/server";
import BookingForm from "@/components/BookingForm";
import type { Service } from "@/lib/types";

export const metadata = { title: "Book Now — Riet's Retreat and Polish" };

export default async function BookingPage() {
  const supabase = await createClient();
  const { data } = await supabase
    .from("services")
    .select("*")
    .eq("active", true)
    .order("sort_order");

  return (
    <section className="bg-ink py-20">
      <div className="mx-auto max-w-2xl px-6 sm:px-8">
        <p className="font-sans text-xs tracking-widest2 text-gold/80">In-salon appointment</p>
        <h1 className="mt-4 font-display text-4xl text-cream sm:text-5xl">Book Now</h1>
        <p className="mt-4 font-body text-lg text-cream/70">
          Tell us what you&rsquo;d like and when — we&rsquo;ll confirm your seat.
        </p>
        <div className="mt-10">
          <BookingForm services={(data ?? []) as Service[]} type="in_salon" />
        </div>
      </div>
    </section>
  );
}
