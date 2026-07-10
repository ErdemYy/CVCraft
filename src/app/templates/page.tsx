import { redirect } from "next/navigation";
import { getSession } from "@/lib/session";
import TemplatesClient from "@/components/templates/TemplatesClient";

export default async function TemplatesPage() {
  const user = await getSession();
  if (!user) redirect("/login");

  return <TemplatesClient user={user} />;
}
