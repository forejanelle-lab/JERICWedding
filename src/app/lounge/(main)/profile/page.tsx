import { getLoungeSession } from "@/lib/lounge/auth";
import { LoungePageHeader } from "@/components/lounge/LoungePageHeader";
import { ProfileForm } from "@/components/portal/ProfileForm";

export default async function LoungeProfilePage() {
  const session = await getLoungeSession();

  return (
    <div>
      <LoungePageHeader
        title="My Profile"
        script={session?.guestName ?? "Guest"}
        description="Update how you appear in the guest directory and control what you share."
      />
      <div className="max-w-xl">
        <ProfileForm />
      </div>
    </div>
  );
}
