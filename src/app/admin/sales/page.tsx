"use client";

import { useEffect, useMemo, useState } from "react";
import {
  Bar,
  BarChart,
  CartesianGrid,
  Line,
  LineChart,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from "recharts";
import { createClient } from "@/lib/supabase/client";

type Range = 7 | 30 | 90;

interface Row {
  date: string;
  amount: number;
  service: string;
  staff: string;
}

export default function SalesPage() {
  const supabase = createClient();
  const [range, setRange] = useState<Range>(30);
  const [rows, setRows] = useState<Row[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function load() {
      setLoading(true);
      const since = new Date();
      since.setDate(since.getDate() - range);
      const sinceStr = since.toISOString().slice(0, 10);

      const [{ data: walkins }, { data: bookings }] = await Promise.all([
        supabase
          .from("walkins")
          .select("price_kes, served_at, services:service_id(name), staff:staff_id(full_name)")
          .gte("served_at", sinceStr),
        supabase
          .from("bookings")
          .select("preferred_date, status, services:service_id(name, price_kes), staff:staff_id(full_name)")
          .eq("status", "completed")
          .gte("preferred_date", sinceStr),
      ]);

      const walkinRows: Row[] = (walkins ?? []).map((w: any) => ({
        date: String(w.served_at).slice(0, 10),
        amount: Number(w.price_kes || 0),
        service: w.services?.name ?? "Unspecified",
        staff: w.staff?.full_name ?? "Unassigned",
      }));

      const bookingRows: Row[] = (bookings ?? []).map((b: any) => ({
        date: b.preferred_date,
        amount: Number(b.services?.price_kes || 0),
        service: b.services?.name ?? "Unspecified",
        staff: b.staff?.full_name ?? "Unassigned",
      }));

      setRows([...walkinRows, ...bookingRows]);
      setLoading(false);
    }
    load();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [range]);

  const byDate = useMemo(() => {
    const map = new Map<string, number>();
    rows.forEach((r) => map.set(r.date, (map.get(r.date) ?? 0) + r.amount));
    return Array.from(map.entries())
      .sort(([a], [b]) => a.localeCompare(b))
      .map(([date, amount]) => ({ date: date.slice(5), amount }));
  }, [rows]);

  const byService = useMemo(() => {
    const map = new Map<string, number>();
    rows.forEach((r) => map.set(r.service, (map.get(r.service) ?? 0) + r.amount));
    return Array.from(map.entries())
      .sort(([, a], [, b]) => b - a)
      .slice(0, 8)
      .map(([service, amount]) => ({ service, amount }));
  }, [rows]);

  const byStaff = useMemo(() => {
    const map = new Map<string, number>();
    rows.forEach((r) => map.set(r.staff, (map.get(r.staff) ?? 0) + r.amount));
    return Array.from(map.entries())
      .sort(([, a], [, b]) => b - a)
      .map(([staff, amount]) => ({ staff, amount }));
  }, [rows]);

  const total = rows.reduce((sum, r) => sum + r.amount, 0);

  return (
    <div>
      <div className="flex flex-wrap items-center justify-between gap-4">
        <div>
          <h1 className="font-display text-3xl text-cream">Sales</h1>
          <p className="mt-1 font-sans text-sm text-cream/50">
            Revenue from walk-ins and completed bookings.
          </p>
        </div>
        <div className="flex gap-2 font-sans text-sm">
          {[7, 30, 90].map((r) => (
            <button
              key={r}
              onClick={() => setRange(r as Range)}
              className={`border px-4 py-2 ${
                range === r ? "border-gold text-gold" : "border-gold/20 text-cream/60"
              }`}
            >
              {r === 7 ? "Week" : r === 30 ? "Month" : "90 days"}
            </button>
          ))}
        </div>
      </div>

      <div className="mt-6 border border-gold/15 bg-ink p-6">
        <p className="font-sans text-xs text-cream/50">Total revenue, last {range} days</p>
        <p className="mt-2 font-display text-4xl text-gold">KES {total.toLocaleString()}</p>
      </div>

      {loading ? (
        <p className="mt-8 font-sans text-sm text-cream/40">Loading…</p>
      ) : (
        <div className="mt-8 space-y-10">
          <ChartCard title="Revenue over time">
            <ResponsiveContainer width="100%" height={260}>
              <LineChart data={byDate}>
                <CartesianGrid stroke="#c9a24b22" vertical={false} />
                <XAxis dataKey="date" stroke="#f3ecd980" fontSize={12} />
                <YAxis stroke="#f3ecd980" fontSize={12} width={70} />
                <Tooltip
                  contentStyle={{ background: "#141312", border: "1px solid #c9a24b40", color: "#f3ecd9" }}
                  formatter={(v: number) => [`KES ${v.toLocaleString()}`, "Revenue"]}
                />
                <Line type="monotone" dataKey="amount" stroke="#c9a24b" strokeWidth={2} dot={false} />
              </LineChart>
            </ResponsiveContainer>
          </ChartCard>

          <div className="grid gap-10 lg:grid-cols-2">
            <ChartCard title="Revenue by service">
              <ResponsiveContainer width="100%" height={280}>
                <BarChart data={byService} layout="vertical" margin={{ left: 20 }}>
                  <CartesianGrid stroke="#c9a24b22" horizontal={false} />
                  <XAxis type="number" stroke="#f3ecd980" fontSize={12} />
                  <YAxis dataKey="service" type="category" stroke="#f3ecd980" fontSize={12} width={130} />
                  <Tooltip
                    contentStyle={{ background: "#141312", border: "1px solid #c9a24b40", color: "#f3ecd9" }}
                    formatter={(v: number) => [`KES ${v.toLocaleString()}`, "Revenue"]}
                  />
                  <Bar dataKey="amount" fill="#c9a24b" />
                </BarChart>
              </ResponsiveContainer>
            </ChartCard>

            <ChartCard title="Revenue by staff member">
              <ResponsiveContainer width="100%" height={280}>
                <BarChart data={byStaff} layout="vertical" margin={{ left: 20 }}>
                  <CartesianGrid stroke="#c9a24b22" horizontal={false} />
                  <XAxis type="number" stroke="#f3ecd980" fontSize={12} />
                  <YAxis dataKey="staff" type="category" stroke="#f3ecd980" fontSize={12} width={130} />
                  <Tooltip
                    contentStyle={{ background: "#141312", border: "1px solid #c9a24b40", color: "#f3ecd9" }}
                    formatter={(v: number) => [`KES ${v.toLocaleString()}`, "Revenue"]}
                  />
                  <Bar dataKey="amount" fill="#e4cf9c" />
                </BarChart>
              </ResponsiveContainer>
            </ChartCard>
          </div>
        </div>
      )}
    </div>
  );
}

function ChartCard({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <div className="border border-gold/15 bg-ink p-6">
      <p className="font-sans text-sm text-cream/70">{title}</p>
      <div className="mt-4">{children}</div>
    </div>
  );
}
