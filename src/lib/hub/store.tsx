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
import { DEFAULT_VIS, SEED_ANNOUNCEMENTS, SEED_GUESTBOOK, SEED_GUESTS, SEED_INVITES, SEED_MESSAGES, SEED_PHOTOS, SEED_RIDES, SEED_RSVPS, SEED_SONGS } from "@/lib/hub/seed";
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
  SongCategory,
  StayArea,
  Visibility,
} from "@/lib/hub/types";
import { ADMIN_CODE, KNOW_US_QUESTIONS, PHOTO_QUESTIONS, PREDICTION_QUESTIONS, TRIVIA_QUESTIONS, isCoupleAdmin } from "@/lib/hub/content";
import { ACCESS_TAGS, DEFAULT_GUEST_TAGS, EVENT_ACCESS, PAGE_ACCESS, canTogglePageHidden, pageKey, slugifyTag } from "@/lib/hub/access";
import { clearAdminCookie, clearGateCookie, setAdminCookie } from "@/lib/gate/admin";
import { collectHubEmails } from "@/lib/rides/emails";
import { queueRideDigest, syncRideDigestEmails } from "@/lib/rides/client";

const STORAGE_KEY = "jeric-hub-v2";
const DEFAULT_HERO = "/images/casale-bosco.jpg";

const EMPTY_STATE: HubState = {
  identity: null,
  guests: SEED_GUESTS,
  invites: SEED_INVITES,
  rides: SEED_RIDES,
  seatAsks: [],
  messages: SEED_MESSAGES,
  guestbook: SEED_GUESTBOOK,
  songs: SEED_SONGS,
  photos: SEED_PHOTOS,
  announcements: SEED_ANNOUNCEMENTS,
  rsvps: SEED_RSVPS,
  savedPlaces: [],
  gameScores: {},
  predictions: {},
  completedGames: [],
  adminAuthed: false,
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

function migrateSong(song: Song & { votes?: string[] }): Song {
  return {
    ...song,
    ups: song.ups ?? song.votes ?? [],
    downs: song.downs ?? [],
  };
}

export function householdNames(invite: InviteRecord) {
  return [`${invite.firstName} ${invite.lastName}`, ...invite.party];
}

export function lookupInvites(invites: InviteRecord[], query: string) {
  const q = query.trim().toLowerCase();
  if (q.length < 2) return [];
  return invites.filter((invite) => {
    const names = householdNames(invite).map((name) => name.toLowerCase());
    return names.some((name) => name.includes(q) || q.includes(name));
  });
}

function uid(prefix: string) {
  return `${prefix}-${Math.random().toString(36).slice(2, 9)}`;
}

function displayName(guest: Pick<Guest, "firstName" | "lastName">) {
  return `${guest.firstName} ${guest.lastName.charAt(0)}.`;
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
  suggestSong: (title: string, artist: string, category: SongCategory, suggestedBy?: string) => void;
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
  deletePhoto: (id: string) => void;
  moderatePhoto: (id: string, approved: boolean) => void;
  savePlace: (id: string) => void;
  addScore: (gameId: string, points: number) => void;
  savePredictions: (answers: Record<string, string>) => void;
  submitRsvp: (record: Omit<RsvpRecord, "id" | "submittedAt">) => void;
  publishAnnouncement: (input: Omit<Announcement, "id" | "publishedAt">) => void;
  subscribeUpdates: (email: string) => void;
  loginAdmin: (code: string) => boolean;
  enableAdmin: () => void;
  logoutAdmin: () => void;
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
    try {
      const raw = window.localStorage.getItem(STORAGE_KEY);
      if (raw) {
        const parsed = JSON.parse(raw) as HubState;
        setState({
          ...EMPTY_STATE,
          ...parsed,
          guests: parsed.guests?.length ? parsed.guests : SEED_GUESTS,
          songs: (parsed.songs?.length ? parsed.songs : SEED_SONGS).map((song) =>
            migrateSong(song as Song & { votes?: string[] }),
          ),
          heroImage:
            !parsed.heroImage || parsed.heroImage === "/images/amalfi-coast.jpg"
              ? DEFAULT_HERO
              : parsed.heroImage,
          siteCopy: parsed.siteCopy ?? {},
          siteImages: parsed.siteImages ?? {},
          siteHidden: parsed.siteHidden ?? [],
          hiddenPages: parsed.hiddenPages ?? [],
          siteEditing: false,
          invites: (parsed.invites?.length ? parsed.invites : SEED_INVITES).map((invite) => ({
            ...invite,
            tags: invite.tags?.length ? invite.tags : [...DEFAULT_GUEST_TAGS],
            invited: invite.invited !== false,
            entered: Boolean(invite.entered),
          })),
          gameQuestions: {
            "know-us": parsed.gameQuestions?.["know-us"]?.length ? parsed.gameQuestions["know-us"] : KNOW_US_QUESTIONS,
            trivia: parsed.gameQuestions?.trivia?.length ? parsed.gameQuestions.trivia : TRIVIA_QUESTIONS,
          },
          photoQuestions: parsed.photoQuestions?.length ? parsed.photoQuestions : PHOTO_QUESTIONS,
          predictionQuestions: parsed.predictionQuestions?.length ? parsed.predictionQuestions : PREDICTION_QUESTIONS,
          eventAccess: { ...EVENT_ACCESS, ...parsed.eventAccess },
          pageAccess: { ...PAGE_ACCESS, ...parsed.pageAccess },
          accessTags: parsed.accessTags?.length ? parsed.accessTags : ACCESS_TAGS.map((tag) => ({ ...tag })),
          adminAuthed: parsed.identity
            ? isCoupleAdmin(parsed.identity.firstName, parsed.identity.email)
            : Boolean(parsed.adminAuthed || adminFromServer),
        });
      } else if (adminFromServer) {
        setState({ ...EMPTY_STATE, adminAuthed: true });
      }
    } catch {
      setState(adminFromServer ? { ...EMPTY_STATE, adminAuthed: true } : EMPTY_STATE);
    }
    setReady(true);
  }, [adminFromServer]);

  useEffect(() => {
    if (!ready) return;
    window.localStorage.setItem(STORAGE_KEY, JSON.stringify(state));
  }, [state, ready]);

  useEffect(() => {
    if (!ready || state.adminAuthed) return;
    const name = state.identity?.firstName ?? "";
    const email = state.identity?.email ?? "";
    if (state.identity && !isCoupleAdmin(name, email)) return;
    if (!isCoupleAdmin(name, email) && !adminFromServer) return;
    setState((prev) => ({ ...prev, adminAuthed: true }));
    void setAdminCookie();
  }, [adminFromServer, ready, state.adminAuthed, state.identity, state.identity?.email, state.identity?.firstName]);

  useEffect(() => {
    if (!ready || !state.adminAuthed) return;
    void syncRideDigestEmails(collectHubEmails(state));
  }, [ready, state.adminAuthed, state.invites, state.rsvps, state.guests, state.identity?.email]);

  const me = useMemo(
    () => state.guests.find((guest) => guest.id === state.identity?.guestId) ?? null,
    [state.guests, state.identity],
  );

  const publicGuests = useMemo(
    () => state.guests.filter((guest) => guest.visibility.showInDirectory && guest.attending),
    [state.guests],
  );

  const join: HubContextValue["join"] = useCallback((input) => {
    const coupleAdmin = isCoupleAdmin(input.firstName.trim(), input.email.trim());
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
    let coupleAdmin = isCoupleAdmin(name, mail);
    let applied = false;
    setState((prev) => {
      if (!prev.identity) return prev;
      coupleAdmin = isCoupleAdmin(name, mail || prev.identity.email);
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
    setState((prev) => ({ ...prev, identity: null }));
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
        const inUp = song.ups.includes(voterId);
        const inDown = song.downs.includes(voterId);
        if (direction === "up") {
          if (inUp) return song;
          return {
            ...song,
            ups: [...song.ups, voterId],
            downs: song.downs.filter((item) => item !== voterId),
          };
        }
        if (inDown) return song;
        return {
          ...song,
          downs: [...song.downs, voterId],
          ups: song.ups.filter((item) => item !== voterId),
        };
      }),
    }));
  }, []);

  const suggestSong = useCallback((title: string, artist: string, category: SongCategory, suggestedBy?: string) => {
    setState((prev) => {
      const song: Song = {
        id: uid("song"),
        title: title.trim(),
        artist: artist.trim(),
        category,
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
      return {
        ...prev,
        invites: exists
          ? prev.invites.map((item) => (item.id === invite.id ? invite : item))
          : [invite, ...prev.invites],
      };
    });
  }, []);

  const deleteInvite = useCallback((id: string) => {
    setState((prev) => ({ ...prev, invites: prev.invites.filter((item) => item.id !== id) }));
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
        if (index >= 0) next[index] = { ...next[index], ...invite, id: next[index].id };
        else next.unshift(invite);
      }
      return { ...prev, invites: next };
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
      const email = input.email.trim().toLowerCase();
      const first = input.firstName.trim();
      const last = input.lastName.trim();
      if (!first) return;
      setState((prev) => {
        const samePerson = (invite: InviteRecord) => {
          if (input.inviteId && invite.id === input.inviteId) return true;
          if (email && invite.email && invite.email.trim().toLowerCase() === email) return true;
          if (
            invite.firstName.trim().toLowerCase() === first.toLowerCase() &&
            (!last || invite.lastName.trim().toLowerCase() === last.toLowerCase())
          ) {
            return true;
          }
          const household = householdNames(invite).map((name) => name.toLowerCase());
          const full = `${first} ${last}`.trim().toLowerCase();
          return Boolean(full && household.includes(full));
        };

        if (input.fromList) {
          const index = prev.invites.findIndex(samePerson);
          if (index < 0) return prev;
          return {
            ...prev,
            invites: prev.invites.map((invite, i) =>
              i === index ? { ...invite, email: email || invite.email, entered: true } : invite,
            ),
          };
        }

        const walkIndex = prev.invites.findIndex(
          (invite) =>
            invite.invited === false &&
            invite.firstName.trim().toLowerCase() === first.toLowerCase() &&
            invite.lastName.trim().toLowerCase() === last.toLowerCase(),
        );
        if (walkIndex >= 0) {
          return {
            ...prev,
            invites: prev.invites.map((invite, i) =>
              i === walkIndex ? { ...invite, email: email || invite.email, entered: true } : invite,
            ),
          };
        }

        const walkIn: InviteRecord = {
          id: uid("walk"),
          firstName: first,
          lastName: last,
          email,
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
    setState((prev) => ({ ...prev, heroImage: src }));
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
        approved: false,
        createdAt: new Date().toISOString(),
      };
      return { ...prev, photos: [photo, ...prev.photos] };
    });
  }, []);

  const moderatePhoto = useCallback((id: string, approved: boolean) => {
    setState((prev) => ({
      ...prev,
      photos: approved
        ? prev.photos.map((photo) => (photo.id === id ? { ...photo, approved: true } : photo))
        : prev.photos.filter((photo) => photo.id !== id),
    }));
  }, []);

  const updatePhotoCaption = useCallback((id: string, caption: string) => {
    setState((prev) => ({
      ...prev,
      photos: prev.photos.map((photo) => (photo.id === id ? { ...photo, caption } : photo)),
    }));
  }, []);

  const deletePhoto = useCallback((id: string) => {
    setState((prev) => {
      const photo = prev.photos.find((item) => item.id === id);
      if (!photo) return prev;
      const allowed = prev.identity?.guestId === photo.authorId || prev.adminAuthed;
      if (!allowed) return prev;
      return { ...prev, photos: prev.photos.filter((item) => item.id !== id) };
    });
  }, []);

  const savePlace = useCallback((id: string) => {
    setState((prev) => {
      const savedPlaces = prev.savedPlaces.includes(id)
        ? prev.savedPlaces.filter((item) => item !== id)
        : [...prev.savedPlaces, id];
      return { ...prev, savedPlaces };
    });
  }, []);

  const addScore = useCallback((gameId: string, points: number) => {
    setState((prev) => {
      if (prev.completedGames.includes(gameId)) return prev;
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
      if (prev.completedGames.includes("predictions")) {
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

  const submitRsvp = useCallback((record: Omit<RsvpRecord, "id" | "submittedAt">) => {
    setState((prev) => {
      const rsvp: RsvpRecord = {
        ...record,
        id: uid("rsvp"),
        submittedAt: new Date().toISOString(),
      };
      const events = record.attending ? record.events : [];
      return {
        ...prev,
        rsvps: [rsvp, ...prev.rsvps],
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
                  }
                : guest,
            )
          : prev.guests,
      };
    });
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
    setState((prev) => ({ ...prev, siteEditing: on }));
  }, []);

  const setGameQuestions = useCallback((gameId: string, questions: QuizQuestion[]) => {
    setState((prev) => ({
      ...prev,
      gameQuestions: { ...prev.gameQuestions, [gameId]: questions },
    }));
  }, []);

  const setPhotoQuestions = useCallback((questions: PhotoQuestion[]) => {
    setState((prev) => ({ ...prev, photoQuestions: questions }));
  }, []);

  const setPredictionQuestions = useCallback((questions: PredictionQuestion[]) => {
    setState((prev) => ({ ...prev, predictionQuestions: questions }));
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
    setState((prev) => ({ ...prev, adminAuthed: false }));
    void clearAdminCookie();
  }, []);

  const updateSiteCopy = useCallback((id: string, value: string) => {
    setState((prev) => ({ ...prev, siteCopy: { ...prev.siteCopy, [id]: value } }));
  }, []);

  const updateSiteImage = useCallback((id: string, src: string) => {
    setState((prev) => ({
      ...prev,
      siteImages: { ...prev.siteImages, [id]: src },
      siteHidden: prev.siteHidden.filter((item) => item !== id),
    }));
  }, []);

  const hideSiteItem = useCallback((id: string) => {
    setState((prev) => ({
      ...prev,
      siteHidden: prev.siteHidden.includes(id) ? prev.siteHidden : [...prev.siteHidden, id],
    }));
  }, []);

  const showSiteItem = useCallback((id: string) => {
    setState((prev) => ({
      ...prev,
      siteHidden: prev.siteHidden.filter((item) => item !== id),
    }));
  }, []);

  const togglePageHidden = useCallback((href: string) => {
    if (!canTogglePageHidden(href)) return;
    const key = pageKey(href);
    setState((prev) => ({
      ...prev,
      hiddenPages: (prev.hiddenPages ?? []).includes(key)
        ? prev.hiddenPages.filter((item) => item !== key)
        : [...(prev.hiddenPages ?? []), key],
    }));
  }, []);

  const deleteGuestbook = useCallback((id: string) => {
    setState((prev) => ({ ...prev, guestbook: prev.guestbook.filter((note) => note.id !== id) }));
  }, []);

  const resetHub = useCallback(() => {
    window.localStorage.removeItem(STORAGE_KEY);
    setState(EMPTY_STATE);
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
      deletePhoto,
      moderatePhoto,
      savePlace,
      addScore,
      savePredictions,
      submitRsvp,
      publishAnnouncement,
      subscribeUpdates,
      loginAdmin,
      enableAdmin,
      logoutAdmin,
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
      deletePhoto,
      moderatePhoto,
      savePlace,
      addScore,
      savePredictions,
      submitRsvp,
      publishAnnouncement,
      subscribeUpdates,
      loginAdmin,
      enableAdmin,
      logoutAdmin,
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
