"use client";

import { useEffect, useState, type FormEvent } from "react";
import { createClient } from "@/lib/supabase/client";
import type { Shift, Staff, StaffRole } from "@/lib/types";

const ROLES: StaffRole[] = ["stylist", "barber", "receptionist", "manager"];

export default function StaffPage() {
  const supabase = createClient();
  const [staff, setStaff] = useState<Staff[]>([]);
  const [shifts, setShifts] = useState<Shift[]>([]);
  const [editingId, setEditingId] = useState<string | null>(null);

  async function loadAll() {
    const [{ data: s }, { data: sh }] = await Promise.all([
      supabase.from("staff").select("*").order("created_at"),
      supabase.from("shifts").select("*").order("shift_date", { ascending: false }).limit(20),
    ]);
    setStaff((s ?? []) as Staff[]);
    setShifts((sh ?? []) as Shift[]);
  }

  useEffect(() => {
    loadAll();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  async function addStaff(e: FormEvent<HTMLFormElement>) {
    e.preventDefault();
    const form = new FormData(e.currentTarget);
    await supabase.from("staff").insert({
      full_name: String(form.get("full_name")),
      role: String(form.get("role")),
      phone: String(form.get("phone") || ""),
      email: String(form.get("email") || ""),
    });
    (e.target as HTMLFormElement).reset();
    loadAll();
  }

  async function updateStaff(id: string, patch: Partial<Staff>) {
    await supabase.from("staff").update(patch).eq("id", id);
    loadAll();
  }

  async function removeStaff(id: string) {
    if (!confirm("Remove this staff member? This cannot be undone.")) return;
    await supabase.from("staff").delete().eq("id", id);
    loadAll();
  }

  async function addShift(e: FormEvent<HTMLFormElement>) {
    e.preventDefault();
    const form = new FormData(e.currentTarget);
    await supabase.from("shifts").insert({
      staff_id: String(form.get("staff_id")),
      shift_date: String(form.get("shift_date")),
      start_time: String(form.get("start_time")),
      end_time: String(form.get("end_time")),
    });
    (e.target as HTMLFormElement).reset();
    loadAll();
  }

  async function removeShift(id: string) {
    await supabase.from("shifts").delete().eq("id", id);
    loadAll();
  }

  return (
    <div className="space-y-14">
      <div>
        <h1 className="font-display text-3xl text-cream">Staff</h1>
        <p className="mt-1 font-sans text-sm text-cream/50">
          Add team members, assign roles, and remove staff who have left.
        </p>

        <form onSubmit={addStaff} className="mt-6 grid gap-4 border border-gold/15 bg-ink p-6 sm:grid-cols-5">
          <input name="full_name" placeholder="Full name" required className="input sm:col-span-2" />
          <select name="role" defaultValue="stylist" className="input">
            {ROLES.map((r) => (
              <option key={r} value={r}>
                {r}
              </option>
            ))}
          </select>
          <input name="phone" placeholder="Phone" className="input" />
          <button className="bg-gold px-4 py-3 font-sans text-sm text-ink hover:bg-gold-soft">
            Add staff
          </button>
        </form>

        <div className="mt-6 overflow-x-auto border border-gold/15">
          <table className="w-full text-left font-sans text-sm">
            <thead className="border-b border-gold/15 text-cream/50">
              <tr>
                <th className="px-4 py-3">Name</th>
                <th className="px-4 py-3">Role</th>
                <th className="px-4 py-3">Phone</th>
                <th className="px-4 py-3">Status</th>
                <th className="px-4 py-3" />
              </tr>
            </thead>
            <tbody>
              {staff.map((s) => (
                <tr key={s.id} className="border-b border-gold/10 last:border-0">
                  <td className="px-4 py-3">{s.full_name}</td>
                  <td className="px-4 py-3">
                    {editingId === s.id ? (
                      <select
                        defaultValue={s.role}
                        onChange={(e) => updateStaff(s.id, { role: e.target.value as StaffRole })}
                        className="input py-1"
                      >
                        {ROLES.map((r) => (
                          <option key={r} value={r}>
                            {r}
                          </option>
                        ))}
                      </select>
                    ) : (
                      <span className="capitalize text-cream/70">{s.role}</span>
                    )}
                  </td>
                  <td className="px-4 py-3 text-cream/70">{s.phone || "—"}</td>
                  <td className="px-4 py-3">
                    <button
                      onClick={() => updateStaff(s.id, { active: !s.active })}
                      className={s.active ? "text-gold" : "text-cream/40"}
                    >
                      {s.active ? "Active" : "Inactive"}
                    </button>
                  </td>
                  <td className="space-x-3 px-4 py-3 text-right">
                    <button
                      onClick={() => setEditingId(editingId === s.id ? null : s.id)}
                      className="text-cream/60 hover:text-gold"
                    >
                      {editingId === s.id ? "Done" : "Edit role"}
                    </button>
                    <button onClick={() => removeStaff(s.id)} className="text-red-400 hover:text-red-300">
                      Remove
                    </button>
                  </td>
                </tr>
              ))}
              {staff.length === 0 && (
                <tr>
                  <td colSpan={5} className="px-4 py-6 text-center text-cream/40">
                    No staff added yet.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>

      <div>
        <h2 className="font-display text-2xl text-cream">Shifts</h2>
        <p className="mt-1 font-sans text-sm text-cream/50">
          Track which staff member is working which shift.
        </p>

        <form onSubmit={addShift} className="mt-6 grid gap-4 border border-gold/15 bg-ink p-6 sm:grid-cols-5">
          <select name="staff_id" required className="input sm:col-span-2">
            <option value="">Staff member</option>
            {staff.map((s) => (
              <option key={s.id} value={s.id}>
                {s.full_name}
              </option>
            ))}
          </select>
          <input type="date" name="shift_date" required className="input" />
          <input type="time" name="start_time" required className="input" />
          <input type="time" name="end_time" required className="input" />
          <button className="col-span-full bg-gold px-4 py-3 font-sans text-sm text-ink hover:bg-gold-soft sm:col-span-1">
            Add shift
          </button>
        </form>

        <div className="mt-6 overflow-x-auto border border-gold/15">
          <table className="w-full text-left font-sans text-sm">
            <thead className="border-b border-gold/15 text-cream/50">
              <tr>
                <th className="px-4 py-3">Date</th>
                <th className="px-4 py-3">Staff</th>
                <th className="px-4 py-3">Time</th>
                <th className="px-4 py-3" />
              </tr>
            </thead>
            <tbody>
              {shifts.map((sh) => (
                <tr key={sh.id} className="border-b border-gold/10 last:border-0">
                  <td className="px-4 py-3">{sh.shift_date}</td>
                  <td className="px-4 py-3">
                    {staff.find((s) => s.id === sh.staff_id)?.full_name ?? "—"}
                  </td>
                  <td className="px-4 py-3 text-cream/70">
                    {sh.start_time} – {sh.end_time}
                  </td>
                  <td className="px-4 py-3 text-right">
                    <button onClick={() => removeShift(sh.id)} className="text-red-400 hover:text-red-300">
                      Remove
                    </button>
                  </td>
                </tr>
              ))}
              {shifts.length === 0 && (
                <tr>
                  <td colSpan={4} className="px-4 py-6 text-center text-cream/40">
                    No shifts scheduled yet.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
