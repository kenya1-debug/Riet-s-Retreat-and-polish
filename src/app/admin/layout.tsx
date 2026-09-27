import AdminShell from "@/components/admin/AdminShell";

export const metadata = { title: "Admin — Riet's Retreat and Polish", robots: "noindex, nofollow" };

export default function AdminLayout({ children }: { children: React.ReactNode }) {
  return <AdminShell>{children}</AdminShell>;
}
