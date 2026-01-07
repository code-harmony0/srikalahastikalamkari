import { redirect } from "next/navigation"

export default function DashboardRoot() {
  // Redirect to dashboard home
  redirect("/dashboard/dashboard-home")
}
