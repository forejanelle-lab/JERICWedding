import type { GuestRegion } from "@/lib/types/database";

export const LOUNGE_NAV_ITEMS = [
  { label: "Home", href: "/lounge" },
  { label: "Community", href: "/lounge/community" },
  { label: "Games & Fun", href: "/lounge/games" },
  { label: "Members", href: "/lounge/members" },
  { label: "Discussions", href: "/lounge/discussions" },
  { label: "Travel Buddies", href: "/lounge/travel" },
  { label: "Groups", href: "/lounge/groups" },
  { label: "Challenges", href: "/lounge/challenges" },
  { label: "Leaderboard", href: "/lounge/leaderboard" },
  { label: "Profile", href: "/lounge/profile" },
] as const;

export const LOUNGE_MOBILE_NAV = [
  { label: "Home", href: "/lounge", icon: "home" },
  { label: "Community", href: "/lounge/community", icon: "community" },
  { label: "Games", href: "/lounge/games", icon: "games" },
  { label: "Profile", href: "/lounge/profile", icon: "profile" },
] as const;

export type LoungeActivityType =
  | "quiz"
  | "icebreaker"
  | "travel"
  | "challenge"
  | "poll"
  | "mission";

export type LoungeActivity = {
  id: string;
  type: LoungeActivityType;
  emoji: string;
  title: string;
  subtitle: string;
  meta: string;
  cta: string;
  href: string;
  points?: number;
};

export const NEXT_UP_ACTIVITIES: LoungeActivity[] = [
  {
    id: "quiz-who-knows",
    type: "quiz",
    emoji: "🎮",
    title: "Who Knows Janelle & Eric Best?",
    subtitle: "5 questions · Test your couple knowledge",
    meta: "Highest score: 9/10",
    cta: "Play Now",
    href: "/lounge/games/who-knows-us",
    points: 50,
  },
  {
    id: "two-truths",
    type: "icebreaker",
    emoji: "🕵️",
    title: "Two Truths & a Lie",
    subtitle: "Meet another guest · Guess the lie",
    meta: "8 people playing",
    cta: "Join Game",
    href: "/lounge/games/two-truths",
    points: 50,
  },
  {
    id: "travel-crew",
    type: "travel",
    emoji: "🧳",
    title: "Find Your Italy Crew",
    subtitle: "Match with guests on similar travel plans",
    meta: "4 guests have similar plans",
    cta: "Find My Crew",
    href: "/lounge/travel",
    points: 50,
  },
  {
    id: "scavenger",
    type: "challenge",
    emoji: "📸",
    title: "Weekend Scavenger Hunt",
    subtitle: "Complete tasks before the wedding",
    meta: "3 / 10 completed",
    cta: "View Challenge",
    href: "/lounge/challenges",
    points: 150,
  },
];

export type LoungeGame = {
  id: string;
  slug: string;
  category: "games" | "quizzes" | "challenges" | "icebreakers";
  title: string;
  description: string;
  players: number;
  points: number;
  href: string;
  featured?: boolean;
};

export const LOUNGE_GAMES: LoungeGame[] = [
  {
    id: "who-knows-us",
    slug: "who-knows-us",
    category: "quizzes",
    title: "Who Knows Us Best?",
    description: "How well do you really know Janelle & Eric?",
    players: 42,
    points: 50,
    href: "/lounge/games/who-knows-us",
    featured: true,
  },
  {
    id: "two-truths",
    slug: "two-truths",
    category: "icebreakers",
    title: "Two Truths & a Lie",
    description: "Submit three statements — other guests guess the lie.",
    players: 28,
    points: 50,
    href: "/lounge/games/two-truths",
    featured: true,
  },
  {
    id: "most-likely",
    slug: "most-likely",
    category: "games",
    title: "Who's Most Likely To?",
    description: "Fun polls about the couple and the wedding weekend.",
    players: 35,
    points: 10,
    href: "/lounge/games/most-likely",
  },
  {
    id: "italy-hot-takes",
    slug: "italy-hot-takes",
    category: "games",
    title: "Italy Hot Takes",
    description: "Pasta or pizza? Amalfi or Capri? Cast your vote.",
    players: 51,
    points: 10,
    href: "/lounge/games/italy-hot-takes",
  },
  {
    id: "wedding-predictions",
    slug: "wedding-predictions",
    category: "quizzes",
    title: "Wedding Predictions",
    description: "Predict the ceremony — answers revealed after the wedding.",
    players: 19,
    points: 50,
    href: "/lounge/games/wedding-predictions",
  },
];

export const GAME_CATEGORIES = [
  { value: "all", label: "All" },
  { value: "games", label: "Games" },
  { value: "quizzes", label: "Quizzes" },
  { value: "challenges", label: "Challenges" },
  { value: "icebreakers", label: "Icebreakers" },
] as const;

export type QuizQuestion = {
  id: string;
  question: string;
  options: string[];
  correctIndex: number;
  explanation: string;
};

export const WHO_KNOWS_US_QUESTIONS: QuizQuestion[] = [
  {
    id: "q1",
    question: "Where did Janelle & Eric first meet?",
    options: ["A coffee shop in Brooklyn", "Through mutual friends", "At a salsa class", "On a hiking trip"],
    correctIndex: 2,
    explanation:
      "They met at a salsa class — Eric asked Janelle to dance, and the rest is history.",
  },
  {
    id: "q2",
    question: "Where did Eric propose?",
    options: ["The Amalfi Coast", "Central Park", "Casale dei Mascioni", "A vineyard in Tuscany"],
    correctIndex: 0,
    explanation:
      "Eric proposed at sunset on the Amalfi Coast, with limoncello and a ring hidden in his jacket.",
  },
  {
    id: "q3",
    question: "What is their shared Sunday tradition?",
    options: ["Farmers market runs", "Long phone calls with family", "Cooking pasta from scratch", "Morning hikes"],
    correctIndex: 2,
    explanation: "Every Sunday they slow down and make fresh pasta together — it's their favorite ritual.",
  },
  {
    id: "q4",
    question: "Why did they choose Campania for the wedding?",
    options: [
      "Eric's family is from Naples",
      "They fell in love with Casale dei Mascioni on a trip",
      "Janelle studied abroad in Sorrento",
      "Their first trip together was to Rome",
    ],
    correctIndex: 1,
    explanation:
      "They visited Casale dei Mascioni on a weekend trip and knew immediately it was the one.",
  },
  {
    id: "q5",
    question: "What song will likely get everyone on the dance floor?",
    options: ["September — Earth, Wind & Fire", "Despacito", "Dancing Queen", "Uptown Funk"],
    correctIndex: 0,
    explanation:
      "September is basically their relationship anthem — expect it early and often on the dance floor.",
  },
];

export const LEADERBOARD = [
  { rank: 1, name: "Alana", points: 420, avatar: "A" },
  { rank: 2, name: "Michael", points: 385, avatar: "M" },
  { rank: 3, name: "Sophia", points: 360, avatar: "S" },
  { rank: 4, name: "Tyler", points: 310, avatar: "T" },
  { rank: 5, name: "Priya", points: 295, avatar: "P" },
] as const;

export type RecommendedGuest = {
  id: string;
  name: string;
  city: string;
  region: GuestRegion;
  reason: string;
  interests: string[];
};

export const RECOMMENDED_GUESTS: RecommendedGuest[] = [
  {
    id: "1",
    name: "Tyler Williams",
    city: "Miami, FL",
    region: "us",
    reason: "Arriving Rome · Sept 4 at 10:30 AM",
    interests: ["Travel", "Food", "Dancing"],
  },
  {
    id: "2",
    name: "Sophia Martinez",
    city: "New York, NY",
    region: "us",
    reason: "Also staying near Piazza del Plebiscito",
    interests: ["Food", "Art", "Wine"],
  },
  {
    id: "3",
    name: "Marco Bianchi",
    city: "Milan, Italy",
    region: "europe",
    reason: "First time at Casale dei Mascioni too",
    interests: ["Music", "Campania", "Photography"],
  },
];

export const TODAY_POLL = {
  id: "poll-pasta-pizza",
  question: "First meal in Italy — pasta or pizza?",
  options: [
    { id: "pasta", label: "Pasta", votes: 34 },
    { id: "pizza", label: "Pizza", votes: 28 },
  ],
  totalVotes: 62,
  comments: 8,
} as const;

export const SECRET_MISSIONS = [
  {
    id: "m1",
    title: "Introduce yourself to someone you haven't met",
    points: 50,
  },
  {
    id: "m2",
    title: "Find someone staying at the same hotel",
    points: 50,
  },
  {
    id: "m3",
    title: "Ask someone how they know Janelle",
    points: 25,
  },
  {
    id: "m4",
    title: "Find another guest who loves salsa",
    points: 50,
  },
] as const;

export const SCAVENGER_CHALLENGES = [
  { id: "c1", label: "Meet someone you've never met", points: 50, completed: true },
  { id: "c2", label: "Take a photo with someone you just met", points: 50, completed: true },
  { id: "c3", label: "Find someone who has visited 5+ countries", points: 100, completed: true },
  { id: "c4", label: "Find someone from a different state", points: 50, completed: false },
  { id: "c5", label: "Recommend an Italian restaurant", points: 50, completed: false },
  { id: "c6", label: "Take a group photo", points: 100, completed: false },
  { id: "c7", label: "Find a guest who speaks another language", points: 50, completed: false },
  { id: "c8", label: "Dance with someone you've never met", points: 150, completed: false },
] as const;

export const COMMUNITY_PROMPTS = [
  "Where are you traveling from?",
  "What's one thing you absolutely want to do in Italy?",
  "Who are you most excited to see?",
  "Drop your favorite travel tip.",
  "What's your go-to wedding dance song?",
] as const;

export const COMMUNITY_FEED = [
  {
    id: "p1",
    author: "Michael Chen",
    city: "San Francisco, CA",
    time: "2h ago",
    prompt: "What's one thing you absolutely want to do in Italy?",
    body: "Boat day on the Amalfi Coast — I've never been and I'm already researching the best limoncello stops.",
    reactions: 12,
    comments: 4,
  },
  {
    id: "p2",
    author: "Elena Rossi",
    city: "Rome, Italy",
    time: "5h ago",
    prompt: "Drop your favorite travel tip.",
    body: "Book restaurants now for the weekend before the wedding. September fills up fast in Campania.",
    reactions: 18,
    comments: 7,
  },
  {
    id: "p3",
    author: "James Porter",
    city: "Chicago, IL",
    time: "Yesterday",
    prompt: "Who are you most excited to see?",
    body: "Honestly? Everyone. It's been too long since we've all been in the same place.",
    reactions: 24,
    comments: 9,
  },
] as const;

export const UPCOMING_EVENTS = [
  {
    id: "welcome-dinner",
    title: "Welcome Dinner",
    date: "Saturday, September 4",
    time: "7:00 PM",
    attending: 32,
    href: "/lounge/events/welcome-dinner",
  },
  {
    id: "wedding-day",
    title: "Wedding Day",
    date: "Sunday, September 5",
    time: "4:30 PM",
    attending: 98,
    href: "#weekend",
  },
] as const;
