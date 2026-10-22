"use client";

import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useState,
  type ReactNode,
} from "react";
import { DEFAULT_VIS } from "@/lib/hub/seed";
import type {
  Announcement,
  ChatChannel,
  ChatMessage,
  EventId,
  Guest,
  GuestPhoto,
  GuestbookNote,
  HubState,
  Identity,
  InviteRecord,
  PhotoAlbum,
  PhotoFolder,
  PhotoQuestion,
  PredictionQuestion,
  QuizQuestion,
  Ride,
  RideKind,
  RideStatus,
  RsvpRecord,
  SeatAsk,
  Side,
  Song,
  StayArea,
  Visibility,
} from "@/lib/hub/types";
import { mergePhotoFolders, nextPhotoFolderId, normalizePhotoFolders } from "@/lib/hub/albums";
import { ADMIN_CODE, KNOW_US_QUESTIONS, PHOTO_QUESTIONS, PREDICTION_QUESTIONS, TRIVIA_QUESTIONS, isCoupleAdmin } from "@/lib/hub/content";
import { ACCESS_TAGS, DEFAULT_GUEST_TAGS, EVENT_ACCESS, PAGE_ACCESS, canTogglePageHidden, identityCanEditSite, pageKey, slugifyTag } from "@/lib/hub/access";
import { clearAdminCookie, clearGateCookie, setAdminCookie } from "@/lib/gate/admin";
import { checkSiteEditor, syncSiteEditors } from "@/lib/editors/client";
import type { SiteEditor } from "@/lib/editors/match";
import { fetchSharedInvites, syncSharedInvites } from "@/lib/invites/client";
import { fetchSharedRsvps, syncSharedRsvp } from "@/lib/rsvp/client";
import { mergeRsvpLists } from "@/lib/rsvp/merge";
import { forgetGuestPhoto, loadCachedGuestPhotos, loadCachedSiteImages, rememberGuestPhoto, rememberSiteImage } from "@/lib/hub/image-cache";
import { fetchSharedPhotos, removeSharedPhoto, syncGuestPhoto } from "@/lib/photos/client";
import { fetchSiteContent, syncSiteContent } from "@/lib/site-content/client";
import type { SiteContent } from "@/lib/site-content/types";
import { collectHubEmails } from "@/lib/rides/emails";
import { queueRideDigest, syncRideDigestEmails } from "@/lib/rides/client";

const STORAGE_KEY = "jeric-hub-v3";
const DEFAULT_HERO = "/images/casale-bosco.jpg";
const dirtySiteImages = new Set<string>();
const siteImageTimes: Record<string, number> = {};
const dirtyPhotoIds = new Set<string>();
let queuedSiteContent = false;

function withoutInlineImages(state: HubState): HubState {
  return {
    ...state,
    siteImages: Object.fromEntries(
      Object.entries(state.siteImages ?? {}).filter(([, src]) => !String(src).startsWith("data:")),
    ),
    photos: (state.photos ?? []).filter((photo) => !String(photo.src).startsWith("data:")).slice(0, 8),
    guestbook: state.guestbook.map((note) => ({ ...note, photoDataUrl: undefined })),
    identity: state.identity ? { ...state.identity, photoDataUrl: undefined } : null,
  };
}

function persistHubState(state: HubState) {
  try {
    window.localStorage.setItem(STORAGE_KEY, JSON.stringify(state));
  } catch {
    try {
      window.localStorage.setItem(STORAGE_KEY, JSON.stringify(withoutInlineImages(state)));
    } catch {
      // The image cache keeps the photos when the main saved state is full.
    }
  }
}

function mergeGuestPhotoLists(current: GuestPhoto[], incoming: GuestPhoto[]) {
  const byId = new Map<string, GuestPhoto>();
  for (const photo of current) {
    if (photo?.id && photo.src) byId.set(photo.id, photo);
  }
  for (const photo of incoming) {
    if (!photo?.id || !photo.src || dirtyPhotoIds.has(photo.id)) continue;
    byId.set(photo.id, photo);
  }
  for (const photo of incoming) {
    if (photo?.id && photo.src && !byId.has(photo.id)) byId.set(photo.id, photo);
  }
  return [...byId.values()];
}

const EMPTY_STATE: HubState = {
  identity: null,
  guests: [],
  invites: [],
  rides: [],
  seatAsks: [],
  messages: [],
  guestbook: [],
  songs: [],
  photos: [],
  photoFolders: normalizePhotoFolders(undefined),
  announcements: [],
  rsvps: [],
  savedPlaces: [],
  gameScores: {},
  predictions: {},
  completedGames: [],
  adminAuthed: false,
  siteEditor: false,
  siteEditing: false,
  subscribedEmail: null,
  heroImage: DEFAULT_HERO,
  siteCopy: {},
  siteImages: {},
  siteHidden: [],
  hiddenPages: [],
  gameQuestions: {
    "know-us": KNOW_US_QUESTIONS,
    trivia: TRIVIA_QUESTIONS,
  },
  photoQuestions: PHOTO_QUESTIONS,
  predictionQuestions: PREDICTION_QUESTIONS,
  eventAccess: { ...EVENT_ACCESS },
  pageAccess: { ...PAGE_ACCESS },
  accessTags: ACCESS_TAGS.map((tag) => ({ ...tag })),
};

function migrateSong(song: Song & { votes?: string[] }): Song | null {
  if (!song || typeof song !== "object") return null;
  return {
    ...song,
    title: String(song.title ?? ""),
    artist: String(song.artist ?? ""),
    ups: Array.isArray(song.ups) ? song.ups : Array.isArray(song.votes) ? song.votes : [],
    downs: Array.isArray(song.downs) ? song.downs : [],
  };
}

function asStringList(value: unknown) {
  return Array.isArray(value) ? value.map((item) => String(item ?? "").trim()).filter(Boolean) : [];
}

function normalizeLoadedGuest(guest: Guest): Guest | null {
  if (!guest || typeof guest !== "object") return null;
  const firstName = String(guest.firstName ?? "").trim();
  if (!firstName) return null;
  return {
    ...guest,
    firstName,
    lastName: String(guest.lastName ?? "").trim(),
    email: String(guest.email ?? ""),
    city: String(guest.city ?? ""),
    events: Array.isArray(guest.events) ? guest.events : ["welcome", "ceremony", "reception", "brunch"],
    points: Number(guest.points) || 0,
    visibility: { ...DEFAULT_VIS, ...(guest.visibility ?? {}) },
  };
}

function normalizeLoadedRsvp(rsvp: RsvpRecord): RsvpRecord | null {
  if (!rsvp || typeof rsvp !== "object" || !String(rsvp.name ?? "").trim()) return null;
  return {
    ...rsvp,
    name: String(rsvp.name).trim(),
    email: String(rsvp.email ?? "").trim(),
    events: Array.isArray(rsvp.events) ? rsvp.events : [],
    partyAttending: asStringList(rsvp.partyAttending),
    inviteId: String(rsvp.inviteId ?? ""),
    submittedAt: String(rsvp.submittedAt ?? ""),
  };
}

function questionsWithOptions<T extends { options?: unknown }>(list: T[] | undefined, fallback: T[]) {
  if (!Array.isArray(list) || !list.length) return fallback;
  const cleaned = list.filter((item) => item && Array.isArray(item.options) && item.options.length);
  return cleaned.length ? cleaned : fallback;
}

export function householdNames(invite: InviteRecord) {
  const party = Array.isArray(invite?.party) ? invite.party : [];
  const primary = `${invite?.firstName ?? ""} ${invite?.lastName ?? ""}`.trim();
  return [primary, ...party.map((name) => String(name ?? "").trim()).filter(Boolean)].filter(Boolean);
}

function mergeInviteLists(local: InviteRecord[], remote: InviteRecord[]) {
  const nameKey = (invite: InviteRecord) =>
    `${String(invite.firstName ?? "").trim().toLowerCase()}|${String(invite.lastName ?? "").trim().toLowerCase()}`;
  const byId = new Map(remote.map((invite) => [invite.id, invite]));
  const names = new Set(remote.map(nameKey));
  for (const invite of local) {
    if (byId.has(invite.id) || names.has(nameKey(invite))) continue;
    byId.set(invite.id, invite);
  }
  return [...byId.values()];
}

function contentFromState(state: HubState): SiteContent {
  const siteImages = Object.fromEntries(
    Object.entries(state.siteImages ?? {}).filter(
      ([id, src]) => Boolean(src) && (!String(src).startsWith("data:") || dirtySiteImages.has(id)),
    ),
  );
  const siteImageUpdatedAt = Object.fromEntries(
    Object.keys(siteImages).flatMap((id) => (siteImageTimes[id] ? [[id, siteImageTimes[id]] as const] : [])),
  );
  return {
    siteCopy: state.siteCopy,
    siteImages,
    siteImageUpdatedAt,
    siteHidden: state.siteHidden,
    hiddenPages: state.hiddenPages ?? [],
    heroImage: state.heroImage,
    photoFolders: normalizePhotoFolders(state.photoFolders),
    gameQuestions: state.gameQuestions,
    photoQuestions: state.photoQuestions,
    predictionQuestions: state.predictionQuestions,
  };
}

let siteContentReady = false;

function sameJson(a: unknown, b: unknown) {
  return JSON.stringify(a) === JSON.stringify(b);
}

function chooseSavedList<T>(remote: T[] | undefined, local: T[] | undefined, fallback: T[]) {
  if (remote?.length && !sameJson(remote, fallback)) return remote;
  if (local?.length && !sameJson(local, fallback)) return local;
  return remote?.length ? remote : local?.length ? local : fallback;
}

function chooseGameQuestions(
  remote: SiteContent["gameQuestions"] | undefined,
  local: HubState["gameQuestions"],
) {
  return {
    ...local,
    ...remote,
    "know-us": chooseSavedList(remote?.["know-us"], local["know-us"], KNOW_US_QUESTIONS),
    trivia: chooseSavedList(remote?.trivia, local.trivia, TRIVIA_QUESTIONS),
  };
}

function publishSiteContent(state: HubState) {
  if (!siteContentReady) {
    queuedSiteContent = true;
    return;
  }
  queuedSiteContent = false;
  const pending = new Set(dirtySiteImages);
  void syncSiteContent(contentFromState(state)).then((saved) => {
    if (!saved) return;
    for (const id of pending) dirtySiteImages.delete(id);
  });
}

function commitPhotoFolders(prev: HubState, photoFolders: PhotoFolder[]) {
  const next = { ...prev, photoFolders };
  publishSiteContent(next);
  return next;
}

function editorsFromInvites(invites: InviteRecord[]): SiteEditor[] {
  return invites
    .filter((invite) => invite.canEditSite)
    .map((invite) => ({
      email: (invite.email ?? "").trim().toLowerCase(),
      firstName: invite.firstName.trim(),
      lastName: invite.lastName.trim(),
    }));
}

export function lookupInvites(invites: InviteRecord[], query: string) {
  const q = query.trim().toLowerCase();
  if (q.length < 2) return [];
  return invites.filter((invite) => {
    if (!invite || invite.invited === false) return false;
    const names = householdNames(invite).map((name) => name.toLowerCase());
    return names.some((name) => {
      if (name.includes(q)) return true;
      const parts = name.split(/\s+/).filter(Boolean);
      return parts.length >= 2 && q.includes(name);
    });
  });
}

function uid(prefix: string) {
  return `${prefix}-${Math.random().toString(36).slice(2, 9)}`;
}

function displayName(guest: Pick<Guest, "firstName" | "lastName">) {
  const first = String(guest.firstName ?? "").trim();
  const last = String(guest.lastName ?? "").trim();
  return last ? `${first} ${last.charAt(0)}.` : first;
}

type HubContextValue = {
  state: HubState;
  ready: boolean;
  me: Guest | null;
  publicGuests: Guest[];
  join: (input: {
    firstName: string;
    lastName: string;
    email: string;
    city: string;
    side: Side;
    photoDataUrl?: string;
  }) => void;
  leave: () => void;
  signOut: () => Promise<void>;
  updateVisibility: (visibility: Partial<Visibility>) => void;
  updateStay: (stay: StayArea | null) => void;
  updateProfile: (patch: Partial<Pick<Guest, "city" | "side" | "events">>) => void;
  updateMyAddress: (address: string) => void;
  postRide: (input: {
    kind: RideKind;
    from: string;
    to: string;
    date: string;
    time: string;
    seats: number;
    luggage: string;
    notes: string;
  }) => void;
  updateRide: (
    id: string,
    input: {
      kind: RideKind;
      from: string;
      to: string;
      date: string;
      time: string;
      seats: number;
      luggage: string;
      notes: string;
    },
  ) => void;
  deleteRide: (id: string) => void;
  askForSeat: (rideId: string, seats: number, note: string) => void;
  respondSeat: (askId: string, accept: boolean) => void;
  postMessage: (channel: ChatChannel, body: string, replyTo?: string) => void;
  deleteMessage: (id: string) => void;
  heartMessage: (id: string) => void;
  postGuestbook: (body: string, photoDataUrl?: string) => void;
  heartGuestbook: (id: string) => void;
  voteSong: (id: string, direction: "up" | "down", voterId: string) => void;
  suggestSong: (title: string, artist: string, suggestedBy?: string) => void;
  moderateSong: (id: string, approved: boolean) => void;
  upsertInvite: (invite: InviteRecord) => void;
  deleteInvite: (id: string) => void;
  importInvites: (invites: InviteRecord[]) => void;
  recordGuestEntry: (input: {
    inviteId?: string;
    firstName: string;
    lastName: string;
    email: string;
    location?: string;
    fromList: boolean;
  }) => void;
  setHeroImage: (src: string) => void;
  uploadPhoto: (album: PhotoAlbum, caption: string, src: string) => void;
  updatePhotoCaption: (id: string, caption: string) => void;
  updatePhotoAlbum: (id: string, album: PhotoAlbum) => void;
  deletePhoto: (id: string) => void;
  addPhotoFolder: (label: string) => void;
  renamePhotoFolder: (id: string, label: string) => void;
  removePhotoFolder: (id: string) => void;
  moderatePhoto: (id: string, approved: boolean) => void;
  savePlace: (id: string) => void;
  addScore: (gameId: string, points: number) => void;
  savePredictions: (answers: Record<string, string>) => void;
  submitRsvp: (record: Omit<RsvpRecord, "id" | "submittedAt">) => Promise<boolean>;
  updateRsvp: (rsvp: RsvpRecord) => void;
  deleteRsvp: (id: string) => void;
  publishAnnouncement: (input: Omit<Announcement, "id" | "publishedAt">) => void;
  subscribeUpdates: (email: string) => void;
  loginAdmin: (code: string) => boolean;
  enableAdmin: () => void;
  logoutAdmin: () => void;
  setInviteCanEditSite: (id: string, on: boolean) => void;
  setSiteEditing: (on: boolean) => void;
  updateIdentityFromGate: (firstName: string, lastName: string, email: string) => void;
  updateSiteCopy: (id: string, value: string) => void;
  updateSiteImage: (id: string, src: string) => void;
  hideSiteItem: (id: string) => void;
  showSiteItem: (id: string) => void;
  togglePageHidden: (href: string) => void;
  setGameQuestions: (gameId: string, questions: QuizQuestion[]) => void;
  setPhotoQuestions: (questions: PhotoQuestion[]) => void;
  setPredictionQuestions: (questions: PredictionQuestion[]) => void;
  setEventAccess: (eventId: string, tags: string[]) => void;
  setPageAccess: (href: string, tags: string[]) => void;
  addAccessTag: (label: string) => void;
  updateAccessTag: (id: string, label: string) => void;
  removeAccessTag: (id: string) => void;
  deleteGuestbook: (id: string) => void;
  resetHub: () => void;
};

const HubContext = createContext<HubContextValue | null>(null);

export function HubProvider({
  children,
  adminFromServer = false,
}: {
  children: ReactNode;
  adminFromServer?: boolean;
}) {
  const [state, setState] = useState<HubState>(EMPTY_STATE);
  const [ready, setReady] = useState(false);

  useEffect(() => {
    let cancelled = false;
    void (async () => {
    const [cachedImages, cachedPhotos] = await Promise.all([loadCachedSiteImages(), loadCachedGuestPhotos()]);
    if (cancelled) return;
    const cachedSiteImages = Object.fromEntries(
      Object.entries(cachedImages).map(([id, image]) => {
        siteImageTimes[id] = Math.max(siteImageTimes[id] ?? 0, image.updatedAt);
        return [id, image.src];
      }),
    );
    try {
      const raw = window.localStorage.getItem(STORAGE_KEY);
      if (raw) {
        const parsed = JSON.parse(raw) as HubState;
        setState({
          ...EMPTY_STATE,
          ...parsed,
          guests: (Array.isArray(parsed.guests) ? parsed.guests : []).flatMap((guest) => {
            const next = normalizeLoadedGuest(guest);
            return next ? [next] : [];
          }),
          songs: (Array.isArray(parsed.songs) ? parsed.songs : []).flatMap((song) => {
            const next = migrateSong(song as Song & { votes?: string[] });
            return next ? [next] : [];
          }),
          rides: Array.isArray(parsed.rides) ? parsed.rides : [],
          seatAsks: Array.isArray(parsed.seatAsks) ? parsed.seatAsks : [],
          messages: Array.isArray(parsed.messages) ? parsed.messages : [],
          guestbook: Array.isArray(parsed.guestbook) ? parsed.guestbook : [],
          photos: mergeGuestPhotoLists(Array.isArray(parsed.photos) ? parsed.photos : [], cachedPhotos),
          photoFolders: normalizePhotoFolders(parsed.photoFolders),
          announcements: Array.isArray(parsed.announcements) ? parsed.announcements : [],
          rsvps: (Array.isArray(parsed.rsvps) ? parsed.rsvps : []).flatMap((rsvp) => {
            const next = normalizeLoadedRsvp(rsvp);
            return next ? [next] : [];
          }),
          savedPlaces: Array.isArray(parsed.savedPlaces) ? parsed.savedPlaces : [],
          completedGames: Array.isArray(parsed.completedGames) ? parsed.completedGames : [],
          gameScores: parsed.gameScores && typeof parsed.gameScores === "object" ? parsed.gameScores : {},
          predictions: parsed.predictions && typeof parsed.predictions === "object" ? parsed.predictions : {},
          heroImage:
            !parsed.heroImage || parsed.heroImage === "/images/amalfi-coast.jpg"
              ? DEFAULT_HERO
              : parsed.heroImage,
          siteCopy: parsed.siteCopy && typeof parsed.siteCopy === "object" ? parsed.siteCopy : {},
          siteImages: {
            ...(parsed.siteImages && typeof parsed.siteImages === "object" ? parsed.siteImages : {}),
            ...cachedSiteImages,
          },
          siteHidden: Array.isArray(parsed.siteHidden) ? parsed.siteHidden : [],
          hiddenPages: Array.isArray(parsed.hiddenPages) ? parsed.hiddenPages : [],
          siteEditing: false,
          invites: (Array.isArray(parsed.invites) ? parsed.invites : []).flatMap((invite) => {
            if (!invite || typeof invite !== "object") return [];
            const invited = invite.invited !== false;
            const tags = Array.isArray(invite.tags) ? invite.tags.map(String).filter(Boolean) : [];
            return [
              {
                ...invite,
                firstName: String(invite.firstName ?? "").trim(),
                lastName: String(invite.lastName ?? "").trim(),
                email: String(invite.email ?? "").trim(),
                address: String(invite.address ?? "").trim(),
                party: asStringList(invite.party),
                events: Array.isArray(invite.events) ? invite.events : [],
                tags: tags.length ? tags : invited ? [...DEFAULT_GUEST_TAGS] : [],
                invited,
                entered: Boolean(invite.entered),
                canEditSite: Boolean(invite.canEditSite),
              },
            ];
          }),
          gameQuestions: {
            "know-us": questionsWithOptions(parsed.gameQuestions?.["know-us"], KNOW_US_QUESTIONS),
            trivia: questionsWithOptions(parsed.gameQuestions?.trivia, TRIVIA_QUESTIONS),
          },
          photoQuestions: questionsWithOptions(parsed.photoQuestions, PHOTO_QUESTIONS),
          predictionQuestions: questionsWithOptions(parsed.predictionQuestions, PREDICTION_QUESTIONS),
          eventAccess: { ...EVENT_ACCESS, ...parsed.eventAccess },
          pageAccess: { ...PAGE_ACCESS, ...parsed.pageAccess },
          accessTags: parsed.accessTags?.length ? parsed.accessTags : ACCESS_TAGS.map((tag) => ({ ...tag })),
          adminAuthed: parsed.identity
            ? isCoupleAdmin(
                String(parsed.identity.firstName ?? ""),
                String(parsed.identity.email ?? ""),
                String(parsed.identity.lastName ?? ""),
              )
            : Boolean(parsed.adminAuthed || adminFromServer),
          siteEditor: Boolean(
            parsed.siteEditor ||
              identityCanEditSite(parsed.identity, Array.isArray(parsed.invites) ? parsed.invites : []),
          ),
        });
      } else if (adminFromServer || cachedPhotos.length || Object.keys(cachedSiteImages).length) {
        setState({ ...EMPTY_STATE, adminAuthed: adminFromServer, photos: cachedPhotos, siteImages: cachedSiteImages });
      }
    } catch {
      setState(
        adminFromServer || cachedPhotos.length || Object.keys(cachedSiteImages).length
          ? { ...EMPTY_STATE, adminAuthed: adminFromServer, photos: cachedPhotos, siteImages: cachedSiteImages }
          : EMPTY_STATE,
      );
    }
    if (!cancelled) setReady(true);
    })();
    return () => {
      cancelled = true;
    };
  }, [adminFromServer]);

  useEffect(() => {
    if (!ready) return;
    persistHubState(state);
  }, [state, ready]);

  useEffect(() => {
    if (!ready) return;
    let cancelled = false;
    void fetchSharedInvites().then((remote) => {
      if (cancelled) return;
      setState((prev) => {
        if (!remote.length) {
          if (prev.adminAuthed && prev.invites.length) void syncSharedInvites(prev.invites);
          return prev;
        }
        const invites = mergeInviteLists(prev.invites, remote);
        if (invites === prev.invites || (invites.length === prev.invites.length && invites.every((invite, index) => invite.id === prev.invites[index]?.id))) {
          return prev;
        }
        return { ...prev, invites };
      });
    });
    return () => {
      cancelled = true;
    };
  }, [ready]);

  useEffect(() => {
    if (!ready) return;
    let cancelled = false;
    void fetchSharedRsvps().then((remote) => {
      if (cancelled || !remote.length) return;
      setState((prev) => {
        const rsvps = mergeRsvpLists(prev.rsvps, remote);
        if (
          rsvps.length === prev.rsvps.length &&
          rsvps.every(
            (rsvp, index) =>
              rsvp.id === prev.rsvps[index]?.id && rsvp.submittedAt === prev.rsvps[index]?.submittedAt,
          )
        ) {
          return prev;
        }
        return { ...prev, rsvps };
      });
    });
    return () => {
      cancelled = true;
    };
  }, [ready]);

  useEffect(() => {
    if (!ready) return;
    let cancelled = false;
    void fetchSiteContent().then((remote) => {
      if (cancelled || !remote) return;
      siteContentReady = true;
      setState((prev) => {
        const chosenGames = chooseGameQuestions(remote.gameQuestions, prev.gameQuestions);
        const gameQuestions = {
          ...chosenGames,
          "know-us": questionsWithOptions(chosenGames["know-us"], KNOW_US_QUESTIONS),
          trivia: questionsWithOptions(chosenGames.trivia, TRIVIA_QUESTIONS),
        };
        const photoQuestions = questionsWithOptions(
          chooseSavedList(remote.photoQuestions, prev.photoQuestions, PHOTO_QUESTIONS),
          PHOTO_QUESTIONS,
        );
        const predictionQuestions = questionsWithOptions(
          chooseSavedList(remote.predictionQuestions, prev.predictionQuestions, PREDICTION_QUESTIONS),
          PREDICTION_QUESTIONS,
        );
        const remoteImages =
          remote.siteImages && typeof remote.siteImages === "object" ? remote.siteImages : {};
        const remoteTimes = remote.siteImageUpdatedAt ?? {};
        const siteImages = { ...prev.siteImages };
        for (const [id, src] of Object.entries(remoteImages)) {
          if (!src || dirtySiteImages.has(id)) continue;
          const remoteAt = Number(remoteTimes[id] ?? 0);
          const localAt = Number(siteImageTimes[id] ?? 0);
          if (!siteImages[id] || remoteAt >= localAt) {
            siteImages[id] = src;
            if (remoteAt) siteImageTimes[id] = remoteAt;
          }
        }
        for (const [id, src] of Object.entries(siteImages)) {
          const localAt = Number(siteImageTimes[id] ?? 0);
          const remoteAt = Number(remoteTimes[id] ?? 0);
          if (String(src).startsWith("data:") && (!remoteImages[id] || localAt > remoteAt)) dirtySiteImages.add(id);
        }
        const next = {
          ...prev,
          siteCopy: { ...remote.siteCopy, ...prev.siteCopy },
          siteImages,
          siteHidden: Array.isArray(remote.siteHidden) ? remote.siteHidden : [],
          hiddenPages: Array.isArray(remote.hiddenPages) ? remote.hiddenPages : [],
          heroImage:
            prev.heroImage && prev.heroImage !== DEFAULT_HERO ? prev.heroImage : remote.heroImage || prev.heroImage,
          photoFolders: mergePhotoFolders(remote.photoFolders, prev.photoFolders),
          gameQuestions,
          photoQuestions,
          predictionQuestions,
        };
        const shouldShare =
          queuedSiteContent ||
          dirtySiteImages.size > 0 ||
          (!sameJson(gameQuestions, remote.gameQuestions) &&
            !sameJson(gameQuestions, { "know-us": KNOW_US_QUESTIONS, trivia: TRIVIA_QUESTIONS })) ||
          (!sameJson(photoQuestions, remote.photoQuestions) && !sameJson(photoQuestions, PHOTO_QUESTIONS)) ||
          (!sameJson(predictionQuestions, remote.predictionQuestions) &&
            !sameJson(predictionQuestions, PREDICTION_QUESTIONS));
        if (shouldShare) publishSiteContent(next);
        return next;
      });
    });
    return () => {
      cancelled = true;
    };
  }, [ready]);

  useEffect(() => {
    if (!ready) return;
    let cancelled = false;
    void fetchSharedPhotos().then((remote) => {
      if (cancelled) return;
      setState((prev) => {
        for (const photo of prev.photos) {
          if (remote.some((item) => item.id === photo.id)) continue;
          dirtyPhotoIds.add(photo.id);
          void rememberGuestPhoto(photo);
          void syncGuestPhoto(photo);
        }
        return { ...prev, photos: mergeGuestPhotoLists(prev.photos, remote) };
      });
    });
    return () => {
      cancelled = true;
    };
  }, [ready]);

  useEffect(() => {
    if (!ready || state.adminAuthed) return;
    const name = state.identity?.firstName ?? "";
    const email = state.identity?.email ?? "";
    const last = state.identity?.lastName ?? "";
    if (!isCoupleAdmin(name, email, last)) return;
    setState((prev) => ({ ...prev, adminAuthed: true }));
    void setAdminCookie();
  }, [ready, state.adminAuthed, state.identity, state.identity?.email, state.identity?.firstName, state.identity?.lastName]);

  useEffect(() => {
    if (!ready || !state.adminAuthed) return;
    void syncRideDigestEmails(collectHubEmails(state));
  }, [ready, state.adminAuthed, state.invites, state.rsvps, state.guests, state.identity?.email]);

  useEffect(() => {
    if (!ready || !state.identity || state.adminAuthed) return;
    if (!identityCanEditSite(state.identity, state.invites) || state.siteEditor) return;
    setState((prev) => ({ ...prev, siteEditor: true }));
  }, [ready, state.adminAuthed, state.identity, state.invites, state.siteEditor]);

  useEffect(() => {
    if (!ready || !state.identity || state.adminAuthed) return;
    const identity = state.identity;
    let cancelled = false;
    void checkSiteEditor(identity).then((editor) => {
      if (cancelled) return;
      setState((prev) => {
        const next = editor || identityCanEditSite(identity, prev.invites);
        if (prev.siteEditor === next) return prev;
        return { ...prev, siteEditor: next, siteEditing: next ? prev.siteEditing : false };
      });
    });
    return () => {
      cancelled = true;
    };
  }, [ready, state.adminAuthed, state.identity?.email, state.identity?.firstName, state.identity?.lastName]);

  const me = useMemo(
    () => state.guests.find((guest) => guest.id === state.identity?.guestId) ?? null,
    [state.guests, state.identity],
  );

  const publicGuests = useMemo(
    () => state.guests.filter((guest) => guest.visibility.showInDirectory && guest.attending),
    [state.guests],
  );

  const join: HubContextValue["join"] = useCallback((input) => {
    const coupleAdmin = isCoupleAdmin(input.firstName.trim(), input.email.trim(), input.lastName.trim());
    setState((prev) => {
      const guestId = uid("me");
      const guest: Guest = {
        id: guestId,
        firstName: input.firstName.trim(),
        lastName: input.lastName.trim(),
        email: input.email.trim(),
        city: input.city.trim() || "Somewhere wonderful",
        side: input.side,
        group: "friends",
        stay: null,
        events: ["welcome", "ceremony", "reception", "brunch"],
        points: 50,
        attending: true,
        fromNyc: /new york|nyc|brooklyn|queens|bronx/i.test(input.city),
        fromAbroad: false,
        couple: coupleAdmin,
        visibility: { ...DEFAULT_VIS },
        avatarHue: Math.floor(Math.random() * 140),
        joinedAt: new Date().toISOString(),
      };
      const identity: Identity = {
        guestId,
        firstName: guest.firstName,
        lastName: guest.lastName,
        email: guest.email ?? input.email,
        city: guest.city,
        side: guest.side,
        photoDataUrl: input.photoDataUrl,
      };
      return {
        ...prev,
        identity,
        guests: [guest, ...prev.guests],
        adminAuthed: coupleAdmin,
        siteEditor: coupleAdmin ? prev.siteEditor : identityCanEditSite(identity, prev.invites),
        siteEditing: coupleAdmin ? prev.siteEditing : false,
      };
    });
    if (coupleAdmin) void setAdminCookie();
    else void clearAdminCookie();
  }, []);

  const updateIdentityFromGate = useCallback((firstName: string, lastName: string, email: string) => {
    const name = firstName.trim();
    if (!name) return;
    const mail = email.trim();
    const last = lastName.trim();
    let coupleAdmin = isCoupleAdmin(name, mail, last);
    let applied = false;
    setState((prev) => {
      if (!prev.identity) return prev;
      coupleAdmin = isCoupleAdmin(name, mail || prev.identity.email, last || prev.identity.lastName);
      applied = true;
      return {
        ...prev,
        identity: {
          ...prev.identity,
          firstName: name,
          lastName: lastName.trim() || prev.identity.lastName,
          email: mail || prev.identity.email,
        },
        guests: prev.guests.map((guest) =>
          guest.id === prev.identity?.guestId
            ? { ...guest, firstName: name, lastName: lastName.trim() || guest.lastName, email: mail || guest.email }
            : guest,
        ),
        adminAuthed: coupleAdmin,
        siteEditor: coupleAdmin
          ? prev.siteEditor
          : identityCanEditSite(
              { firstName: name, lastName: lastName.trim(), email: mail || prev.identity.email },
              prev.invites,
            ),
        siteEditing: coupleAdmin ? prev.siteEditing : false,
      };
    });
    if (!applied) return;
    if (coupleAdmin) void setAdminCookie();
    else void clearAdminCookie();
  }, []);

  const leave = useCallback(() => {
    setState((prev) => ({ ...prev, identity: null }));
  }, []);

  const signOut = useCallback(async () => {
    setState((prev) => {
      const next = {
        ...prev,
        identity: null,
        adminAuthed: false,
        siteEditor: false,
        siteEditing: false,
      };
      persistHubState(next);
      return next;
    });
    await clearAdminCookie();
    await clearGateCookie();
    window.location.assign("/");
  }, []);

  const updateVisibility = useCallback((visibility: Partial<Visibility>) => {
    setState((prev) => {
      if (!prev.identity) return prev;
      return {
        ...prev,
        guests: prev.guests.map((guest) =>
          guest.id === prev.identity?.guestId
            ? { ...guest, visibility: { ...guest.visibility, ...visibility } }
            : guest,
        ),
      };
    });
  }, []);

  const updateStay = useCallback((stay: StayArea | null) => {
    setState((prev) => {
      if (!prev.identity) return prev;
      return {
        ...prev,
        guests: prev.guests.map((guest) =>
          guest.id === prev.identity?.guestId ? { ...guest, stay } : guest,
        ),
      };
    });
  }, []);

  const updateMyAddress = useCallback((address: string) => {
    const value = address.trim();
    setState((prev) => {
      if (!prev.identity) return prev;
      const email = String(prev.identity.email ?? "").trim().toLowerCase();
      const first = String(prev.identity.firstName ?? "").trim().toLowerCase();
      const last = String(prev.identity.lastName ?? "").trim().toLowerCase();
      const full = `${first} ${last}`.trim();
      const samePerson = (invite: InviteRecord) => {
        if (email && String(invite.email ?? "").trim().toLowerCase() === email) return true;
        if (
          String(invite.firstName ?? "").trim().toLowerCase() === first &&
          String(invite.lastName ?? "").trim().toLowerCase() === last &&
          first
        ) {
          return true;
        }
        return Boolean(full && householdNames(invite).some((name) => name.toLowerCase() === full));
      };
      const matched = prev.invites.some(samePerson);
      const invites = matched
        ? prev.invites.map((invite) => (samePerson(invite) ? { ...invite, address: value } : invite))
        : [
              {
                id: uid("inv"),
                firstName: prev.identity.firstName,
                lastName: prev.identity.lastName,
                email: prev.identity.email,
                location: "",
                address: value,
                inItaly: false,
                party: [],
                events: ["welcome", "ceremony", "reception", "brunch"] as EventId[],
                tags: [...DEFAULT_GUEST_TAGS],
                invited: true,
                entered: true,
              },
              ...prev.invites,
            ];
      void syncSharedInvites(invites);
      return {
        ...prev,
        invites,
        guests: prev.guests.map((guest) =>
          guest.id === prev.identity?.guestId ? { ...guest, address: value } : guest,
        ),
      };
    });
  }, []);

  const updateProfile = useCallback((patch: Partial<Pick<Guest, "city" | "side" | "events">>) => {
    setState((prev) => {
      if (!prev.identity) return prev;
      return {
        ...prev,
        guests: prev.guests.map((guest) =>
          guest.id === prev.identity?.guestId ? { ...guest, ...patch } : guest,
        ),
      };
    });
  }, []);

  const postRide: HubContextValue["postRide"] = useCallback((input) => {
    let queued: Parameters<typeof queueRideDigest>[0] | null = null;
    setState((prev) => {
      if (!prev.identity) return prev;
      const ride: Ride = {
        id: uid("ride"),
        kind: input.kind,
        authorId: prev.identity.guestId,
        from: input.from,
        to: input.to,
        date: input.date,
        time: input.time,
        seats: input.seats,
        seatsTaken: 0,
        luggage: input.luggage,
        notes: input.notes,
        status: "open",
      };
      queued = {
        id: ride.id,
        kind: ride.kind,
        authorName: `${prev.identity.firstName} ${prev.identity.lastName}`.trim() || "Guest",
        from: ride.from,
        to: ride.to,
        date: ride.date,
        time: ride.time,
        seats: ride.seats,
        notes: ride.notes,
        emails: collectHubEmails(prev),
      };
      return { ...prev, rides: [ride, ...prev.rides] };
    });
    if (queued) void queueRideDigest(queued);
  }, []);

  const updateRide: HubContextValue["updateRide"] = useCallback((id, input) => {
    setState((prev) => {
      const current = prev.rides.find((ride) => ride.id === id);
      if (!current) return prev;
      const allowed = prev.identity?.guestId === current.authorId || prev.adminAuthed;
      if (!allowed) return prev;
      const seatsTaken = Math.min(current.seatsTaken, input.seats);
      const status: RideStatus =
        seatsTaken >= input.seats ? "full" : current.status === "full" ? "open" : current.status;
      return {
        ...prev,
        rides: prev.rides.map((ride) =>
          ride.id === id ? { ...ride, ...input, seatsTaken, status } : ride,
        ),
      };
    });
  }, []);

  const deleteRide = useCallback((id: string) => {
    setState((prev) => {
      const current = prev.rides.find((ride) => ride.id === id);
      if (!current) return prev;
      const allowed = prev.identity?.guestId === current.authorId || prev.adminAuthed;
      if (!allowed) return prev;
      return {
        ...prev,
        rides: prev.rides.filter((ride) => ride.id !== id),
        seatAsks: prev.seatAsks.filter((ask) => ask.rideId !== id),
      };
    });
  }, []);

  const askForSeat = useCallback((rideId: string, seats: number, note: string) => {
    setState((prev) => {
      if (!prev.identity) return prev;
      const ask: SeatAsk = {
        id: uid("ask"),
        rideId,
        fromGuestId: prev.identity.guestId,
        seats,
        note,
        status: "pending",
      };
      return {
        ...prev,
        seatAsks: [ask, ...prev.seatAsks],
        rides: prev.rides.map((ride) =>
          ride.id === rideId && ride.status === "open" ? { ...ride, status: "pending" } : ride,
        ),
      };
    });
  }, []);

  const respondSeat = useCallback((askId: string, accept: boolean) => {
    setState((prev) => {
      const ask = prev.seatAsks.find((item) => item.id === askId);
      if (!ask) return prev;
      return {
        ...prev,
        seatAsks: prev.seatAsks.map((item) =>
          item.id === askId ? { ...item, status: accept ? "accepted" : "declined" } : item,
        ),
        rides: prev.rides.map((ride) => {
          if (ride.id !== ask.rideId) return ride;
          if (!accept) {
            const remaining = prev.seatAsks.filter(
              (item) => item.rideId === ride.id && item.id !== askId && item.status === "pending",
            );
            return { ...ride, status: remaining.length ? "pending" : "open" };
          }
          const seatsTaken = ride.seatsTaken + ask.seats;
          const status: RideStatus = seatsTaken >= ride.seats ? "full" : "confirmed";
          return { ...ride, seatsTaken, status };
        }),
      };
    });
  }, []);

  const postMessage = useCallback((channel: ChatChannel, body: string, replyTo?: string) => {
    setState((prev) => {
      if (!prev.identity) return prev;
      const message: ChatMessage = {
        id: uid("msg"),
        channel,
        authorId: prev.identity.guestId,
        body: body.trim(),
        createdAt: new Date().toISOString(),
        replyTo,
        hearts: [],
      };
      return { ...prev, messages: [message, ...prev.messages] };
    });
  }, []);

  const deleteMessage = useCallback((id: string) => {
    setState((prev) => ({
      ...prev,
      messages: prev.messages.filter((message) => {
        const mine = message.authorId === prev.identity?.guestId;
        return message.id === id ? !(mine || prev.adminAuthed) : true;
      }),
    }));
  }, []);

  const heartMessage = useCallback((id: string) => {
    setState((prev) => {
      const who = prev.identity?.guestId;
      if (!who) return prev;
      return {
        ...prev,
        messages: prev.messages.map((message) => {
          if (message.id !== id) return message;
          const hearts = message.hearts.includes(who)
            ? message.hearts.filter((item) => item !== who)
            : [...message.hearts, who];
          return { ...message, hearts };
        }),
      };
    });
  }, []);

  const postGuestbook = useCallback((body: string, photoDataUrl?: string) => {
    setState((prev) => {
      const note: GuestbookNote = {
        id: uid("gb"),
        authorId: prev.identity?.guestId ?? null,
        authorName: prev.identity
          ? displayName({ firstName: prev.identity.firstName, lastName: prev.identity.lastName })
          : "A guest",
        body: body.trim(),
        photoDataUrl,
        createdAt: new Date().toISOString(),
        hearts: [],
      };
      return { ...prev, guestbook: [note, ...prev.guestbook] };
    });
  }, []);

  const heartGuestbook = useCallback((id: string) => {
    setState((prev) => {
      const who = prev.identity?.guestId ?? "anon";
      return {
        ...prev,
        guestbook: prev.guestbook.map((note) => {
          if (note.id !== id) return note;
          const hearts = note.hearts.includes(who)
            ? note.hearts.filter((item) => item !== who)
            : [...note.hearts, who];
          return { ...note, hearts };
        }),
      };
    });
  }, []);

  const voteSong = useCallback((id: string, direction: "up" | "down", voterId: string) => {
    if (!voterId) return;
    setState((prev) => ({
      ...prev,
      songs: prev.songs.map((song) => {
        if (song.id !== id || !song.approved) return song;
        const ups = Array.isArray(song.ups) ? song.ups : [];
        const downs = Array.isArray(song.downs) ? song.downs : [];
        const inUp = ups.includes(voterId);
        const inDown = downs.includes(voterId);
        if (direction === "up") {
          if (inUp) return song;
          return {
            ...song,
            ups: [...ups, voterId],
            downs: downs.filter((item) => item !== voterId),
          };
        }
        if (inDown) return song;
        return {
          ...song,
          downs: [...downs, voterId],
          ups: ups.filter((item) => item !== voterId),
        };
      }),
    }));
  }, []);

  const suggestSong = useCallback((title: string, artist: string, suggestedBy?: string) => {
    setState((prev) => {
      const song: Song = {
        id: uid("song"),
        title: title.trim(),
        artist: artist.trim(),
        category: "classics",
        suggestedBy:
          suggestedBy?.trim() ||
          (prev.identity
            ? displayName({ firstName: prev.identity.firstName, lastName: prev.identity.lastName })
            : "Guest"),
        approved: true,
        ups: [],
        downs: [],
      };
      return { ...prev, songs: [song, ...prev.songs] };
    });
  }, []);

  const upsertInvite = useCallback((invite: InviteRecord) => {
    setState((prev) => {
      const exists = prev.invites.some((item) => item.id === invite.id);
      const invites = exists
        ? prev.invites.map((item) => (item.id === invite.id ? invite : item))
        : [invite, ...prev.invites];
      void syncSiteEditors(editorsFromInvites(invites));
      void syncSharedInvites(invites);
      return {
        ...prev,
        invites,
        siteEditor: prev.adminAuthed ? prev.siteEditor : identityCanEditSite(prev.identity, invites),
      };
    });
  }, []);

  const deleteInvite = useCallback((id: string) => {
    setState((prev) => {
      const invites = prev.invites.filter((item) => item.id !== id);
      void syncSiteEditors(editorsFromInvites(invites));
      void syncSharedInvites(invites);
      return {
        ...prev,
        invites,
        siteEditor: prev.adminAuthed ? prev.siteEditor : identityCanEditSite(prev.identity, invites),
      };
    });
  }, []);

  const importInvites = useCallback((invites: InviteRecord[]) => {
    setState((prev) => {
      const next = [...prev.invites];
      for (const invite of invites) {
        const index = next.findIndex(
          (item) =>
            item.firstName.toLowerCase() === invite.firstName.toLowerCase() &&
            item.lastName.toLowerCase() === invite.lastName.toLowerCase(),
        );
        if (index >= 0) {
          next[index] = {
            ...next[index],
            ...invite,
            id: next[index].id,
            address: invite.address?.trim() || next[index].address,
          };
        }
        else next.unshift(invite);
      }
      void syncSiteEditors(editorsFromInvites(next));
      void syncSharedInvites(next);
      return {
        ...prev,
        invites: next,
        siteEditor: prev.adminAuthed ? prev.siteEditor : identityCanEditSite(prev.identity, next),
      };
    });
  }, []);

  const setInviteCanEditSite = useCallback((id: string, on: boolean) => {
    setState((prev) => {
      const invites = prev.invites.map((invite) =>
        invite.id === id ? { ...invite, canEditSite: on } : invite,
      );
      void syncSiteEditors(editorsFromInvites(invites));
      void syncSharedInvites(invites);
      return {
        ...prev,
        invites,
        siteEditor: prev.adminAuthed ? prev.siteEditor : identityCanEditSite(prev.identity, invites),
      };
    });
  }, []);

  const recordGuestEntry = useCallback(
    (input: {
      inviteId?: string;
      firstName: string;
      lastName: string;
      email: string;
      location?: string;
      fromList: boolean;
    }) => {
      const email = String(input.email ?? "").trim().toLowerCase();
      const first = String(input.firstName ?? "").trim();
      const last = String(input.lastName ?? "").trim();
      if (!first) return;
      setState((prev) => {
        const samePerson = (invite: InviteRecord) => {
          if (!invite) return false;
          if (input.inviteId && invite.id === input.inviteId) return true;
          const inviteEmail = String(invite.email ?? "").trim().toLowerCase();
          if (email && inviteEmail && inviteEmail === email) return true;
          const inviteFirst = String(invite.firstName ?? "").trim().toLowerCase();
          const inviteLast = String(invite.lastName ?? "").trim().toLowerCase();
          if (inviteFirst === first.toLowerCase() && (!last || inviteLast === last.toLowerCase())) return true;
          const household = householdNames(invite).map((name) => name.toLowerCase());
          const full = `${first} ${last}`.trim().toLowerCase();
          return Boolean(full && household.includes(full));
        };

        const index = prev.invites.findIndex(samePerson);
        if (index >= 0) {
          const current = prev.invites[index];
          const nextEmail = email || current.email;
          if (current.entered && nextEmail === current.email) return prev;
          return {
            ...prev,
            invites: prev.invites.map((invite, i) =>
              i === index ? { ...invite, email: nextEmail, entered: true } : invite,
            ),
          };
        }

        const walkIn: InviteRecord = {
          id: uid("walk"),
          firstName: first,
          lastName: last,
          email,
          phone: "",
          location: input.location?.trim() ?? "",
          inItaly: false,
          party: [],
          events: [],
          tags: [],
          invited: false,
          entered: true,
        };
        return { ...prev, invites: [walkIn, ...prev.invites] };
      });
    },
    [],
  );

  const setHeroImage = useCallback((src: string) => {
    setState((prev) => {
      const next = { ...prev, heroImage: src };
      publishSiteContent(next);
      return next;
    });
  }, []);

  const moderateSong = useCallback((id: string, approved: boolean) => {
    setState((prev) => ({
      ...prev,
      songs: approved
        ? prev.songs.map((song) => (song.id === id ? { ...song, approved: true } : song))
        : prev.songs.filter((song) => song.id !== id),
    }));
  }, []);

  const uploadPhoto = useCallback((album: PhotoAlbum, caption: string, src: string) => {
    setState((prev) => {
      if (!prev.identity) return prev;
      const photo: GuestPhoto = {
        id: uid("photo"),
        authorId: prev.identity.guestId,
        album,
        caption,
        src,
        approved: true,
        createdAt: new Date().toISOString(),
      };
      dirtyPhotoIds.add(photo.id);
      void rememberGuestPhoto(photo);
      void syncGuestPhoto(photo);
      return { ...prev, photos: [photo, ...prev.photos] };
    });
  }, []);

  const sharePhotoChange = (photo: GuestPhoto | undefined) => {
    if (!photo) return;
    dirtyPhotoIds.add(photo.id);
    void rememberGuestPhoto(photo);
    void syncGuestPhoto(photo);
  };

  const moderatePhoto = useCallback((id: string, approved: boolean) => {
    setState((prev) => {
      const current = prev.photos.find((photo) => photo.id === id);
      if (!approved) {
        dirtyPhotoIds.delete(id);
        void forgetGuestPhoto(id);
        void removeSharedPhoto(id);
        return { ...prev, photos: prev.photos.filter((photo) => photo.id !== id) };
      }
      const next = current ? { ...current, approved: true } : undefined;
      sharePhotoChange(next);
      return {
        ...prev,
        photos: next ? prev.photos.map((photo) => (photo.id === id ? next : photo)) : prev.photos,
      };
    });
  }, []);

  const updatePhotoCaption = useCallback((id: string, caption: string) => {
    setState((prev) => {
      const next = prev.photos.find((photo) => photo.id === id);
      const updated = next ? { ...next, caption } : undefined;
      sharePhotoChange(updated);
      return {
        ...prev,
        photos: updated ? prev.photos.map((photo) => (photo.id === id ? updated : photo)) : prev.photos,
      };
    });
  }, []);

  const updatePhotoAlbum = useCallback((id: string, album: PhotoAlbum) => {
    setState((prev) => {
      const photo = prev.photos.find((item) => item.id === id);
      if (!photo) return prev;
      const allowed = prev.identity?.guestId === photo.authorId || prev.adminAuthed;
      if (!allowed) return prev;
      if (!prev.photoFolders.some((folder) => folder.id === album)) return prev;
      const updated = { ...photo, album };
      sharePhotoChange(updated);
      return {
        ...prev,
        photos: prev.photos.map((item) => (item.id === id ? updated : item)),
      };
    });
  }, []);

  const addPhotoFolder = useCallback((label: string) => {
    const name = label.trim();
    if (!name) return;
    setState((prev) => {
      if (!prev.adminAuthed) return prev;
      const folders = normalizePhotoFolders(prev.photoFolders);
      return commitPhotoFolders(prev, [...folders, { id: nextPhotoFolderId(name, folders), label: name }]);
    });
  }, []);

  const renamePhotoFolder = useCallback((id: string, label: string) => {
    const name = label.trim();
    if (!name) return;
    setState((prev) => {
      if (!prev.adminAuthed) return prev;
      return commitPhotoFolders(
        prev,
        normalizePhotoFolders(prev.photoFolders).map((folder) => (folder.id === id ? { ...folder, label: name } : folder)),
      );
    });
  }, []);

  const removePhotoFolder = useCallback((id: string) => {
    setState((prev) => {
      if (!prev.adminAuthed) return prev;
      const folders = normalizePhotoFolders(prev.photoFolders);
      if (folders.length <= 1) return prev;
      return commitPhotoFolders(
        prev,
        folders.filter((folder) => folder.id !== id),
      );
    });
  }, []);

  const deletePhoto = useCallback((id: string) => {
    setState((prev) => {
      const photo = prev.photos.find((item) => item.id === id);
      if (!photo) return prev;
      const allowed = prev.identity?.guestId === photo.authorId || prev.adminAuthed;
      if (!allowed) return prev;
      dirtyPhotoIds.delete(id);
      void forgetGuestPhoto(id);
      void removeSharedPhoto(id);
      return { ...prev, photos: prev.photos.filter((item) => item.id !== id) };
    });
  }, []);

  const savePlace = useCallback((id: string) => {
    setState((prev) => {
      const current = Array.isArray(prev.savedPlaces) ? prev.savedPlaces : [];
      const savedPlaces = current.includes(id) ? current.filter((item) => item !== id) : [...current, id];
      return { ...prev, savedPlaces };
    });
  }, []);

  const addScore = useCallback((gameId: string, points: number) => {
    setState((prev) => {
      if ((prev.completedGames ?? []).includes(gameId)) return prev;
      const nextPoints = (prev.gameScores[gameId] ?? 0) + points;
      return {
        ...prev,
        gameScores: { ...prev.gameScores, [gameId]: nextPoints },
        completedGames: [...prev.completedGames, gameId],
        guests: prev.identity
          ? prev.guests.map((guest) =>
              guest.id === prev.identity?.guestId
                ? { ...guest, points: guest.points + points }
                : guest,
            )
          : prev.guests,
      };
    });
  }, []);

  const savePredictions = useCallback((answers: Record<string, string>) => {
    setState((prev) => {
      if ((prev.completedGames ?? []).includes("predictions")) {
        return { ...prev, predictions: answers };
      }
      return {
        ...prev,
        predictions: answers,
        completedGames: [...prev.completedGames, "predictions"],
        gameScores: { ...prev.gameScores, predictions: 60 },
        guests: prev.identity
          ? prev.guests.map((guest) =>
              guest.id === prev.identity?.guestId ? { ...guest, points: guest.points + 60 } : guest,
            )
          : prev.guests,
      };
    });
  }, []);

  const submitRsvp = useCallback(async (record: Omit<RsvpRecord, "id" | "submittedAt">) => {
    const email = String(record.email ?? "").trim() || String(state.identity?.email ?? "").trim();
    const nameParts = String(record.name ?? "").trim().split(/\s+/).filter(Boolean);
    const firstName = nameParts[0] || state.identity?.firstName || "";
    const lastName = nameParts.slice(1).join(" ") || state.identity?.lastName || "";
    const rsvp: RsvpRecord = {
      ...record,
      email,
      partyAttending: Array.isArray(record.partyAttending) ? record.partyAttending : [],
      id: uid("rsvp"),
      submittedAt: new Date().toISOString(),
    };
    setState((prev) => {
      const events = record.attending && Array.isArray(record.events) ? record.events : [];
      const nameKey = `${firstName.trim().toLowerCase()}|${lastName.trim().toLowerCase()}`;
      const emailKey = email.trim().toLowerCase();
      const hasInvite = prev.invites.some((invite) => {
        if (record.inviteId && !String(record.inviteId).startsWith("new-") && invite.id === record.inviteId) return true;
        if (emailKey && String(invite.email ?? "").trim().toLowerCase() === emailKey) return true;
        return `${String(invite.firstName ?? "").trim().toLowerCase()}|${String(invite.lastName ?? "").trim().toLowerCase()}` === nameKey;
      });
      const party = rsvp.partyAttending.filter(
        (name) => String(name).trim().toLowerCase() !== String(rsvp.name ?? "").trim().toLowerCase(),
      );
      const nextEvents = (events.length ? events : ["welcome", "ceremony", "reception", "brunch"]) as EventId[];
      const matchesInvite = (invite: InviteRecord) => {
        if (record.inviteId && !String(record.inviteId).startsWith("new-") && invite.id === record.inviteId) return true;
        if (emailKey && String(invite.email ?? "").trim().toLowerCase() === emailKey) return true;
        return `${String(invite.firstName ?? "").trim().toLowerCase()}|${String(invite.lastName ?? "").trim().toLowerCase()}` === nameKey;
      };
      const invites: InviteRecord[] = hasInvite
        ? prev.invites.map((invite) =>
            matchesInvite(invite)
              ? {
                  ...invite,
                  email: email || invite.email,
                  party: party.length ? party : invite.party,
                  events: record.attending ? nextEvents : invite.events,
                  tags: Array.isArray(invite.tags) && invite.tags.length ? invite.tags : [...DEFAULT_GUEST_TAGS],
                  invited: record.attending ? true : invite.invited !== false,
                  entered: true,
                }
              : invite,
          )
        : [
            {
              id: record.inviteId && !String(record.inviteId).startsWith("new-") ? record.inviteId : uid("inv"),
              firstName: firstName || "Guest",
              lastName,
              email,
              location: "",
              inItaly: false,
              party,
              events: record.attending ? nextEvents : [],
              tags: record.attending ? [...DEFAULT_GUEST_TAGS] : [],
              invited: Boolean(record.attending),
              entered: true,
            },
            ...prev.invites,
          ];
      return {
        ...prev,
        invites,
        rsvps: mergeRsvpLists([rsvp, ...prev.rsvps], []),
        guests: prev.identity
          ? prev.guests.map((guest) =>
              guest.id === prev.identity?.guestId
                ? {
                    ...guest,
                    attending: record.attending,
                    events: events as EventId[],
                    dietary: record.dietary,
                    arrivalAirport: record.airport,
                    arrivalDate: record.arrivalDate,
                    departureDate: record.departureDate,
                    stay: record.stay || guest.stay,
                    email: email || guest.email,
                  }
                : guest,
            )
          : prev.guests,
      };
    });
    try {
      const result = await syncSharedRsvp({
        ...rsvp,
        firstName,
        lastName,
      });
      const remote = await fetchSharedInvites();
      setState((prev) => ({
        ...prev,
        rsvps: result.rsvp ? mergeRsvpLists([result.rsvp, ...prev.rsvps], []) : prev.rsvps,
        invites: remote.length ? mergeInviteLists(prev.invites, remote) : prev.invites,
      }));
      return result.ok;
    } catch {
      return false;
    }
  }, [state.identity]);

  const updateRsvp = useCallback((rsvp: RsvpRecord) => {
    const nameParts = String(rsvp.name ?? "").trim().split(/\s+/).filter(Boolean);
    setState((prev) => {
      const exists = prev.rsvps.some((item) => item.id === rsvp.id);
      return {
        ...prev,
        rsvps: exists
          ? prev.rsvps.map((item) => (item.id === rsvp.id ? rsvp : item))
          : mergeRsvpLists([rsvp, ...prev.rsvps], []),
      };
    });
    void syncSharedRsvp({
      ...rsvp,
      firstName: nameParts[0] || "",
      lastName: nameParts.slice(1).join(" "),
      skipEmail: true,
    })
      .then(async (result) => {
        const remote = await fetchSharedInvites();
        setState((prev) => ({
          ...prev,
          rsvps: result.rsvp ? mergeRsvpLists([result.rsvp, ...prev.rsvps], []) : prev.rsvps,
          invites: remote.length ? mergeInviteLists(prev.invites, remote) : prev.invites,
        }));
      })
      .catch(() => undefined);
  }, []);

  const deleteRsvp = useCallback((id: string) => {
    setState((prev) => ({ ...prev, rsvps: prev.rsvps.filter((item) => item.id !== id) }));
    void fetch(`/api/rsvp?id=${encodeURIComponent(id)}`, { method: "DELETE" }).catch(() => undefined);
  }, []);

  const publishAnnouncement = useCallback((input: Omit<Announcement, "id" | "publishedAt">) => {
    setState((prev) => ({
      ...prev,
      announcements: [
        { ...input, id: uid("ann"), publishedAt: new Date().toISOString() },
        ...prev.announcements,
      ],
    }));
  }, []);

  const subscribeUpdates = useCallback((email: string) => {
    setState((prev) => ({ ...prev, subscribedEmail: email }));
  }, []);

  const enableAdmin = useCallback(() => {
    setState((prev) => (prev.adminAuthed ? prev : { ...prev, adminAuthed: true }));
    void setAdminCookie();
  }, []);

  const loginAdmin = useCallback((code: string) => {
    if (code.trim().toUpperCase() !== ADMIN_CODE) return false;
    setState((prev) => ({ ...prev, adminAuthed: true }));
    void setAdminCookie();
    return true;
  }, []);

  const setSiteEditing = useCallback((on: boolean) => {
    setState((prev) => {
      if (!on) publishSiteContent(prev);
      return { ...prev, siteEditing: on };
    });
  }, []);

  const setGameQuestions = useCallback((gameId: string, questions: QuizQuestion[]) => {
    setState((prev) => {
      const next = { ...prev, gameQuestions: { ...prev.gameQuestions, [gameId]: questions } };
      publishSiteContent(next);
      return next;
    });
  }, []);

  const setPhotoQuestions = useCallback((questions: PhotoQuestion[]) => {
    setState((prev) => {
      const next = { ...prev, photoQuestions: questions };
      publishSiteContent(next);
      return next;
    });
  }, []);

  const setPredictionQuestions = useCallback((questions: PredictionQuestion[]) => {
    setState((prev) => {
      const next = { ...prev, predictionQuestions: questions };
      publishSiteContent(next);
      return next;
    });
  }, []);

  const setEventAccess = useCallback((eventId: string, tags: string[]) => {
    setState((prev) => ({ ...prev, eventAccess: { ...prev.eventAccess, [eventId]: tags } }));
  }, []);

  const setPageAccess = useCallback((href: string, tags: string[]) => {
    setState((prev) => ({ ...prev, pageAccess: { ...prev.pageAccess, [href]: tags } }));
  }, []);

  const addAccessTag = useCallback((label: string) => {
    const name = label.trim();
    if (!name) return;
    setState((prev) => {
      const used = new Set(prev.accessTags.map((tag) => tag.id));
      let id = slugifyTag(name);
      if (used.has(id)) id = `${id}-${Math.random().toString(36).slice(2, 5)}`;
      return { ...prev, accessTags: [...prev.accessTags, { id, label: name }] };
    });
  }, []);

  const updateAccessTag = useCallback((id: string, label: string) => {
    const name = label.trim();
    if (!name) return;
    setState((prev) => ({
      ...prev,
      accessTags: prev.accessTags.map((tag) => (tag.id === id ? { ...tag, label: name } : tag)),
    }));
  }, []);

  const removeAccessTag = useCallback((id: string) => {
    setState((prev) => ({
      ...prev,
      accessTags: prev.accessTags.filter((tag) => tag.id !== id),
      invites: prev.invites.map((invite) => ({
        ...invite,
        tags: invite.tags.filter((tag) => tag !== id),
      })),
      eventAccess: Object.fromEntries(
        Object.entries(prev.eventAccess).map(([key, tags]) => [key, tags.filter((tag) => tag !== id)]),
      ),
      pageAccess: Object.fromEntries(
        Object.entries(prev.pageAccess).map(([key, tags]) => [key, tags.filter((tag) => tag !== id)]),
      ),
    }));
  }, []);

  const logoutAdmin = useCallback(() => {
    setState((prev) => (prev.adminAuthed ? { ...prev, adminAuthed: false } : prev));
    void clearAdminCookie();
  }, []);

  const updateSiteCopy = useCallback((id: string, value: string) => {
    setState((prev) => {
      const next = { ...prev, siteCopy: { ...prev.siteCopy, [id]: value } };
      publishSiteContent(next);
      return next;
    });
  }, []);

  const updateSiteImage = useCallback((id: string, src: string) => {
    const updatedAt = Date.now();
    siteImageTimes[id] = updatedAt;
    dirtySiteImages.add(id);
    void rememberSiteImage(id, src, updatedAt);
    setState((prev) => {
      const next = {
        ...prev,
        siteImages: { ...prev.siteImages, [id]: src },
        siteHidden: (prev.siteHidden ?? []).filter((item) => item !== id),
      };
      publishSiteContent(next);
      return next;
    });
  }, []);

  const hideSiteItem = useCallback((id: string) => {
    setState((prev) => {
      const next = {
        ...prev,
        siteHidden: prev.siteHidden.includes(id) ? prev.siteHidden : [...prev.siteHidden, id],
      };
      publishSiteContent(next);
      return next;
    });
  }, []);

  const showSiteItem = useCallback((id: string) => {
    setState((prev) => {
      const next = {
        ...prev,
        siteHidden: prev.siteHidden.filter((item) => item !== id),
      };
      publishSiteContent(next);
      return next;
    });
  }, []);

  const togglePageHidden = useCallback((href: string) => {
    if (!canTogglePageHidden(href)) return;
    const key = pageKey(href);
    setState((prev) => {
      const next = {
        ...prev,
        hiddenPages: (prev.hiddenPages ?? []).includes(key)
          ? prev.hiddenPages.filter((item) => item !== key)
          : [...(prev.hiddenPages ?? []), key],
      };
      publishSiteContent(next);
      return next;
    });
  }, []);

  const deleteGuestbook = useCallback((id: string) => {
    setState((prev) => ({ ...prev, guestbook: prev.guestbook.filter((note) => note.id !== id) }));
  }, []);

  const resetHub = useCallback(() => {
    window.localStorage.removeItem(STORAGE_KEY);
    window.localStorage.removeItem("jeric-hub-v2");
    window.localStorage.removeItem("jeric-gate-email");
    window.localStorage.removeItem("jeric-gate-name");
    void fetch("/api/rides/digest", { method: "DELETE" }).catch(() => undefined);
    void fetch("/api/site-editors", { method: "DELETE" }).catch(() => undefined);
    void fetch("/api/invites", { method: "DELETE" }).catch(() => undefined);
    void fetch("/api/visits", { method: "DELETE" }).catch(() => undefined);
    void fetch("/api/rsvp", { method: "DELETE" }).catch(() => undefined);
    void fetch("/api/site-content", { method: "DELETE" }).catch(() => undefined);
    setState({ ...EMPTY_STATE, adminAuthed: true });
  }, []);

  const value = useMemo<HubContextValue>(
    () => ({
      state,
      ready,
      me,
      publicGuests,
      join,
      leave,
      signOut,
      updateVisibility,
      updateStay,
      updateProfile,
      updateMyAddress,
      postRide,
      updateRide,
      deleteRide,
      askForSeat,
      respondSeat,
      postMessage,
      deleteMessage,
      heartMessage,
      postGuestbook,
      heartGuestbook,
      voteSong,
      suggestSong,
      moderateSong,
      upsertInvite,
      deleteInvite,
      importInvites,
      recordGuestEntry,
      setHeroImage,
      uploadPhoto,
      updatePhotoCaption,
      updatePhotoAlbum,
      deletePhoto,
      addPhotoFolder,
      renamePhotoFolder,
      removePhotoFolder,
      moderatePhoto,
      savePlace,
      addScore,
      savePredictions,
      submitRsvp,
      updateRsvp,
      deleteRsvp,
      publishAnnouncement,
      subscribeUpdates,
      loginAdmin,
      enableAdmin,
      logoutAdmin,
      setInviteCanEditSite,
      setSiteEditing,
      updateIdentityFromGate,
      updateSiteCopy,
      updateSiteImage,
      hideSiteItem,
      showSiteItem,
      togglePageHidden,
      setGameQuestions,
      setPhotoQuestions,
      setPredictionQuestions,
      setEventAccess,
      setPageAccess,
      addAccessTag,
      updateAccessTag,
      removeAccessTag,
      deleteGuestbook,
      resetHub,
    }),
    [
      state,
      ready,
      me,
      publicGuests,
      join,
      leave,
      signOut,
      updateVisibility,
      updateStay,
      updateProfile,
      updateMyAddress,
      postRide,
      updateRide,
      deleteRide,
      askForSeat,
      respondSeat,
      postMessage,
      deleteMessage,
      heartMessage,
      postGuestbook,
      heartGuestbook,
      voteSong,
      suggestSong,
      moderateSong,
      upsertInvite,
      deleteInvite,
      importInvites,
      recordGuestEntry,
      setHeroImage,
      uploadPhoto,
      updatePhotoCaption,
      updatePhotoAlbum,
      deletePhoto,
      addPhotoFolder,
      renamePhotoFolder,
      removePhotoFolder,
      moderatePhoto,
      savePlace,
      addScore,
      savePredictions,
      submitRsvp,
      updateRsvp,
      deleteRsvp,
      publishAnnouncement,
      subscribeUpdates,
      loginAdmin,
      enableAdmin,
      logoutAdmin,
      setInviteCanEditSite,
      setSiteEditing,
      updateIdentityFromGate,
      updateSiteCopy,
      updateSiteImage,
      hideSiteItem,
      showSiteItem,
      togglePageHidden,
      setGameQuestions,
      setPhotoQuestions,
      setPredictionQuestions,
      setEventAccess,
      setPageAccess,
      addAccessTag,
      updateAccessTag,
      removeAccessTag,
      deleteGuestbook,
      resetHub,
    ],
  );

  return <HubContext.Provider value={value}>{children}</HubContext.Provider>;
}

export function useHub() {
  const context = useContext(HubContext);
  if (!context) {
    throw new Error("useHub must be used within HubProvider");
  }
  return context;
}

export function guestName(guest: Pick<Guest, "firstName" | "lastName">) {
  return displayName(guest);
}

export function guestById(guests: Guest[], id: string) {
  return guests.find((guest) => guest.id === id);
}
