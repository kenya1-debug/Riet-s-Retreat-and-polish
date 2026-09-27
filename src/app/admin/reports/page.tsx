"use client";

import { useEffect, useState } from "react";
import { createClient } from "@/lib/supabase/client";

function isoDaysAgo(n: number) {
  const d = new Date();
  d.setDate(d.getDate() - n);
  return d.toISOString().slice(0, 10);
}

export default function ReportsPage() {
  const supabase = createClient();
  const [start, setStart] = useState(isoDaysAgo(30));
  const [end, setEnd] = useState(isoDaysAgo(0));
  const [loading, setLoading] = useState(true);

  const [totals, setTotals] = useState({
    bookings: 0,
    walkins: 0,
    revenue: 0,
  });
  const [popular, setPopular] = useState<{ name: string; count: number }[]>([]);

  useEffect(() => {
    async function load() {
      setLoading(true);

      const [{ data: bookings }, { data: walkins }] = await Promise.all([
        supabase
          .from("bookings")
          .select("id, status, services:service_id(name, price_kes)")
          .gte("preferred_date", start)
          .lte("preferred_date", end),
        supabase
          .from("walkins")
          .select("id, price_kes, services:service_id(name)")
          .gte("served_at", start)
          .lte("served_at", `${end}T23:59:59`),
      ]);

      const bookingRows = (bookings ?? []) as any[];
      const walkinRows = (walkins ?? []) as any[];

      const completedRevenue = bookingRows
        .filter((b) => b.status === "completed")
        .reduce((sum, b) => sum + Number(b.services?.price_kes || 0), 0);
      const walkinRevenue = walkinRows.reduce((sum, w) => sum + Number(w.price_kes || 0), 0);

      const serviceCounts = new Map<string, number>();
      [...bookingRows, ...walkinRows].forEach((r) => {
        const name = r.services?.name ?? "Unspecified";
        serviceCounts.set(name, (serviceCounts.get(name) ?? 0) + 1);
      });

      setTotals({
        bookings: bookingRows.length,
        walkins: walkinRows.length,
        revenue: completedRevenue + walkinRevenue,
      });
      setPopular(
        Array.from(serviceCounts.entries())
          .sort(([, a], [, b]) => b - a)
          .slice(0, 6)
          .map(([name, count]) => ({ name, count }))
      );
      setLoading(false);
    }
    load();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [start, end]);

  return (
    <div>
      <h1 className="font-display text-3xl text-cream">Reports</h1>
      <p className="mt-1 font-sans text-sm text-cream/50">
        Totals and most popular services for a chosen date range.
      </p>

      <div className="mt-6 flex flex-wrap items-end gap-4 border border-gold/15 bg-ink p-6">
        <div>
          <label className="block font-sans text-xs text-cream/50">From</label>
          <input type="date" value={start} onChange={(e) => setStart(e.target.value)} className="input mt-1" />
        </div>
        <div>
          <label className="block font-sans text-xs text-cream/50">To</label>
          <input type="date" value={end} onChange={(e) => setEnd(e.target.value)} className="input mt-1" />
        </div>
      </div>

      {loading ? (
        <p className="mt-8 font-sans text-sm text-cream/40">Loading…</p>
      ) : (
        <>
          <div className="mt-8 grid gap-4 sm:grid-cols-3">
            <ReportStat label="Total bookings" value={totals.bookings} />
            <ReportStat label="Total walk-ins" value={totals.walkins} />
            <ReportStat label="Total revenue" value={`KES ${totals.revenue.toLocaleString()}`} />
          </div>

          <div className="mt-10 border border-gold/15">
            <p className="border-b border-gold/15 bg-ink px-6 py-4 font-sans text-sm text-cream/70">
              Most popular services
            </p>
            <table className="w-full text-left font-sans text-sm">
              <tbody>
                {popular.map((p, i) => (
                  <tr key={p.name} className="border-b border-gold/10 last:border-0">
                    <td className="px-6 py-3 text-cream/40">{i + 1}</td>
                    <td className="px-6 py-3 text-cream">{p.name}</td>
                    <td className="px-6 py-3 text-right text-gold">{p.count} bookings</td>
                  </tr>
                ))}
                {popular.length === 0 && (
                  <tr>
                    <td colSpan={3} className="px-6 py-6 text-center text-cream/40">
                      No activity in this range yet.
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </>
      )}
    </div>
  );
}

function ReportStat({ label, value }: { label: string; value: string | number }) {
  return (
    <div className="border border-gold/15 bg-ink p-6">
      <p className="font-sans text-xs text-cream/50">{label}</p>
      <p className="mt-2 font-display text-3xl text-gold">{value}</p>
    </div>
  );
}
