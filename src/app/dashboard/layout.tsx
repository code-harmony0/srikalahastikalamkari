import DashboardLayout from "@/dashboard/components/DashboardLayout"

export default function AdminDashboardLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return <DashboardLayout>{children}</DashboardLayout>
}
