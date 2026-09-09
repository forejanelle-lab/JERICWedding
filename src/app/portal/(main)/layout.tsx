import { PortalNav } from "@/components/portal/PortalNav";

export default function PortalMainLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <>
      <PortalNav />
      <div className="mx-auto max-w-6xl px-6 py-12 md:px-10 md:py-16">{children}</div>
    </>
  );
}
