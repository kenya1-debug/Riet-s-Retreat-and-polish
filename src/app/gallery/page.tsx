import { createClient } from "@/lib/supabase/server";
import type { GalleryImage } from "@/lib/types";

export const revalidate = 60;
export const metadata = { title: "Gallery — Riet's Retreat and Polish" };

const PLACEHOLDER_COUNT = 8;

export default async function GalleryPage() {
  const supabase = await createClient();
  const { data } = await supabase
    .from("gallery_images")
    .select("*")
    .eq("active", true)
    .order("sort_order");

  const images = (data ?? []) as GalleryImage[];
  const showPlaceholders = images.length === 0;

  return (
    <section className="bg-ink py-20">
      <div className="mx-auto max-w-6xl px-6 sm:px-8">
        <p className="font-sans text-xs tracking-widest2 text-gold/80">Portfolio</p>
        <h1 className="mt-4 font-display text-4xl text-cream sm:text-5xl">Our Work</h1>
        <p className="mt-4 max-w-xl font-body text-lg text-cream/70">
          A look at recent cuts, styles and finishes from the chair.
        </p>

        <div className="mt-12 grid grid-cols-2 gap-3 sm:grid-cols-3 md:grid-cols-4">
          {showPlaceholders
            ? Array.from({ length: PLACEHOLDER_COUNT }).map((_, i) => (
                <div
                  key={i}
                  className="flex aspect-square items-center justify-center border border-gold/15 bg-onyx"
                >
                  <span className="font-display text-sm text-gold/40">Photo {i + 1}</span>
                </div>
              ))
            : images.map((img) => (
                // eslint-disable-next-line @next/next/no-img-element
                <img
                  key={img.id}
                  src={img.image_url}
                  alt={img.caption || "Riet's Retreat and Polish work"}
                  className="aspect-square w-full border border-gold/15 object-cover"
                />
              ))}
        </div>
      </div>
    </section>
  );
}
