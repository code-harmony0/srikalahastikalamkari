import { cookies } from "next/headers";
import { redirect } from "next/navigation";
import DashboardLayout from "@/app/dashboard/components/DashboardLayout";
import {
  ADMIN_SESSION_COOKIE,
  verifyAdminSessionToken,
} from "@/shared/lib/admin-session";

// Defence in depth: the middleware already gates /dashboard, but a guard here
// means the pages never render if that matcher is ever narrowed or bypassed.
export default async function AdminDashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const cookieStore = await cookies();
  const session = await verifyAdminSessionToken(
    cookieStore.get(ADMIN_SESSION_COOKIE)?.value,
  );

  if (!session) {
    redirect("/admin/login?redirect=/dashboard");
  }

  return <DashboardLayout>{children}</DashboardLayout>;
}
