"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { createClient } from "@/lib/supabase/client";

interface Stats {
  pendingBookings: number;
  todayBookings: number;
  todayWalkins: number;
  todayRevenue: number;
}

export default function AdminOverviewPage() {
  const [stats, setStats] = useState<Stats | null>(null);

  useEffect(() => {
    async function load() {
      const supabase = createClient();
      const today = new Date().toISOString().slice(0, 10);

      const [pending, todayBookings, walkins] = await Promise.all([
        supabase.from("bookings").select("id", { count: "exact", head: true }).eq("status", "pending"),
        supabase
          .from("bookings")
          .select("id", { count: "exact", head: true })
          .eq("preferred_date", today),
        supabase
          .from("walkins")
          .select("price_kes")
          .gte("served_at", `${today}T00:00:00`)
          .lte("served_at", `${today}T23:59:59`),
      ]);

      const todayRevenue = (walkins.data ?? []).reduce(
        (sum, w) => sum + Number(w.price_kes || 0),
        0
      );

      setStats({
        pendingBookings: pending.count ?? 0,
        todayBookings: todayBookings.count ?? 0,
        todayWalkins: walkins.data?.length ?? 0,
        todayRevenue,
      });
    }
    load();
  }, []);

  return (
    <div>
      <h1 className="font-display text-3xl text-cream">Overview</h1>
      <p className="mt-1 font-sans text-sm text-cream/50">A quick snapshot of today.</p>

      <div className="mt-8 grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <StatCard label="Pending requests" value={stats?.pendingBookings} href="/admin/bookings" />
        <StatCard label="Booked for today" value={stats?.todayBookings} href="/admin/bookings" />
        <StatCard label="Walk-ins today" value={stats?.todayWalkins} href="/admin/walkins" />
        <StatCard
          label="Walk-in revenue today"
          value={stats ? `KES ${stats.todayRevenue.toLocaleString()}` : undefined}
          href="/admin/sales"
        />
      </div>

      <div className="mt-10 grid gap-4 sm:grid-cols-3">
        <QuickLink href="/admin/walkins" label="Log a walk-in" />
        <QuickLink href="/admin/bookings" label="Review booking requests" />
        <QuickLink href="/admin/content" label="Edit services & hours" />
      </div>
    </div>
  );
}

function StatCard({ label, value, href }: { label: string; value?: number | string; href: string }) {
  return (
    <Link href={href} className="block border border-gold/15 bg-ink p-6 hover:border-gold/40">
      <p className="font-sans text-xs text-cream/50">{label}</p>
      <p className="mt-3 font-display text-3xl text-gold">{value ?? "—"}</p>
    </Link>
  );
}

function QuickLink({ href, label }: { href: string; label: string }) {
  return (
    <Link
      href={href}
      className="border border-gold/20 bg-ink px-5 py-4 text-center font-sans text-sm text-cream/80 hover:border-gold hover:text-gold"
    >
      {label}
    </Link>
  );
}
