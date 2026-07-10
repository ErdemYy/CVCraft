import { redirect } from "next/navigation";
import { getSession } from "@/lib/session";
import EditorClient from "@/components/editor/EditorClient";

export default async function EditorPage() {
  const user = await getSession();
  if (!user) redirect("/login");

  return <EditorClient user={user} />;
}
