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
    if (isCoupleAdmin(session.firstName, session.email)) enableAdmin();
    else logoutAdmin();
    recordGuestEntry({
      inviteId: session.inviteId,
      firstName: session.firstName,
      lastName: session.lastName,
      email: session.email,
      location: session.location,
      fromList: session.fromList,
    });
    if (state.identity) {
      joining.current = false;
      if (
        state.identity.firstName !== session.firstName ||
        state.identity.lastName !== session.lastName ||
        state.identity.email !== session.email
      ) {
        updateIdentityFromGate(session.firstName, session.lastName, session.email);
      }
      return;
    }
    if (joining.current) return;
    joining.current = true;
    join({
      firstName: session.firstName,
      lastName: session.lastName,
      email: session.email,
      city: session.location,
      side: "both",
    });
  }, [enableAdmin, join, logoutAdmin, ready, recordGuestEntry, session, state.identity, updateIdentityFromGate]);

  return null;
}
