import { redirect } from "next/navigation";
import { getSession } from "@/lib/session";
import DashboardClient from "@/components/dashboard/DashboardClient";

export default async function DashboardPage() {
  const user = await getSession();
  if (!user) redirect("/login");
  if (user.role === "admin") redirect("/admin");

  return <DashboardClient user={user} />;
}
