"use client";

import { useEffect, useRef } from "react";
import { isCoupleAdmin } from "@/lib/hub/content";
import { useHub } from "@/lib/hub/store";
import type { GateSession } from "@/lib/gate/session";
import { reportSiteVisit } from "@/lib/visits/client";

export function ApplyGateIdentity({ session }: { session: GateSession }) {
  const { join, enableAdmin, logoutAdmin, updateIdentityFromGate, recordGuestEntry, state, ready } = useHub();
  const joining = useRef(false);

  useEffect(() => {
    if (!session.firstName) return;
    const day = new Date().toISOString().slice(0, 10);
    const key = `jeric-visit-${day}-${session.email || `${session.firstName} ${session.lastName}`.trim()}`.toLowerCase();
    try {
      if (window.localStorage.getItem(key)) return;
      const entered = new Date(session.enteredAt).getTime();
      if (Number.isFinite(entered) && Date.now() - entered < 60_000) {
        window.localStorage.setItem(key, "1");
        return;
      }
      window.localStorage.setItem(key, "1");
    } catch {
      return;
    }
    void reportSiteVisit({
      firstName: session.firstName,
      lastName: session.lastName,
      email: session.email,
      kind: "visit",
    });
  }, [session]);

  useEffect(() => {
    if (!ready || !session.firstName) return;
    const couple = isCoupleAdmin(session.firstName, session.email, session.lastName);
    if (couple) {
      if (!state.adminAuthed) enableAdmin();
    } else if (state.adminAuthed) {
      logoutAdmin();
    } else {
      try {
        if (!window.sessionStorage.getItem("jeric-admin-cleared")) {
          window.sessionStorage.setItem("jeric-admin-cleared", "1");
          logoutAdmin();
        }
      } catch {
        // A missing admin cookie is fine if storage is blocked.
      }
    }
    recordGuestEntry({
      inviteId: session.inviteId,
      firstName: session.firstName,
      lastName: session.lastName,
      email: session.email,
      location: session.location,
      fromList: session.fromList,
    });
    const signedInEmail = String(state.identity?.email ?? "").trim().toLowerCase();
    const sessionEmail = String(session.email ?? "").trim().toLowerCase();
    const samePerson = Boolean(
      state.identity &&
        ((sessionEmail && signedInEmail === sessionEmail) ||
          (!sessionEmail &&
            state.identity.firstName === session.firstName &&
            state.identity.lastName === session.lastName)),
    );
    if (samePerson && state.identity) {
      joining.current = false;
      if (
        state.identity.firstName !== session.firstName ||
        state.identity.lastName !== session.lastName ||
        signedInEmail !== sessionEmail
      ) {
        updateIdentityFromGate(session.firstName, session.lastName, session.email);
      }
      return;
    }
    if (state.identity) joining.current = false;
    if (joining.current) return;
    joining.current = true;
    join({
      firstName: session.firstName,
      lastName: session.lastName,
      email: session.email,
      city: session.location,
      side: "both",
    });
  }, [enableAdmin, join, logoutAdmin, ready, recordGuestEntry, session, state.adminAuthed, state.identity, updateIdentityFromGate]);

  return null;
}
