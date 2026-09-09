import type {
  EventId,
  GuestGroup,
  Place,
  PlaceCategory,
  PredictionQuestion,
  QuizQuestion,
  PhotoQuestion,
  Side,
  SongCategory,
  StayArea,
  StoryBeat,
  WeekendEvent,
} from "@/lib/hub/types";

export const WEDDING = {
  couple: "Janelle & Eric",
  date: "September 4–6, 2027",
  dateISO: "2027-09-05T16:30:00+02:00",
  location: "Campania, Italy",
  venue: "Casale dei Mascioni",
  address: "Casale dei Mascioni, San Prisco (CE), Campania, Italy",
  guestCount: 105,
} as const;

export const ADMIN_CODE = "JERIC-ADMIN";
export const OPTIONAL_GUEST_CODE = "JF2027";

export function isCoupleAdmin(firstName: string, email = "") {
  const name = firstName.trim().toLowerCase();
  if (name === "janelle" || name === "eric") return true;
  const mail = email.trim().toLowerCase();
  return mail.startsWith("janelle") || mail.includes("janelle.fore");
}

export const NAV_PRIMARY = [
  { label: "RSVP", href: "/rsvp" },
  { label: "Our Story", href: "/story" },
  { label: "Weekend", href: "/weekend" },
  { label: "Travel", href: "/travel" },
  { label: "Photos", href: "/photos" },
] as const;

export const NAV_MORE = [
  { label: "Rides", href: "/rides" },
  { label: "Play", href: "/play" },
  { label: "Songs", href: "/songs" },
  { label: "To Do", href: "/things-to-do" },
  { label: "FAQ", href: "/faq" },
  { label: "Registry", href: "/registry" },
] as const;

export const HIDEABLE_PAGES = [
  ...NAV_PRIMARY,
  ...NAV_MORE,
  { label: "Leaderboard", href: "/leaderboard" },
] as const;

export const PLAYLIST = {
  label: "Listen to our playlist",
  track: "September — Earth, Wind & Fire",
  spotifyUrl: "https://open.spotify.com/search/September%20Earth%20Wind%20%26%20Fire",
} as const;

export const MOBILE_TABS = [
  { label: "Home", href: "/", icon: "home" },
  { label: "Weekend", href: "/weekend", icon: "calendar" },
  { label: "Rides", href: "/rides", icon: "car" },
  { label: "Play", href: "/play", icon: "play" },
  { label: "RSVP", href: "/rsvp", icon: "heart" },
] as const;

export const GROUP_LABELS: Record<GuestGroup, string> = {
  "fore-family": "Janelle's Family",
  "eric-family": "Eric's Family",
  "lewis-family": "Lewis Family",
  "smith-family": "Smith Family",
  friends: "Friends",
  college: "College Friends",
  nyc: "NYC Friends",
  italy: "Italy Crew",
};

export const SIDE_LABELS: Record<Side, string> = {
  janelle: "Janelle's side",
  eric: "Eric's side",
  both: "Both",
};

export const STAY_LABELS: Record<StayArea, string> = {
  sorrento: "Sorrento",
  naples: "Naples",
  caserta: "Caserta",
  rome: "Rome",
  amalfi: "Amalfi Coast",
  villa: "Villa / Airbnb",
  other: "Other",
};

export const EVENT_LABELS: Record<EventId, string> = {
  welcome: "Welcome Dinner",
  ceremony: "Ceremony",
  reception: "Reception",
  brunch: "Farewell Brunch",
};

export const WEEKEND_EVENTS: WeekendEvent[] = [
  {
    id: "welcome",
    day: "Saturday",
    date: "September 4, 2027",
    title: "Welcome Dinner",
    time: "7:00 PM",
    endTime: "10:30 PM",
    location: "Casale dei Mascioni",
    address: "Casale dei Mascioni, San Prisco (CE), Campania, Italy",
    dress: "Garden evening — linen, silk, and comfortable shoes",
    transport: "Shuttles from Naples and Caserta hotels at 6:15 PM. Taxis ~35 minutes from Naples.",
    notes: "An al fresco dinner among the olive trees. Come hungry, come as you are, come ready to meet everyone.",
    mapQuery: "Casale+dei+Mascioni+San+Prisco",
    dtstart: "20270904T170000Z",
    dtend: "20270904T203000Z",
  },
  {
    id: "ceremony",
    day: "Sunday",
    date: "September 5, 2027",
    title: "Ceremony",
    time: "4:30 PM",
    endTime: "5:30 PM",
    location: "Garden terrace, Casale dei Mascioni",
    address: "Casale dei Mascioni, San Prisco (CE), Campania, Italy",
    dress: "Black tie optional — elevated European elegance",
    transport: "Please arrive by 4:00 PM. Shuttles depart recommended hotels at 3:15 PM.",
    notes: "Vows in the garden overlooking the Campania countryside. Unplugged ceremony — phones away, hearts open.",
    mapQuery: "Casale+dei+Mascioni+San+Prisco",
    dtstart: "20270905T143000Z",
    dtend: "20270905T153000Z",
  },
  {
    id: "cocktails",
    day: "Sunday",
    date: "September 5, 2027",
    title: "Cocktail Hour",
    time: "5:30 PM",
    endTime: "7:00 PM",
    location: "Upper terrace",
    address: "Casale dei Mascioni, San Prisco (CE), Campania, Italy",
    dress: "Black tie optional",
    transport: "On site — a short walk from the ceremony garden.",
    notes: "Aperitivo, canapés, and golden-hour light. Spritzes will be poured.",
    mapQuery: "Casale+dei+Mascioni+San+Prisco",
    dtstart: "20270905T153000Z",
    dtend: "20270905T170000Z",
  },
  {
    id: "reception",
    day: "Sunday",
    date: "September 5, 2027",
    title: "Reception",
    time: "7:00 PM",
    endTime: "9:30 PM",
    location: "Courtyard, Casale dei Mascioni",
    address: "Casale dei Mascioni, San Prisco (CE), Campania, Italy",
    dress: "Black tie optional",
    transport: "On site",
    notes: "A multi-course Italian feast, family-style, under the stars. Speeches, toasts, and the first dance.",
    mapQuery: "Casale+dei+Mascioni+San+Prisco",
    dtstart: "20270905T170000Z",
    dtend: "20270905T193000Z",
  },
  {
    id: "dancing",
    day: "Sunday",
    date: "September 5, 2027",
    title: "Dancing",
    time: "9:30 PM",
    endTime: "1:00 AM",
    location: "Courtyard & terrace",
    address: "Casale dei Mascioni, San Prisco (CE), Campania, Italy",
    dress: "Comfortable shoes recommended",
    transport: "Return shuttles begin at 11:30 PM and run until 1:15 AM.",
    notes: "The floor is yours. Late-night bites and limoncello around 11:30 PM.",
    mapQuery: "Casale+dei+Mascioni+San+Prisco",
    dtstart: "20270905T193000Z",
    dtend: "20270905T230000Z",
  },
  {
    id: "brunch",
    day: "Monday",
    date: "September 6, 2027",
    title: "Farewell Brunch",
    time: "11:00 AM",
    endTime: "2:00 PM",
    location: "Casale dei Mascioni",
    address: "Casale dei Mascioni, San Prisco (CE), Campania, Italy",
    dress: "Relaxed daytime chic",
    transport: "Optional shuttle from Naples hotels at 10:15 AM. Taxis readily available.",
    notes: "One last toast in the Italian sun — coffee, cornetti, and lingering goodbyes.",
    mapQuery: "Casale+dei+Mascioni+San+Prisco",
    dtstart: "20270906T090000Z",
    dtend: "20270906T120000Z",
  },
];

export const STORY_BEATS: StoryBeat[] = [
  {
    year: "2020",
    title: "We met",
    body: "A crowded salsa class in Brooklyn. Eric asked Janelle to dance — she said yes, and neither of them sat down for the rest of the night.",
    image: "/images/couple-story.jpg",
  },
  {
    year: "2021",
    title: "First adventure",
    body: "Our first trip together: a long weekend with no itinerary, too much coffee, and the quiet realization that ordinary days felt different with each other.",
    image: "/images/couple-story-alt.jpg",
  },
  {
    year: "2023",
    title: "Italy, the first time",
    body: "We fell for Campania immediately — the light, the food, the unhurried evenings. Casale dei Mascioni was a last-minute visit. We both went quiet walking the gardens.",
    image: "/images/casale-mascioni.jpg",
  },
  {
    year: "2026",
    title: "We got engaged",
    body: "Sunset on the Amalfi Coast. Limoncello. A ring hidden in a jacket pocket. Janelle cried. Eric did too, eventually.",
    image: "/images/couple-proposal.jpg",
  },
  {
    year: "2027",
    title: "We're getting married",
    body: "We're going back to the place that felt like home — with the people who made us who we are.",
    image: "/images/venue-estate.jpg",
  },
];

export const KNOW_US_QUESTIONS: QuizQuestion[] = [
  {
    id: "ku1",
    question: "Who said “I love you” first?",
    options: ["Janelle", "Eric", "They said it at the same time", "A text that neither will admit to"],
    correctIndex: 1,
    explanation: "Eric said it first — on a walk home from dinner, three months in. Janelle had been waiting to say it back.",
  },
  {
    id: "ku2",
    question: "Who takes longer to get ready?",
    options: ["Janelle", "Eric", "They're tied", "Depends on the night"],
    correctIndex: 1,
    explanation: "Eric, surprisingly. The man has a skincare ritual and he will not be rushed.",
  },
  {
    id: "ku3",
    question: "Who planned their first trip together?",
    options: ["Janelle", "Eric", "A travel agent friend", "They winged it"],
    correctIndex: 0,
    explanation: "Janelle built a beautiful spreadsheet. Eric packed snacks. Both were essential.",
  },
  {
    id: "ku4",
    question: "Where did they first meet?",
    options: ["A coffee shop in Brooklyn", "Through mutual friends", "At a salsa class", "On a hiking trip"],
    correctIndex: 2,
    explanation: "Salsa class. Eric asked Janelle to dance. The rest is history.",
  },
  {
    id: "ku5",
    question: "Who is more likely to cry at the ceremony?",
    options: ["Janelle", "Eric", "Both, immediately", "Neither — they're professionals"],
    correctIndex: 2,
    explanation: "Both. We are not pretending otherwise.",
  },
  {
    id: "ku6",
    question: "What is their Sunday tradition?",
    options: ["Farmers market runs", "Morning hikes", "Cooking pasta from scratch", "Long phone calls with family"],
    correctIndex: 2,
    explanation: "Fresh pasta every Sunday. It is non-negotiable.",
  },
];

export const TRIVIA_QUESTIONS: QuizQuestion[] = [
  {
    id: "tr1",
    question: "Why did they choose Campania for the wedding?",
    options: [
      "Eric's family is from Naples",
      "They fell in love with Casale dei Mascioni on a trip",
      "Janelle studied abroad in Sorrento",
      "It was the first place they could book",
    ],
    correctIndex: 1,
    explanation: "One weekend visit to the estate and they knew.",
  },
  {
    id: "tr2",
    question: "What will almost certainly fill the dance floor?",
    options: ["September — Earth, Wind & Fire", "Despacito", "Dancing Queen", "Uptown Funk"],
    correctIndex: 0,
    explanation: "September is basically their relationship anthem.",
  },
  {
    id: "tr3",
    question: "Janelle's go-to Italian order is…",
    options: ["Cacio e pepe", "Pizza margherita", "Spaghetti alle vongole", "Tiramisu first, questions later"],
    correctIndex: 2,
    explanation: "Vongole, always — especially near the coast.",
  },
  {
    id: "tr4",
    question: "Eric's hidden talent is…",
    options: ["Professional-level espresso", "Remembering every song lyric", "Packing a suitcase in 8 minutes", "Naming every tree"],
    correctIndex: 1,
    explanation: "Do not start a karaoke war with this man.",
  },
  {
    id: "tr5",
    question: "The engagement ring was hidden in…",
    options: ["A camera bag", "A jacket pocket", "A dessert", "Plain sight the whole afternoon"],
    correctIndex: 1,
    explanation: "Jacket pocket. He was sweating the entire boat ride.",
  },
  {
    id: "tr6",
    question: "Which family member is most likely to give the longest speech?",
    options: ["Janelle's dad", "Eric's sister", "A college roommate", "Whoever gets the microphone first"],
    correctIndex: 0,
    explanation: "Janelle's dad has been drafting it since 2021. We are prepared.",
  },
];

export const PHOTO_QUESTIONS: PhotoQuestion[] = [
  {
    id: "ph1",
    image: "/images/couple-proposal.jpg",
    prompt: "Where was this taken?",
    options: ["Positano", "Central Park", "Tuscany", "Lake Como"],
    correctIndex: 0,
    explanation: "The Amalfi Coast — the afternoon they got engaged.",
  },
  {
    id: "ph2",
    image: "/images/couple-story.jpg",
    prompt: "What year was this?",
    options: ["2021", "2023", "2025", "2026"],
    correctIndex: 1,
    explanation: "2023 — one of their first golden-hour walks in Italy.",
  },
  {
    id: "ph3",
    image: "/images/casale-mascioni.jpg",
    prompt: "What is this place?",
    options: ["Their first apartment", "The wedding venue", "A hotel in Rome", "Janelle's childhood home"],
    correctIndex: 1,
    explanation: "Casale dei Mascioni — where we'll gather in 2027.",
  },
  {
    id: "ph4",
    image: "/images/couple-hero.jpg",
    prompt: "Who planned this photo?",
    options: ["Janelle", "Eric", "A stranger they asked on the street", "Nobody — it was an accident"],
    correctIndex: 2,
    explanation: "A kind stranger with excellent timing and a better eye.",
  },
];

export const PREDICTION_QUESTIONS: PredictionQuestion[] = [
  { id: "pr1", question: "Who will cry first?", options: ["Janelle", "Eric", "A parent", "A groomsman"] },
  { id: "pr2", question: "Who will be late?", options: ["The photographer", "A sibling", "Nobody", "Half the NYC crew"] },
  { id: "pr3", question: "First song of the night?", options: ["A classic", "Afrobeats", "90s R&B", "Something Italian"] },
  { id: "pr4", question: "First dance song?", options: ["A ballad", "Something unexpected", "A song from 2020", "They'll keep it secret"] },
  { id: "pr5", question: "How many people will dance?", options: ["Everyone, immediately", "After two songs", "After dessert", "The brave few"] },
  { id: "pr6", question: "What time will the reception end?", options: ["11:00 PM", "Midnight", "1:00 AM", "Whenever the lights go out"] },
];

export const ENGAGEMENT_TRIVIA: QuizQuestion[] = [
  {
    id: "en1",
    question: "Guess what happened next?",
    options: [
      "They went straight to dinner with family on FaceTime",
      "They missed the last ferry and stayed an extra night",
      "Janelle called her mom before she even said yes",
      "A waiter brought complimentary limoncello and burst into tears",
    ],
    correctIndex: 1,
    explanation: "They missed the last ferry on purpose. Best unplanned night of their lives.",
  },
];

export const SONG_CATEGORIES: { id: SongCategory; label: string }[] = [
  { id: "90s", label: "90s" },
  { id: "2000s", label: "2000s" },
  { id: "rnb", label: "R&B" },
  { id: "dancehall", label: "Dancehall" },
  { id: "afrobeats", label: "Afrobeats" },
  { id: "italian", label: "Italian" },
  { id: "classics", label: "Classics" },
  { id: "guilty", label: "Guilty Pleasures" },
];

export const PLACES: Place[] = [
  {
    id: "positano",
    name: "Positano",
    category: "day-trips",
    description: "Pastel cliffside village, steep stairs, and water so blue it looks edited. Go early.",
    location: "Amalfi Coast",
    distance: "1 hour 15 min from venue",
    image: "/images/amalfi-coast.jpg",
    mapQuery: "Positano+Italy",
    recommended: true,
  },
  {
    id: "spiaggia",
    name: "Marina Grande, Sorrento",
    category: "beaches",
    description: "A working fishing beach with excellent seafood and a slower tempo than the famous coves.",
    location: "Sorrento",
    distance: "1 hour from venue",
    image: "/images/sorrento.jpg",
    mapQuery: "Marina+Grande+Sorrento",
    recommended: true,
  },
  {
    id: "l-antica-pizzeria",
    name: "L'Antica Pizzeria da Michele",
    category: "restaurants",
    description: "The Naples classic. Two pizzas on the menu. Both correct.",
    location: "Naples",
    distance: "40 min from venue",
    image: "/images/naples.jpg",
    mapQuery: "Antica+Pizzeria+da+Michele+Napoli",
    recommended: true,
  },
  {
    id: "palazzo-reale",
    name: "Royal Palace of Caserta",
    category: "history",
    description: "Italy's Versailles — monumental gardens, late-summer light, and an easy half-day from the venue.",
    location: "Caserta",
    distance: "20 min from venue",
    image: "/images/caserta.jpg",
    mapQuery: "Reggia+di+Caserta",
    recommended: true,
  },
  {
    id: "trastevere",
    name: "Trastevere at dusk",
    category: "romantic",
    description: "If you're extending through Rome: cobblestones, aperitivo, and the kind of evening that doesn't need a plan.",
    location: "Rome",
    distance: "2 hours by train",
    image: "/images/rome.jpg",
    mapQuery: "Trastevere+Rome",
    recommended: true,
  },
  {
    id: "capri-boat",
    name: "Capri boat day",
    category: "day-trips",
    description: "Ferry from Sorrento. Swim stops, the Faraglioni, and a slow lunch on the water.",
    location: "Capri",
    distance: "1.5 hours from venue + ferry",
    image: "/images/amalfi-coast.jpg",
    mapQuery: "Capri+Italy",
    recommended: true,
  },
  {
    id: "spaccanapoli",
    name: "Spaccanapoli wander",
    category: "shopping",
    description: "The artery of old Naples — nativity workshops, espresso at the bar, and no straight lines.",
    location: "Naples",
    distance: "35 min from venue",
    image: "/images/naples.jpg",
    mapQuery: "Spaccanapoli+Napoli",
    recommended: false,
  },
  {
    id: "chill-out",
    name: "Terrazza terrace bars, Sorrento",
    category: "bars",
    description: "Sunset spritz with a bay view. Go for golden hour, stay for the second round.",
    location: "Sorrento",
    distance: "1 hour from venue",
    image: "/images/sorrento.jpg",
    mapQuery: "Piazza+Tasso+Sorrento",
    recommended: true,
  },
  {
    id: "pompeii",
    name: "Pompeii",
    category: "history",
    description: "A full morning. Bring water, good shoes, and more time than you think.",
    location: "Pompeii",
    distance: "45 min from venue",
    image: "/images/travel-landscape.jpg",
    mapQuery: "Pompeii+Archaeological+Park",
    recommended: true,
  },
  {
    id: "family-caserta",
    name: "Caserta palace gardens",
    category: "family",
    description: "Wide paths, fountains, and room to wander — the easiest impressive outing with mixed ages.",
    location: "Caserta",
    distance: "20 min from venue",
    image: "/images/caserta.jpg",
    mapQuery: "Giardini+Reggia+di+Caserta",
    recommended: true,
  },
  {
    id: "naples-night",
    name: "Chiaia evening",
    category: "nightlife",
    description: "Naples after dark: wine bars, passeggiata, and a last sfogliatella if you timed it right.",
    location: "Naples",
    distance: "40 min from venue",
    image: "/images/naples.jpg",
    mapQuery: "Chiaia+Napoli",
    recommended: false,
  },
  {
    id: "limone",
    name: "Lemon groves of Sorrento",
    category: "romantic",
    description: "Walk the groves, taste limoncello at the source, sit still for a while.",
    location: "Sorrento",
    distance: "1 hour from venue",
    image: "/images/sorrento.jpg",
    mapQuery: "Agrumeto+Sorrento",
    recommended: true,
  },
];

export const PLACE_CATEGORIES: { id: PlaceCategory | "all"; label: string }[] = [
  { id: "all", label: "All" },
  { id: "beaches", label: "Beaches" },
  { id: "restaurants", label: "Restaurants" },
  { id: "bars", label: "Bars" },
  { id: "day-trips", label: "Day trips" },
  { id: "shopping", label: "Shopping" },
  { id: "history", label: "History" },
  { id: "nightlife", label: "Nightlife" },
  { id: "romantic", label: "Romantic" },
  { id: "family", label: "Family friendly" },
];

export const CHANNELS: { id: "general" | "travel" | "italy" | "weekend" | "afterparty"; label: string; blurb: string }[] = [
  { id: "general", label: "General", blurb: "Wedding updates and conversation" },
  { id: "travel", label: "Travel", blurb: "Flights, trains, transportation" },
  { id: "italy", label: "Italy", blurb: "Restaurants, beaches, activities" },
  { id: "weekend", label: "Wedding Weekend", blurb: "Live coordination" },
  { id: "afterparty", label: "After Party", blurb: "Post-wedding conversation" },
];

export const FAQ_ITEMS = [
  {
    question: "When should I RSVP?",
    answer: "Please respond by June 1, 2027. Your reply helps us finalize seating, catering, and transportation.",
  },
  {
    question: "What should I wear?",
    answer: "Black tie optional for the ceremony and reception. Think elevated European elegance — linen, silk, refined tailoring. Comfortable shoes for terrace and garden terrain.",
  },
  {
    question: "Where should I stay?",
    answer: "Naples and Caserta are closest to the venue. Sorrento and the Amalfi Coast are beautiful if you're extending. See Travel for hotel suggestions.",
  },
  {
    question: "How do I get to the venue?",
    answer: "Fly into Naples (NAP) or Rome (FCO/CIA). From Naples the estate is about 45 minutes by car. Coordinate rides on the Need a Ride board.",
  },
  {
    question: "Will transportation be provided?",
    answer: "Shuttles will run between recommended hotels and wedding events. Pickup times will be posted in Updates as we get closer.",
  },
  {
    question: "What will the weather be like?",
    answer: "Early September in Campania is warm and sunny — about 75–85°F (24–29°C) by day, pleasant at night. Light layers for outdoor dining.",
  },
  {
    question: "Are children invited?",
    answer: "We love your little ones, but this is an adults-only celebration so everyone can linger. Thank you for understanding.",
  },
];

export const HOTELS = [
  {
    name: "Grand Hotel Vesuvio",
    area: "Naples",
    distance: "45 minutes from venue",
    priceRange: "€€€",
    description: "A landmark Naples hotel with Gulf views and Belle Époque calm. Strong shuttle candidate.",
    booking: "Mention the Fore wedding for preferred rates. Block details in Updates.",
    transport: "Easy airport access; private cars and taxis downstairs.",
    image: "/images/hotel-luxury.jpg",
  },
  {
    name: "Hotel San Francesco al Monte",
    area: "Naples",
    distance: "30–40 minutes from venue",
    priceRange: "€€",
    description: "A restored monastery with quiet courtyards and a city panorama — our favorite mid-range stay.",
    booking: "Contact the hotel directly; group block coming soon.",
    transport: "Near Naples Centrale for Rome trains and airport buses.",
    image: "/images/naples.jpg",
  },
  {
    name: "Palazzo Avino",
    area: "Ravello / Amalfi",
    distance: "About 1 hour from venue",
    priceRange: "€€€€",
    description: "Cliffside Ravello for guests extending along the coast. Book early for September.",
    booking: "Limited September availability — reserve as soon as you can.",
    transport: "We recommend a driver for the coastal roads.",
    image: "/images/hotel-boutique.jpg",
  },
] as const;

export const AIRPORTS = [
  {
    code: "NAP",
    name: "Naples International (Capodichino)",
    note: "Closest airport — 35–50 minutes to the venue depending on traffic.",
    from: "Direct flights from major US hubs (often via Europe) and across the EU.",
  },
  {
    code: "FCO",
    name: "Rome Fiumicino",
    note: "Best long-haul option. Then 1h10 high-speed train to Napoli Centrale + 40 minutes by car.",
    from: "Most transatlantic itineraries land here.",
  },
  {
    code: "CIA",
    name: "Rome Ciampino",
    note: "Mostly European low-cost carriers. Transfer to Roma Termini, then the high-speed south.",
    from: "Handy if you're already touring Europe.",
  },
] as const;
