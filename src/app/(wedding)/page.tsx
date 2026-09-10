import { GatePage } from "@/components/home/GatePage";
import { HomePage } from "@/components/home/HomePage";
import { getGateSession, hasAdminCookie } from "@/lib/gate/auth";
import { safeNextPath } from "@/lib/gate/session";

export default async function Page({
  searchParams,
}: {
  searchParams: Promise<{ next?: string; error?: string; view?: string }>;
}) {
  const session = await getGateSession();
  const admin = await hasAdminCookie();
  const params = await searchParams;

  if (!session || (admin && params.view === "gate")) {
    return <GatePage next={safeNextPath(params.next)} />;
  }

  return <HomePage guestFirstName={session.firstName} />;
}
