import { getGateSession } from "@/lib/gate/auth";
import { RsvpWizard } from "@/components/site/RsvpWizard";

export default async function RsvpPage() {
  const session = await getGateSession();
  const initialName = [session?.firstName, session?.lastName].filter(Boolean).join(" ").trim();
  return <RsvpWizard initialName={initialName} />;
}
