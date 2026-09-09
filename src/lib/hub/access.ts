import type { AccessTag, EventId, HubState, InviteRecord } from "@/lib/hub/types";

export const ACCESS_TAGS: AccessTag[] = [
  { id: "welcome", label: "Welcome Dinner" },
  { id: "wedding", label: "Wedding Day" },
  { id: "brunch", label: "Farewell Brunch" },
  { id: "play", label: "Games" },
  { id: "afterparty", label: "Afterparty" },
];

export const DEFAULT_GUEST_TAGS = ACCESS_TAGS.map((tag) => tag.id);

export const EVENT_ACCESS: Record<string, string[]> = {
  welcome: ["welcome"],
  ceremony: ["wedding"],
  cocktails: ["wedding"],
  reception: ["wedding"],
  dancing: ["wedding"],
  brunch: ["brunch"],
};

export const EVENT_ID_TAG: Record<EventId, string> = {
  welcome: "welcome",
  ceremony: "wedding",
  reception: "wedding",
  brunch: "brunch",
};

export const PAGE_ACCESS: Record<string, string[]> = {};

export function pageKey(href: string) {
  const path = (href.split("?")[0] || "/").replace(/\/+$/, "") || "/";
  if (path.startsWith("/play")) return "/play";
  if (path === "/staying") return "/travel";
  if (path === "/gallery") return "/photos";
  return path;
}

export function canTogglePageHidden(href: string) {
  const key = pageKey(href);
  return !["/", "/admin", "/enter", "/join", "/me"].includes(key) && !key.startsWith("/admin");
}

export function isPageTemporarilyHidden(state: HubState, href: string) {
  const key = pageKey(href);
  return (state.hiddenPages ?? []).includes(key);
}

export function requiredEventTags(_state: HubState, eventId: string) {
  return EVENT_ACCESS[eventId] ?? [];
}

export function requiredPageTags(_state: HubState, href: string) {
  const match = Object.keys(PAGE_ACCESS)
    .filter((path) => href === path || href.startsWith(`${path}/`))
    .sort((a, b) => b.length - a.length)[0];
  return match ? PAGE_ACCESS[match] : [];
}

export function canSeePage(state: HubState, href: string) {
  if (isPageTemporarilyHidden(state, href) && !state.adminAuthed) return false;
  if (href === "/play" || href.startsWith("/play/")) return true;
  return hasTagAccess(viewerTags(state), requiredPageTags(state, href));
}

export function canSeeEvent(state: HubState, eventId: string) {
  const tags = viewerTags(state);
  if (tags.includes(eventId)) return true;
  return hasTagAccess(tags, EVENT_ACCESS[eventId] ?? []);
}

export function weekendEventHideId(eventId: string) {
  return `weekend.event.${eventId}`;
}

export function isWeekendEventHidden(state: Pick<HubState, "siteHidden">, eventId: string) {
  return (state.siteHidden ?? []).includes(weekendEventHideId(eventId));
}

export function tagCatalog(state?: Pick<HubState, "accessTags"> | null) {
  return state?.accessTags?.length ? state.accessTags : ACCESS_TAGS;
}

export function allTagIds(state?: Pick<HubState, "accessTags"> | null) {
  return tagCatalog(state).map((tag) => tag.id);
}

export function inviteTags(
  invite: Pick<InviteRecord, "tags" | "invited"> | null | undefined,
  state?: Pick<HubState, "accessTags"> | null,
) {
  if (!invite) return allTagIds(state);
  if (invite.invited === false) return invite.tags ?? [];
  return invite.tags?.length ? invite.tags : allTagIds(state);
}

export function hasTagAccess(userTags: string[], required: string[] | undefined) {
  if (!required?.length) return true;
  return required.some((tag) => userTags.includes(tag));
}

export function viewerTags(state: HubState) {
  const ids = allTagIds(state);
  if (state.adminAuthed) return ids;
  const identity = state.identity;
  if (!identity) return ids;
  const email = identity.email.trim().toLowerCase();
  const first = identity.firstName.trim().toLowerCase();
  const last = identity.lastName.trim().toLowerCase();
  const invite =
    state.invites.find((item) => item.email.trim().toLowerCase() === email && email.length > 0) ??
    state.invites.find(
      (item) =>
        item.firstName.trim().toLowerCase() === first &&
        (!last || item.lastName.trim().toLowerCase() === last),
    );
  return inviteTags(invite, state);
}

export function tagLabel(id: string, state?: Pick<HubState, "accessTags"> | null) {
  return tagCatalog(state).find((tag) => tag.id === id)?.label ?? id;
}

export function slugifyTag(label: string) {
  const base = label
    .trim()
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "");
  return base || `tag-${Date.now().toString(36)}`;
}
