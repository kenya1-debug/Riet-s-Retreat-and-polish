import { createClient } from "@/lib/supabase/server";
import BookingForm from "@/components/BookingForm";
import type { Service } from "@/lib/types";

export const metadata = { title: "House Service — Riet's Retreat and Polish" };

export default async function CallInPage() {
  const supabase = await createClient();
  const { data } = await supabase
    .from("services")
    .select("*")
    .eq("active", true)
    .order("sort_order");

  return (
    <section className="bg-ink py-20">
      <div className="mx-auto max-w-2xl px-6 sm:px-8">
        <p className="font-sans text-xs tracking-widest2 text-gold/80">We come to you</p>
        <h1 className="mt-4 font-display text-4xl text-cream sm:text-5xl">
          Home / Call-in Service
        </h1>
        <p className="mt-4 font-body text-lg text-cream/70">
          Prefer to be styled at home? Share your location and preferred time and a
          stylist will come to you. Call-in service may carry a small travel fee,
          confirmed when we call to arrange your visit.
        </p>
        <div className="mt-10">
          <BookingForm services={(data ?? []) as Service[]} type="call_in" />
        </div>
      </div>
    </section>
  );
}
