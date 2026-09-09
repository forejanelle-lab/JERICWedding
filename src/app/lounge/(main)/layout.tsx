import { getLoungeSession } from "@/lib/lounge/auth";
import { LoungeNav } from "@/components/lounge/LoungeNav";
import { LoungeMobileNav } from "@/components/lounge/LoungeMobileNav";

export default async function LoungeMainLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const session = await getLoungeSession();
  const guestName = session?.guestName ?? "Guest";

  return (
    <>
      <LoungeNav guestName={guestName} />
      <div className="mx-auto max-w-7xl px-6 py-10 pb-28 md:px-10 md:py-14 md:pb-14">
        {children}
      </div>
      <LoungeMobileNav />
    </>
  );
}
