import Link from "next/link";
import { getSession } from "@/lib/session";
import LandingClient from "@/components/landing/LandingClient";

export default async function HomePage() {
  const user = await getSession();

  return <LandingClient user={user} />;
}
