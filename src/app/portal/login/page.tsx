import { redirect } from "next/navigation";

export default function PortalLoginRedirectPage() {
  redirect("/lounge/login");
}
