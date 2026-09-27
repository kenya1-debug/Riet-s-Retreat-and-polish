"use client";

import { useEffect, useState, type FormEvent } from "react";
import { createClient } from "@/lib/supabase/client";
import type { Service, Staff, Walkin } from "@/lib/types";

export default function WalkinsPage() {
  const supabase = createClient();
  const [walkins, setWalkins] = useState<Walkin[]>([]);
  const [services, setServices] = useState<Service[]>([]);
  const [staff, setStaff] = useState<Staff[]>([]);
  const [saving, setSaving] = useState(false);

  async function load() {
    const [{ data: w }, { data: s }, { data: st }] = await Promise.all([
      supabase
        .from("walkins")
        .select("*, services:service_id(name), staff:staff_id(full_name)")
        .order("served_at", { ascending: false })
        .limit(50),
      supabase.from("services").select("*").eq("active", true).order("sort_order"),
      supabase.from("staff").select("*").eq("active", true),
    ]);
    setWalkins((w ?? []) as unknown as Walkin[]);
    setServices((s ?? []) as Service[]);
    setStaff((st ?? []) as Staff[]);
  }

  useEffect(() => {
    load();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  async function logWalkin(e: FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setSaving(true);
    const form = new FormData(e.currentTarget);
    const serviceId = String(form.get("service_id") || "") || null;
    const matchedService = services.find((s) => s.id === serviceId);

    await supabase.from("walkins").insert({
      customer_name: String(form.get("customer_name")),
      service_id: serviceId,
      staff_id: String(form.get("staff_id") || "") || null,
      price_kes: Number(form.get("price_kes")) || Number(matchedService?.price_kes || 0),
    });

    (e.target as HTMLFormElement).reset();
    setSaving(false);
    load();
  }

  async function removeWalkin(id: string) {
    if (!confirm("Delete this walk-in entry?")) return;
    await supabase.from("walkins").delete().eq("id", id);
    load();
  }

  return (
    <div>
      <h1 className="font-display text-3xl text-cream">Walk-ins</h1>
      <p className="mt-1 font-sans text-sm text-cream/50">
        Log customers served without an online booking.
      </p>

      <form onSubmit={logWalkin} className="mt-6 grid gap-4 border border-gold/15 bg-ink p-6 sm:grid-cols-5">
        <input name="customer_name" placeholder="Customer name" required className="input sm:col-span-2" />
        <select name="service_id" className="input">
          <option value="">Service</option>
          {services.map((s) => (
            <option key={s.id} value={s.id}>
              {s.name}
            </option>
          ))}
        </select>
        <select name="staff_id" className="input" required>
          <option value="">Served by</option>
          {staff.map((s) => (
            <option key={s.id} value={s.id}>
              {s.full_name}
            </option>
          ))}
        </select>
        <input
          name="price_kes"
          type="number"
          min="0"
          step="1"
          placeholder="Price (KES)"
          className="input"
        />
        <button
          disabled={saving}
          className="col-span-full bg-gold px-4 py-3 font-sans text-sm text-ink hover:bg-gold-soft disabled:opacity-60 sm:col-span-1"
        >
          {saving ? "Saving..." : "Log walk-in"}
        </button>
      </form>

      <div className="mt-6 overflow-x-auto border border-gold/15">
        <table className="w-full text-left font-sans text-sm">
          <thead className="border-b border-gold/15 text-cream/50">
            <tr>
              <th className="px-4 py-3">When</th>
              <th className="px-4 py-3">Customer</th>
              <th className="px-4 py-3">Service</th>
              <th className="px-4 py-3">Staff</th>
              <th className="px-4 py-3">Price</th>
              <th className="px-4 py-3" />
            </tr>
          </thead>
          <tbody>
            {walkins.map((w) => (
              <tr key={w.id} className="border-b border-gold/10 last:border-0">
                <td className="px-4 py-3 text-cream/60">
                  {new Date(w.served_at).toLocaleString("en-KE", {
                    dateStyle: "medium",
                    timeStyle: "short",
                  })}
                </td>
                <td className="px-4 py-3">{w.customer_name}</td>
                <td className="px-4 py-3 text-cream/70">{w.services?.name ?? "—"}</td>
                <td className="px-4 py-3 text-cream/70">{w.staff?.full_name ?? "—"}</td>
                <td className="px-4 py-3 text-gold">KES {Number(w.price_kes).toLocaleString()}</td>
                <td className="px-4 py-3 text-right">
                  <button onClick={() => removeWalkin(w.id)} className="text-red-400 hover:text-red-300">
                    Delete
                  </button>
                </td>
              </tr>
            ))}
            {walkins.length === 0 && (
              <tr>
                <td colSpan={6} className="px-4 py-6 text-center text-cream/40">
                  No walk-ins logged yet.
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}
