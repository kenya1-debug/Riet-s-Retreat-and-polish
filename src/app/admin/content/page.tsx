"use client";

import { useEffect, useState, type FormEvent } from "react";
import { createClient } from "@/lib/supabase/client";
import type { GalleryImage, Service, SiteHours } from "@/lib/types";

export default function ContentPage() {
  return (
    <div className="space-y-16">
      <div>
        <h1 className="font-display text-3xl text-cream">Site Content</h1>
        <p className="mt-1 font-sans text-sm text-cream/50">
          Edit what shows on the public site — no code required.
        </p>
      </div>
      <ServicesEditor />
      <HoursEditor />
      <GalleryEditor />
    </div>
  );
}

function ServicesEditor() {
  const supabase = createClient();
  const [services, setServices] = useState<Service[]>([]);

  async function load() {
    const { data } = await supabase.from("services").select("*").order("sort_order");
    setServices((data ?? []) as Service[]);
  }
  useEffect(() => {
    load();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  async function addService(e: FormEvent<HTMLFormElement>) {
    e.preventDefault();
    const form = new FormData(e.currentTarget);
    await supabase.from("services").insert({
      name: String(form.get("name")),
      category: String(form.get("category") || "General"),
      price_kes: Number(form.get("price_kes")) || 0,
      duration_minutes: Number(form.get("duration_minutes")) || 30,
      description: String(form.get("description") || ""),
      sort_order: services.length,
    });
    (e.target as HTMLFormElement).reset();
    load();
  }

  async function updateService(id: string, patch: Partial<Service>) {
    await supabase.from("services").update(patch).eq("id", id);
    load();
  }

  async function removeService(id: string) {
    if (!confirm("Delete this service?")) return;
    await supabase.from("services").delete().eq("id", id);
    load();
  }

  return (
    <section>
      <h2 className="font-display text-2xl text-gold">Services &amp; Prices</h2>
      <form onSubmit={addService} className="mt-4 grid gap-4 border border-gold/15 bg-ink p-6 sm:grid-cols-6">
        <input name="name" placeholder="Service name" required className="input sm:col-span-2" />
        <input name="category" placeholder="Category" className="input" />
        <input name="price_kes" type="number" min="0" placeholder="Price (KES)" required className="input" />
        <input name="duration_minutes" type="number" min="5" placeholder="Duration (min)" className="input" />
        <button className="bg-gold px-4 py-3 font-sans text-sm text-ink hover:bg-gold-soft">Add</button>
        <input
          name="description"
          placeholder="Short description (optional)"
          className="input sm:col-span-6"
        />
      </form>

      <div className="mt-4 overflow-x-auto border border-gold/15">
        <table className="w-full text-left font-sans text-sm">
          <thead className="border-b border-gold/15 text-cream/50">
            <tr>
              <th className="px-4 py-3">Name</th>
              <th className="px-4 py-3">Category</th>
              <th className="px-4 py-3">Price</th>
              <th className="px-4 py-3">Duration</th>
              <th className="px-4 py-3">Visible</th>
              <th className="px-4 py-3" />
            </tr>
          </thead>
          <tbody>
            {services.map((s) => (
              <tr key={s.id} className="border-b border-gold/10 last:border-0">
                <td className="px-4 py-3">{s.name}</td>
                <td className="px-4 py-3 text-cream/60">{s.category}</td>
                <td className="px-4 py-3">
                  <input
                    type="number"
                    defaultValue={s.price_kes}
                    onBlur={(e) => updateService(s.id, { price_kes: Number(e.target.value) })}
                    className="input w-24 py-1"
                  />
                </td>
                <td className="px-4 py-3 text-cream/60">{s.duration_minutes} min</td>
                <td className="px-4 py-3">
                  <button
                    onClick={() => updateService(s.id, { active: !s.active })}
                    className={s.active ? "text-gold" : "text-cream/40"}
                  >
                    {s.active ? "Shown" : "Hidden"}
                  </button>
                </td>
                <td className="px-4 py-3 text-right">
                  <button onClick={() => removeService(s.id)} className="text-red-400 hover:text-red-300">
                    Delete
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </section>
  );
}

function HoursEditor() {
  const supabase = createClient();
  const [hours, setHours] = useState<SiteHours>({ monday_friday: "", saturday: "", sunday: "" });
  const [saved, setSaved] = useState(false);

  useEffect(() => {
    supabase
      .from("site_settings")
      .select("value")
      .eq("key", "hours")
      .maybeSingle()
      .then(({ data }) => {
        if (data?.value) setHours(data.value as SiteHours);
      });
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  async function save() {
    await supabase.from("site_settings").upsert({ key: "hours", value: hours });
    setSaved(true);
    setTimeout(() => setSaved(false), 2000);
  }

  return (
    <section>
      <h2 className="font-display text-2xl text-gold">Working Hours</h2>
      <div className="mt-4 grid gap-4 border border-gold/15 bg-ink p-6 sm:grid-cols-3">
        <Field label="Monday – Friday" value={hours.monday_friday} onChange={(v) => setHours({ ...hours, monday_friday: v })} />
        <Field label="Saturday" value={hours.saturday} onChange={(v) => setHours({ ...hours, saturday: v })} />
        <Field label="Sunday" value={hours.sunday} onChange={(v) => setHours({ ...hours, sunday: v })} />
      </div>
      <button onClick={save} className="mt-4 bg-gold px-6 py-2.5 font-sans text-sm text-ink hover:bg-gold-soft">
        {saved ? "Saved ✓" : "Save hours"}
      </button>
    </section>
  );
}

function Field({ label, value, onChange }: { label: string; value: string; onChange: (v: string) => void }) {
  return (
    <div>
      <label className="block font-sans text-xs text-cream/50">{label}</label>
      <input value={value} onChange={(e) => onChange(e.target.value)} className="input mt-1 w-full" />
    </div>
  );
}

function GalleryEditor() {
  const supabase = createClient();
  const [images, setImages] = useState<GalleryImage[]>([]);

  async function load() {
    const { data } = await supabase.from("gallery_images").select("*").order("sort_order");
    setImages((data ?? []) as GalleryImage[]);
  }
  useEffect(() => {
    load();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  async function addImage(e: FormEvent<HTMLFormElement>) {
    e.preventDefault();
    const form = new FormData(e.currentTarget);
    await supabase.from("gallery_images").insert({
      image_url: String(form.get("image_url")),
      caption: String(form.get("caption") || ""),
      sort_order: images.length,
    });
    (e.target as HTMLFormElement).reset();
    load();
  }

  async function toggleImage(id: string, active: boolean) {
    await supabase.from("gallery_images").update({ active }).eq("id", id);
    load();
  }

  async function removeImage(id: string) {
    await supabase.from("gallery_images").delete().eq("id", id);
    load();
  }

  return (
    <section>
      <h2 className="font-display text-2xl text-gold">Gallery Images</h2>
      <p className="mt-1 font-sans text-sm text-cream/50">
        Paste an image URL (e.g. uploaded to Supabase Storage) and an optional caption.
      </p>
      <form onSubmit={addImage} className="mt-4 grid gap-4 border border-gold/15 bg-ink p-6 sm:grid-cols-4">
        <input name="image_url" placeholder="Image URL" required className="input sm:col-span-2" />
        <input name="caption" placeholder="Caption (optional)" className="input" />
        <button className="bg-gold px-4 py-3 font-sans text-sm text-ink hover:bg-gold-soft">Add image</button>
      </form>

      <div className="mt-4 grid grid-cols-2 gap-4 sm:grid-cols-4">
        {images.map((img) => (
          // eslint-disable-next-line @next/next/no-img-element
          <div key={img.id} className="border border-gold/15 bg-ink p-2">
            <img src={img.image_url} alt={img.caption} className="aspect-square w-full object-cover" />
            <div className="mt-2 flex items-center justify-between font-sans text-xs">
              <button
                onClick={() => toggleImage(img.id, !img.active)}
                className={img.active ? "text-gold" : "text-cream/40"}
              >
                {img.active ? "Shown" : "Hidden"}
              </button>
              <button onClick={() => removeImage(img.id)} className="text-red-400 hover:text-red-300">
                Delete
              </button>
            </div>
          </div>
        ))}
      </div>
    </section>
  );
}
