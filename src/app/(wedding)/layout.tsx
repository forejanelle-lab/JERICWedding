import { SiteChrome } from "@/components/site/SiteChrome";
import { getGateSession } from "@/lib/gate/auth";

export default async function WeddingLayout({ children }: { children: React.ReactNode }) {
  const session = await getGateSession();
  return <SiteChrome unlocked={Boolean(session)}>{children}</SiteChrome>;
}
