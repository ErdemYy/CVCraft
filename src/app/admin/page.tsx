import { redirect } from "next/navigation";
import { getSession } from "@/lib/session";
import AdminClient from "@/components/admin/AdminClient";

export default async function AdminPage() {
  const user = await getSession();
  if (!user) redirect("/login");
  if (user.role !== "admin") redirect("/dashboard");

  return <AdminClient user={user} />;
}
