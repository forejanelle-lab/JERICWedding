"use client";

import Link from "next/link";
import { usePathname, useSearchParams } from "next/navigation";
import { canTogglePageHidden, isPageTemporarilyHidden } from "@/lib/hub/access";
import { useHub } from "@/lib/hub/store";

export function AdminBar() {
  const { state, signOut, setSiteEditing, togglePageHidden } = useHub();
  const pathname = usePathname();
  const search = useSearchParams();
  if (!state.adminAuthed) return null;

  const onGate = pathname === "/" && (search.get("view") === "gate" || !state.identity);
  const editing = state.siteEditing;
  const hideable = !onGate && canTogglePageHidden(pathname);
  const hidden = hideable && isPageTemporarilyHidden(state, pathname);

  return (
    <div className="fixed inset-x-0 bottom-4 z-[70] flex justify-center px-4 pointer-events-none">
      <div className="pointer-events-auto flex max-w-full flex-wrap items-center justify-center gap-x-3 gap-y-2 rounded-full border border-[#2D3B2D]/20 bg-[#2D3B2D] px-5 py-2.5 text-[#F9F7F2] shadow-[0_12px_30px_rgba(45,59,45,0.25)]">
        <p className="font-sans text-[0.58rem] uppercase tracking-[0.16em]">
          {hidden ? "Hidden from guests" : editing ? "Editing — Edit a line, then Save" : "Admin"}
        </p>
        {hideable ? (
          <button
            type="button"
            className={
              hidden
                ? "rounded-full bg-[#F9F7F2] px-3 py-1 font-sans text-[0.58rem] uppercase tracking-[0.16em] text-[#2D3B2D]"
                : "font-sans text-[0.58rem] uppercase tracking-[0.16em] text-[#F9F7F2]/80 hover:text-[#F9F7F2]"
            }
            onClick={() => togglePageHidden(pathname)}
          >
            {hidden ? "Unhide" : "Hide page"}
          </button>
        ) : null}
        <button
          type="button"
          className="rounded-full bg-[#F9F7F2] px-3 py-1 font-sans text-[0.58rem] uppercase tracking-[0.16em] text-[#2D3B2D]"
          onClick={() => setSiteEditing(!editing)}
        >
          {editing ? "Save" : "Edit"}
        </button>
        <Link
          href={onGate ? "/" : "/?view=gate"}
          className="font-sans text-[0.58rem] uppercase tracking-[0.16em] text-[#F9F7F2]/80 hover:text-[#F9F7F2]"
        >
          {onGate ? "Site home" : "Welcome screen"}
        </Link>
        <Link href="/admin" className="font-sans text-[0.58rem] uppercase tracking-[0.16em] text-[#F9F7F2]/80 hover:text-[#F9F7F2]">
          Admin
        </Link>
        <button
          type="button"
          className="font-sans text-[0.58rem] uppercase tracking-[0.16em] text-[#F9F7F2]/80 hover:text-[#F9F7F2]"
          onClick={() => void signOut()}
        >
          Sign out
        </button>
      </div>
    </div>
  );
}
