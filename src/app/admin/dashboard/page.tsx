import type { Metadata } from "next";
import AdminDashboardView from "@/components/AdminDashboardView";

export const metadata: Metadata = {
  title: "Admin Dashboard | RIZZVERSE'26",
  description: "Manage registrations and verify payments for RIZZVERSE'26.",
};

export default function DashboardPage() {
  return <AdminDashboardView />;
}
