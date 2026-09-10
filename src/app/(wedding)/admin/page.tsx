"use client";

import { useEffect, useState } from "react";
import { setAdminCookie } from "@/lib/gate/admin";
import { allTagIds, inviteTags, tagCatalog, tagLabel } from "@/lib/hub/access";
import { ADMIN_CODE, EVENT_LABELS } from "@/lib/hub/content";
import { AccessTagEditor, GameEditor } from "@/components/site/GameEditor";
import { householdNames, useHub } from "@/lib/hub/store";
import { parseInviteCsv, formatDate, formatTime } from "@/lib/hub/utils";
import { sendRideDigestNow } from "@/lib/rides/actions";
import type { EventId, InviteRecord, RsvpRecord } from "@/lib/hub/types";

type Tab = "invites" | "rsvps" | "access" | "rides" | "games" | "songs" | "photos";

export default function AdminPage() {
  const hub = useHub();
  const { state, loginAdmin, signOut } = hub;
  const [code, setCode] = useState("");
  const [error, setError] = useState("");
  const [tab, setTab] = useState<Tab>("invites");

  useEffect(() => {
    if (state.adminAuthed) void setAdminCookie();
  }, [state.adminAuthed]);

  if (!state.adminAuthed) {
    return (
      <main className="px-5 py-28">
        <form
          className="mx-auto max-w-sm space-y-4"
          onSubmit={(event) => {
            event.preventDefault();
            if (!loginAdmin(code)) setError("That code isn't it.");
          }}
        >
          <h1 className="font-serif text-3xl uppercase">Admin</h1>
          <input value={code} onChange={(e) => setCode(e.target.value)} className="input-line" placeholder="Admin code" />
          {error ? <p className="font-sans text-sm text-olive">{error}</p> : null}
          <button type="submit" className="btn-primary w-full">Enter</button>
          <p className="font-sans text-xs text-taupe">Preview: {ADMIN_CODE}</p>
        </form>
      </main>
    );
  }

  const pendingPhotos = state.photos.filter((photo) => !photo.approved);
  const unmatched = state.rides.filter((ride) => ride.status === "open" || ride.status === "pending");

  return (
    <main className="px-5 py-28">
      <div className="mx-auto flex max-w-6xl items-center justify-between gap-4">
        <div>
          <h1 className="font-serif text-3xl uppercase">Admin</h1>
          <p className="mt-2 max-w-xl font-sans text-sm text-charcoal/65">
            Guest lists and tags live here. Turn on Can edit site for a guest so they can tap Edit, change a line, then Save.
          </p>
        </div>
        <div className="flex gap-3">
          <button type="button" className="btn-secondary !px-4 !py-2" onClick={hub.resetHub}>Clear all data</button>
          <button type="button" className="btn-secondary !px-4 !py-2" onClick={() => void signOut()}>Sign out</button>
        </div>
      </div>
      <div className="mx-auto mt-8 flex max-w-6xl flex-wrap gap-2">
        {(["invites", "rsvps", "access", "rides", "games", "songs", "photos"] as Tab[]).map((item) => (
          <button
            key={item}
            type="button"
            onClick={() => setTab(item)}
            className={`rounded-full px-4 py-2 font-sans text-[0.6rem] uppercase tracking-[0.16em] ${
              tab === item ? "bg-forest text-ivory" : "bg-cream"
            }`}
          >
            {item}
          </button>
        ))}
      </div>

      <div className="mx-auto mt-10 max-w-6xl">
        {tab === "invites" ? <InviteManager /> : null}

        {tab === "rsvps" ? <RsvpBoard rsvps={state.rsvps} /> : null}

        {tab === "rides" ? (
          <div className="space-y-3">
            <div className="flex flex-wrap items-center justify-between gap-3">
              <p className="font-sans text-sm text-taupe">{unmatched.length} unmatched / open</p>
              <SendRideDigestButton />
            </div>
            {state.rides.map((ride) => (
              <article key={ride.id} className="soft-card p-4">
                <p className="font-serif text-lg">{ride.from} → {ride.to}</p>
                <p className="font-sans text-sm text-taupe">
                  {ride.kind} · {ride.status} · {ride.seatsTaken}/{ride.seats}
                </p>
              </article>
            ))}
          </div>
        ) : null}

        {tab === "access" ? <AccessTagEditor /> : null}

        {tab === "games" ? (
          <div className="space-y-10">
            <p className="font-sans text-sm text-charcoal/70">
              Edit questions here. Use Delete question to remove one, or Add question to grow a game. Everyone can play — games are not gated by tags.
            </p>
            <section>
              <h2 className="font-serif text-2xl uppercase">How well do you know us?</h2>
              <div className="mt-4"><GameEditor kind="know-us" /></div>
            </section>
            <section>
              <h2 className="font-serif text-2xl uppercase">Wedding trivia</h2>
              <div className="mt-4"><GameEditor kind="trivia" /></div>
            </section>
            <section>
              <h2 className="font-serif text-2xl uppercase">Guess the photo</h2>
              <div className="mt-4"><GameEditor kind="photos" /></div>
            </section>
            <section>
              <h2 className="font-serif text-2xl uppercase">Predictions</h2>
              <div className="mt-4"><GameEditor kind="predictions" /></div>
            </section>
          </div>
        ) : null}

        {tab === "songs" ? (
          <div className="space-y-3">
            {state.songs.map((song) => (
              <div key={song.id} className="soft-card flex items-center justify-between p-4">
                <p>{song.title} — {song.artist} · ▲{song.ups.length} ▼{song.downs.length}</p>
                <button type="button" className="btn-secondary !px-3 !py-2" onClick={() => hub.moderateSong(song.id, false)}>
                  Remove
                </button>
              </div>
            ))}
          </div>
        ) : null}

        {tab === "photos" ? (
          <div className="space-y-3">
            {pendingPhotos.length === 0 ? <p className="font-sans text-sm text-taupe">No pending photos.</p> : null}
            {pendingPhotos.map((photo) => (
              <div key={photo.id} className="soft-card flex items-center justify-between p-4">
                <p className="font-sans text-sm">{photo.caption || "Untitled"} · {photo.album}</p>
                <div className="flex gap-2">
                  <button type="button" className="btn-primary !px-3 !py-2" onClick={() => hub.moderatePhoto(photo.id, true)}>Approve</button>
                  <button type="button" className="btn-secondary !px-3 !py-2" onClick={() => hub.moderatePhoto(photo.id, false)}>Reject</button>
                </div>
              </div>
            ))}
          </div>
        ) : null}
      </div>
    </main>
  );
}

function partySize(rsvp: RsvpRecord) {
  if (rsvp.partyAttending.length) return rsvp.partyAttending.length;
  return rsvp.guestCount || (rsvp.attending ? 1 : 0);
}

function RsvpBoard({ rsvps }: { rsvps: RsvpRecord[] }) {
  const yes = rsvps.filter((rsvp) => rsvp.attending);
  const no = rsvps.filter((rsvp) => !rsvp.attending);
  const yesPeople = yes.reduce((sum, rsvp) => sum + partySize(rsvp), 0);
  const eventIds = Object.keys(EVENT_LABELS) as EventId[];

  return (
    <div className="space-y-8">
      <div className="grid gap-3 sm:grid-cols-2">
        <div className="soft-card p-5">
          <p className="label-caps text-olive">Yes</p>
          <p className="mt-2 font-serif text-4xl">{yes.length}</p>
          <p className="mt-1 font-sans text-sm text-charcoal/65">
            {yesPeople} {yesPeople === 1 ? "person" : "people"} coming
          </p>
        </div>
        <div className="soft-card p-5">
          <p className="label-caps text-taupe">No</p>
          <p className="mt-2 font-serif text-4xl">{no.length}</p>
          <p className="mt-1 font-sans text-sm text-charcoal/65">
            {no.length === 1 ? "reply" : "replies"}
          </p>
        </div>
      </div>

      <div>
        <p className="label-caps">Coming by event</p>
        <div className="mt-3 grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
          {eventIds.map((eventId) => {
            const attending = yes.filter((rsvp) => rsvp.events.includes(eventId));
            const people = attending.reduce((sum, rsvp) => sum + partySize(rsvp), 0);
            return (
              <div key={eventId} className="rounded-2xl border border-taupe/15 bg-cream/60 px-4 py-4">
                <p className="font-sans text-[0.58rem] uppercase tracking-[0.14em] text-taupe">{EVENT_LABELS[eventId]}</p>
                <p className="mt-2 font-serif text-3xl">{people}</p>
                <p className="mt-1 font-sans text-xs text-charcoal/60">
                  {attending.length} {attending.length === 1 ? "RSVP" : "RSVPs"}
                </p>
              </div>
            );
          })}
        </div>
      </div>

      {rsvps.length === 0 ? <p className="font-sans text-sm text-taupe">No RSVPs yet.</p> : (
        <div className="grid gap-6 lg:grid-cols-2">
          <RsvpColumn title="Yes" items={yes} empty="No yes replies yet." />
          <RsvpColumn title="No" items={no} empty="No no replies yet." />
        </div>
      )}
    </div>
  );
}

function RsvpColumn({ title, items, empty }: { title: string; items: RsvpRecord[]; empty: string }) {
  return (
    <section>
      <h2 className="font-serif text-2xl uppercase">
        {title} <span className="font-sans text-sm tracking-normal text-taupe">({items.length})</span>
      </h2>
      <div className="mt-4 space-y-3">
        {items.length === 0 ? <p className="font-sans text-sm text-taupe">{empty}</p> : null}
        {items.map((rsvp) => (
          <article key={rsvp.id} className="soft-card p-4 font-sans text-sm">
            <div className="flex items-start justify-between gap-3">
              <p className="font-serif text-xl">{rsvp.name}</p>
              <span
                className={`shrink-0 rounded-full px-2.5 py-1 font-sans text-[0.55rem] uppercase tracking-[0.14em] ${
                  rsvp.attending ? "bg-forest text-ivory" : "bg-cream text-charcoal/70"
                }`}
              >
                {rsvp.attending ? "Yes" : "No"}
              </span>
            </div>
            <p className="mt-1 text-charcoal/70">
              {rsvp.partyAttending.join(", ") || `${partySize(rsvp)} ${partySize(rsvp) === 1 ? "guest" : "guests"}`}
            </p>
            {rsvp.attending ? (
              <div className="mt-3 flex flex-wrap gap-1.5">
                {(Object.keys(EVENT_LABELS) as EventId[]).map((eventId) => {
                  const on = rsvp.events.includes(eventId);
                  return (
                    <span
                      key={eventId}
                      className={`rounded-full px-2.5 py-1 font-sans text-[0.5rem] uppercase tracking-[0.12em] ${
                        on ? "bg-forest/10 text-forest" : "bg-cream text-taupe line-through"
                      }`}
                    >
                      {EVENT_LABELS[eventId]}
                    </span>
                  );
                })}
              </div>
            ) : (
              <p className="mt-2 text-taupe">Not attending</p>
            )}
            {rsvp.arrivalDate ? (
              <p className="mt-2 text-charcoal/65">
                Arrive {[formatDate(rsvp.arrivalDate), rsvp.arrivalTime ? formatTime(rsvp.arrivalTime) : "", rsvp.airport]
                  .filter(Boolean)
                  .join(" ")}
              </p>
            ) : null}
            {rsvp.departureDate ? (
              <p className="text-charcoal/65">
                Depart {[formatDate(rsvp.departureDate), rsvp.departureTime ? formatTime(rsvp.departureTime) : ""]
                  .filter(Boolean)
                  .join(" ")}
              </p>
            ) : null}
            {rsvp.dietary ? <p className="mt-1 text-charcoal/65">{rsvp.dietary}</p> : null}
          </article>
        ))}
      </div>
    </section>
  );
}

function InviteManager() {
  const { state, upsertInvite, deleteInvite, importInvites, setInviteCanEditSite } = useHub();
  const [editing, setEditing] = useState<InviteRecord | null>(null);

  return (
    <div className="space-y-8">
      <div className="soft-card p-6">
        <h2 className="font-serif text-2xl uppercase">Upload or update guests</h2>
        <p className="mt-2 max-w-2xl font-sans text-sm text-charcoal/70">
          CSV columns: firstName, lastName, email, location, inItaly (true/false), party (names separated by comma), events, tags.
          Location determines RSVP travel questions — Italy guests won&apos;t be asked for arrival times.
        </p>
        <label className="btn-secondary mt-4 inline-flex cursor-pointer">
          Upload CSV
          <input
            type="file"
            accept=".csv,text/csv"
            className="hidden"
            onChange={async (event) => {
              const file = event.target.files?.[0];
              if (!file) return;
              const text = await file.text();
              importInvites(parseInviteCsv(text));
              event.currentTarget.value = "";
            }}
          />
        </label>
      </div>

      <InviteForm
        key={editing?.id ?? "new"}
        initial={editing}
        onSave={(invite) => {
          upsertInvite(invite);
          setEditing(null);
        }}
        onCancel={() => setEditing(null)}
      />

      <div className="overflow-x-auto rounded-2xl border border-taupe/15">
        <table className="min-w-full text-left font-sans text-sm">
          <thead className="bg-cream text-[0.6rem] uppercase tracking-[0.16em] text-taupe">
            <tr>
              <th className="px-4 py-3">Guest</th>
              <th className="px-4 py-3">Email</th>
              <th className="px-4 py-3">Status</th>
              <th className="px-4 py-3">Location</th>
              <th className="px-4 py-3">Italy?</th>
              <th className="px-4 py-3">Party</th>
              <th className="px-4 py-3">Tags</th>
              <th className="px-4 py-3">Edit site</th>
              <th className="px-4 py-3"></th>
            </tr>
          </thead>
          <tbody>
            {state.invites.map((invite) => (
              <tr key={invite.id} className="border-t border-taupe/10">
                <td className="px-4 py-3">{invite.firstName} {invite.lastName}</td>
                <td className="px-4 py-3">{invite.email || "—"}</td>
                <td className="px-4 py-3">
                  {invite.invited === false ? (
                    <span className="rounded-full bg-[#C45C4A]/15 px-2 py-1 font-sans text-[0.55rem] uppercase tracking-[0.12em] text-[#C45C4A]">
                      Uninvited · entered
                    </span>
                  ) : invite.entered ? (
                    <span className="rounded-full bg-forest/10 px-2 py-1 font-sans text-[0.55rem] uppercase tracking-[0.12em] text-forest">
                      Invited · entered
                    </span>
                  ) : (
                    <span className="text-taupe">Invited</span>
                  )}
                </td>
                <td className="px-4 py-3">{invite.location}</td>
                <td className="px-4 py-3">{invite.inItaly ? "Yes" : "No"}</td>
                <td className="px-4 py-3">{householdNames(invite).join(", ")}</td>
                <td className="px-4 py-3 text-taupe">{inviteTags(invite, state).map((id) => tagLabel(id, state)).join(", ")}</td>
                <td className="px-4 py-3">
                  <button
                    type="button"
                    className={`rounded-full px-2.5 py-1 font-sans text-[0.55rem] uppercase tracking-[0.12em] ${
                      invite.canEditSite ? "bg-forest text-ivory" : "bg-cream text-taupe"
                    }`}
                    onClick={() => setInviteCanEditSite(invite.id, !invite.canEditSite)}
                  >
                    {invite.canEditSite ? "Editor" : "Off"}
                  </button>
                </td>
                <td className="px-4 py-3 text-right">
                  <button type="button" className="mr-3 font-sans text-xs uppercase tracking-widest text-olive" onClick={() => setEditing(invite)}>
                    Edit
                  </button>
                  <button type="button" className="font-sans text-xs uppercase tracking-widest text-taupe" onClick={() => deleteInvite(invite.id)}>
                    Remove
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}

function InviteForm({
  initial,
  onSave,
  onCancel,
}: {
  initial: InviteRecord | null;
  onSave: (invite: InviteRecord) => void;
  onCancel: () => void;
}) {
  const { state } = useHub();
  const catalog = tagCatalog(state);
  const [inItaly, setInItaly] = useState(initial?.inItaly ?? false);
  const [tags, setTags] = useState<string[]>(inviteTags(initial, state));
  const [canEditSite, setCanEditSite] = useState(Boolean(initial?.canEditSite));

  return (
    <form
      className="soft-card grid gap-4 p-6 md:grid-cols-2"
      onSubmit={(event) => {
        event.preventDefault();
        const data = new FormData(event.currentTarget);
        const firstName = String(data.get("firstName")).trim();
        const lastName = String(data.get("lastName")).trim();
        const location = String(data.get("location")).trim();
        onSave({
          id: initial?.id ?? `inv-${Date.now()}`,
          firstName,
          lastName,
          email: String(data.get("email")),
          location,
          inItaly: inItaly || /italy/i.test(location),
          party: String(data.get("party"))
            .split(/[;|,]/)
            .map((name) => name.trim())
            .filter(Boolean),
          events: String(data.get("events") || "welcome,ceremony,reception,brunch")
            .split(",")
            .filter(Boolean) as EventId[],
          tags,
          invited: initial?.invited !== false,
          entered: initial?.entered ?? false,
          canEditSite,
        });
        event.currentTarget.reset();
        setInItaly(false);
        setCanEditSite(false);
        setTags(allTagIds(state));
      }}
    >
      <h2 className="font-serif text-2xl uppercase md:col-span-2">{initial ? "Update guest" : "Add guest"}</h2>
      <label>
        <span className="label-caps">First name</span>
        <input name="firstName" required defaultValue={initial?.firstName} className="input-line" />
      </label>
      <label>
        <span className="label-caps">Last name</span>
        <input name="lastName" required defaultValue={initial?.lastName} className="input-line" />
      </label>
      <label>
        <span className="label-caps">Email</span>
        <input name="email" type="email" defaultValue={initial?.email} className="input-line" />
      </label>
      <label>
        <span className="label-caps">Location</span>
        <input name="location" defaultValue={initial?.location} placeholder="New York, NY or Rome, Italy" className="input-line" />
      </label>
      <label className="flex items-center gap-3 font-sans text-sm md:col-span-2">
        <input type="checkbox" checked={inItaly} onChange={(event) => setInItaly(event.target.checked)} />
        Lives in Italy (hide arrival / departure times at RSVP)
      </label>
      <label className="flex items-center gap-3 font-sans text-sm md:col-span-2">
        <input type="checkbox" checked={canEditSite} onChange={(event) => setCanEditSite(event.target.checked)} />
        Can edit the website (Edit / Save on any page)
      </label>
      <label className="md:col-span-2">
        <span className="label-caps">Party / plus-ones</span>
        <input name="party" defaultValue={initial?.party.join(", ")} placeholder="David Fore, Maya Fore" className="input-line" />
      </label>
      <fieldset className="md:col-span-2">
        <legend className="label-caps">Tags — what they can see</legend>
        <div className="mt-3 flex flex-wrap gap-2">
          {catalog.map((tag) => {
            const on = tags.includes(tag.id);
            return (
              <button
                key={tag.id}
                type="button"
                className={`rounded-full px-3 py-1.5 font-sans text-[0.55rem] uppercase tracking-[0.14em] ${
                  on ? "bg-forest text-ivory" : "bg-cream"
                }`}
                onClick={() => setTags(on ? tags.filter((item) => item !== tag.id) : [...tags, tag.id])}
              >
                {tag.label}
              </button>
            );
          })}
        </div>
      </fieldset>
      <input type="hidden" name="events" defaultValue={(initial?.events ?? ["welcome", "ceremony", "reception", "brunch"]).join(",")} />
      <div className="flex gap-3 md:col-span-2">
        <button type="submit" className="btn-primary">{initial ? "Save guest" : "Add guest"}</button>
        {initial ? (
          <button type="button" className="btn-secondary" onClick={onCancel}>Cancel</button>
        ) : null}
      </div>
    </form>
  );
}

function SendRideDigestButton() {
  const [note, setNote] = useState("");
  const [busy, setBusy] = useState(false);
  return (
    <div className="flex flex-wrap items-center gap-3">
      <button
        type="button"
        disabled={busy}
        className="btn-secondary !px-3 !py-2"
        onClick={() => {
          setBusy(true);
          void sendRideDigestNow()
            .then((result) => {
              if (result.error) setNote(result.error);
              else if (result.result?.skipped) {
                const why = result.result.reason;
                setNote(
                  why === "empty"
                    ? "No new ride posts to send."
                    : why === "no-recipients"
                      ? "No guest emails to send to."
                      : why === "no-mailer"
                        ? "Add RESEND_API_KEY on Vercel to send mail."
                        : "Nothing to send.",
                );
              } else setNote(`Sent to ${result.result?.recipients ?? 0} addresses.`);
            })
            .finally(() => setBusy(false));
        }}
      >
        Send today's ride emails
      </button>
      {note ? <p className="font-sans text-sm text-taupe">{note}</p> : null}
    </div>
  );
}
