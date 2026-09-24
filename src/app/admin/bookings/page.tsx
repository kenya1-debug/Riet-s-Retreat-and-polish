"use client";

import { useEffect, useState } from "react";
import { createClient } from "@/lib/supabase/client";
import type { Booking, BookingStatus, BookingType, Staff } from "@/lib/types";

const STATUSES: BookingStatus[] = ["pending", "confirmed", "completed", "cancelled"];

export default function BookingsPage() {
  const supabase = createClient();
  const [bookings, setBookings] = useState<Booking[]>([]);
  const [staff, setStaff] = useState<Staff[]>([]);
  const [typeFilter, setTypeFilter] = useState<"all" | BookingType>("all");
  const [statusFilter, setStatusFilter] = useState<"all" | BookingStatus>("all");
  const [loading, setLoading] = useState(true);

  async function load() {
    setLoading(true);
    let query = supabase
      .from("bookings")
      .select("*, services:service_id(name, price_kes), staff:staff_id(full_name)")
      .order("preferred_date", { ascending: false })
      .order("preferred_time", { ascending: false });

    if (typeFilter !== "all") query = query.eq("type", typeFilter);
    if (statusFilter !== "all") query = query.eq("status", statusFilter);

    const [{ data }, { data: staffData }] = await Promise.all([
      query,
      supabase.from("staff").select("*").eq("active", true),
    ]);
    setBookings((data ?? []) as unknown as Booking[]);
    setStaff((staffData ?? []) as Staff[]);
    setLoading(false);
  }

  useEffect(() => {
    load();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [typeFilter, statusFilter]);

  async function updateBooking(id: string, patch: Partial<Booking>) {
    await supabase.from("bookings").update(patch).eq("id", id);
    load();
  }

  async function removeBooking(id: string) {
    if (!confirm("Delete this booking permanently?")) return;
    await supabase.from("bookings").delete().eq("id", id);
    load();
  }

  return (
    <div>
      <h1 className="font-display text-3xl text-cream">Bookings</h1>
      <p className="mt-1 font-sans text-sm text-cream/50">
        In-salon appointments and home / call-in requests, in one place.
      </p>

      <div className="mt-6 flex flex-wrap gap-3 font-sans text-sm">
        {(["all", "in_salon", "call_in"] as const).map((t) => (
          <button
            key={t}
            onClick={() => setTypeFilter(t)}
            className={`border px-4 py-2 ${
              typeFilter === t ? "border-gold text-gold" : "border-gold/20 text-cream/60"
            }`}
          >
            {t === "all" ? "All types" : t === "in_salon" ? "In-salon" : "Call-in / house"}
          </button>
        ))}
        <span className="mx-1 self-center text-cream/20">|</span>
        {(["all", ...STATUSES] as const).map((s) => (
          <button
            key={s}
            onClick={() => setStatusFilter(s)}
            className={`border px-4 py-2 capitalize ${
              statusFilter === s ? "border-gold text-gold" : "border-gold/20 text-cream/60"
            }`}
          >
            {s}
          </button>
        ))}
      </div>

      <div className="mt-6 space-y-4">
        {loading && <p className="font-sans text-sm text-cream/40">Loading…</p>}
        {!loading && bookings.length === 0 && (
          <p className="border border-gold/15 bg-ink px-6 py-8 text-center font-sans text-sm text-cream/40">
            No bookings match these filters.
          </p>
        )}

        {bookings.map((b) => (
          <div key={b.id} className="border border-gold/15 bg-ink p-5">
            <div className="flex flex-wrap items-start justify-between gap-4">
              <div>
                <p className="font-display text-lg text-cream">
                  {b.customer_name}{" "}
                  <span className="font-sans text-xs uppercase tracking-wide text-cream/40">
                    {b.type === "call_in" ? "House call" : "In-salon"}
                  </span>
                </p>
                <p className="mt-1 font-sans text-sm text-cream/60">
                  {b.preferred_date} at {b.preferred_time} · {b.services?.name ?? "No service selected"}
                  {b.services?.price_kes ? ` · KES ${Number(b.services.price_kes).toLocaleString()}` : ""}
                </p>
                <p className="mt-1 font-sans text-sm text-cream/50">
                  {b.phone} {b.email ? `· ${b.email}` : ""}
                </p>
                {b.address && <p className="mt-1 font-sans text-sm text-cream/50">📍 {b.address}</p>}
                {b.notes && <p className="mt-2 font-body text-sm italic text-cream/50">&ldquo;{b.notes}&rdquo;</p>}
              </div>

              <div className="flex flex-col items-end gap-2">
                <select
                  value={b.status}
                  onChange={(e) => updateBooking(b.id, { status: e.target.value as BookingStatus })}
                  className="input py-1.5 capitalize"
                >
                  {STATUSES.map((s) => (
                    <option key={s} value={s}>
                      {s}
                    </option>
                  ))}
                </select>
                <select
                  value={b.staff_id ?? ""}
                  onChange={(e) => updateBooking(b.id, { staff_id: e.target.value || null })}
                  className="input py-1.5"
                >
                  <option value="">Assign staff</option>
                  {staff.map((s) => (
                    <option key={s.id} value={s.id}>
                      {s.full_name}
                    </option>
                  ))}
                </select>
              </div>
            </div>

            <div className="mt-4 flex flex-wrap items-center gap-4 border-t border-gold/10 pt-4">
              <RescheduleControls booking={b} onSave={(patch) => updateBooking(b.id, patch)} />
              <button
                onClick={() => removeBooking(b.id)}
                className="ml-auto font-sans text-xs text-red-400 hover:text-red-300"
              >
                Delete
              </button>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

function RescheduleControls({
  booking,
  onSave,
}: {
  booking: Booking;
  onSave: (patch: Partial<Booking>) => void;
}) {
  const [date, setDate] = useState(booking.preferred_date);
  const [time, setTime] = useState(booking.preferred_time);

  return (
    <div className="flex flex-wrap items-center gap-2 font-sans text-sm">
      <span className="text-cream/40">Reschedule:</span>
      <input type="date" value={date} onChange={(e) => setDate(e.target.value)} className="input py-1.5" />
      <input type="time" value={time} onChange={(e) => setTime(e.target.value)} className="input py-1.5" />
      <button
        onClick={() => onSave({ preferred_date: date, preferred_time: time })}
        className="border border-gold/40 px-3 py-1.5 text-gold hover:bg-gold hover:text-ink"
      >
        Save
      </button>
    </div>
  );
}
