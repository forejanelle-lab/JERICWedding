export type Side = "janelle" | "eric" | "both";

export type GuestGroup =
  | "fore-family"
  | "eric-family"
  | "lewis-family"
  | "smith-family"
  | "friends"
  | "college"
  | "nyc"
  | "italy";

export type StayArea =
  | "sorrento"
  | "naples"
  | "caserta"
  | "rome"
  | "amalfi"
  | "villa"
  | "other";

export type EventId = "welcome" | "ceremony" | "reception" | "brunch";

export type RideKind = "offer" | "request";

export type RideStatus = "open" | "pending" | "confirmed" | "full";

export type ChatChannel = "general" | "travel" | "italy" | "weekend" | "afterparty";

export type SongCategory =
  | "90s"
  | "2000s"
  | "rnb"
  | "dancehall"
  | "afrobeats"
  | "italian"
  | "classics"
  | "guilty";

export type PhotoAlbum = "recent" | "friday" | "wedding" | "sunday" | "travel";

export type PlaceCategory =
  | "beaches"
  | "restaurants"
  | "bars"
  | "day-trips"
  | "shopping"
  | "history"
  | "nightlife"
  | "romantic"
  | "family";

export type Visibility = {
  showInDirectory: boolean;
  showCity: boolean;
  showEvents: boolean;
  allowContact: boolean;
  showOnLeaderboard: boolean;
};

export type Guest = {
  id: string;
  firstName: string;
  lastName: string;
  email?: string;
  city: string;
  side: Side;
  group: GuestGroup;
  stay: StayArea | null;
  events: EventId[];
  points: number;
  attending: boolean;
  fromNyc: boolean;
  fromAbroad: boolean;
  couple: boolean;
  dietary?: string;
  arrivalAirport?: string;
  arrivalDate?: string;
  departureDate?: string;
  visibility: Visibility;
  avatarHue: number;
  joinedAt: string;
};

export type Identity = {
  guestId: string;
  firstName: string;
  lastName: string;
  email: string;
  city: string;
  side: Side;
  photoDataUrl?: string;
};

export type Ride = {
  id: string;
  kind: RideKind;
  authorId: string;
  from: string;
  to: string;
  date: string;
  time: string;
  seats: number;
  seatsTaken: number;
  luggage: string;
  notes: string;
  status: RideStatus;
};

export type SeatAsk = {
  id: string;
  rideId: string;
  fromGuestId: string;
  seats: number;
  note: string;
  status: "pending" | "accepted" | "declined";
};

export type ChatMessage = {
  id: string;
  channel: ChatChannel;
  authorId: string;
  body: string;
  createdAt: string;
  replyTo?: string;
  hearts: string[];
};

export type GuestbookNote = {
  id: string;
  authorId: string | null;
  authorName: string;
  body: string;
  photoDataUrl?: string;
  createdAt: string;
  hearts: string[];
};

export type Song = {
  id: string;
  title: string;
  artist: string;
  category: SongCategory;
  suggestedBy: string;
  approved: boolean;
  ups: string[];
  downs: string[];
};

export type InviteRecord = {
  id: string;
  firstName: string;
  lastName: string;
  email: string;
  phone?: string;
  location: string;
  inItaly: boolean;
  party: string[];
  events: EventId[];
  tags: string[];
  invited?: boolean;
  entered?: boolean;
  canEditSite?: boolean;
};

export type GuestPhoto = {
  id: string;
  authorId: string;
  album: PhotoAlbum;
  caption: string;
  src: string;
  approved: boolean;
  createdAt: string;
};

export type Announcement = {
  id: string;
  title: string;
  body: string;
  category: "general" | "transport" | "schedule" | "hotel" | "reminder";
  publishedAt: string;
};

export type RsvpRecord = {
  id: string;
  name: string;
  email: string;
  attending: boolean;
  events: EventId[];
  guestCount: number;
  dietary: string;
  song: string;
  airport: string;
  arrivalDate: string;
  arrivalTime: string;
  departureDate: string;
  departureTime: string;
  stay: StayArea | "";
  inviteId: string;
  partyAttending: string[];
  submittedAt: string;
};

export type QuizQuestion = {
  id: string;
  question: string;
  options: string[];
  correctIndex: number;
  explanation: string;
};

export type PhotoQuestion = {
  id: string;
  image: string;
  prompt: string;
  options: string[];
  correctIndex: number;
  explanation: string;
};

export type PredictionQuestion = {
  id: string;
  question: string;
  options: string[];
};

export type Place = {
  id: string;
  name: string;
  category: PlaceCategory;
  description: string;
  location: string;
  distance: string;
  image: string;
  mapQuery: string;
  recommended: boolean;
};

export type WeekendEvent = {
  id: string;
  day: "Saturday" | "Sunday" | "Monday";
  date: string;
  title: string;
  time: string;
  endTime: string;
  location: string;
  address: string;
  dress: string;
  transport: string;
  notes: string;
  mapQuery: string;
  dtstart: string;
  dtend: string;
};

export type AccessTag = {
  id: string;
  label: string;
};

export type StoryBeat = {
  year: string;
  title: string;
  body: string;
  image?: string;
};

export type HubState = {
  identity: Identity | null;
  guests: Guest[];
  invites: InviteRecord[];
  rides: Ride[];
  seatAsks: SeatAsk[];
  messages: ChatMessage[];
  guestbook: GuestbookNote[];
  songs: Song[];
  photos: GuestPhoto[];
  announcements: Announcement[];
  rsvps: RsvpRecord[];
  savedPlaces: string[];
  gameScores: Record<string, number>;
  predictions: Record<string, string>;
  completedGames: string[];
  adminAuthed: boolean;
  siteEditor: boolean;
  siteEditing: boolean;
  subscribedEmail: string | null;
  heroImage: string;
  siteCopy: Record<string, string>;
  siteImages: Record<string, string>;
  siteHidden: string[];
  hiddenPages: string[];
  gameQuestions: Record<string, QuizQuestion[]>;
  photoQuestions: PhotoQuestion[];
  predictionQuestions: PredictionQuestion[];
  eventAccess: Record<string, string[]>;
  pageAccess: Record<string, string[]>;
  accessTags: AccessTag[];
};
