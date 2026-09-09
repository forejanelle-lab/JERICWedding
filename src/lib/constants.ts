export const WEDDING = {
  couple: "Janelle & Eric",
  date: "September 4–6, 2027",
  dateISO: "2027-09-05T16:00:00+02:00",
  location: "Campania, Italy",
  venue: "Casale dei Mascioni",
  guestCount: 105,
} as const;

export const NAV_ITEMS = [
  { label: "Our Story", href: "#story" },
  { label: "The Weekend", href: "#weekend" },
  { label: "Venue", href: "#venue" },
  { label: "Travel", href: "#travel" },
  { label: "Campania", href: "#campania" },
  { label: "Gallery", href: "#gallery" },
  { label: "RSVP", href: "#rsvp" },
  { label: "FAQ", href: "#faq" },
] as const;

export const WEEKEND_EVENTS = [
  {
    day: "Saturday",
    title: "Welcome / Rehearsal Dinner",
    date: "September 4, 2027",
    time: "7:00 PM",
    location: "Casale dei Mascioni",
    description:
      "An intimate evening to welcome our guests with a relaxed al fresco dinner among the olive trees.",
  },
  {
    day: "Sunday",
    title: "Wedding Day",
    date: "September 5, 2027",
    time: "4:30 PM",
    location: "Casale dei Mascioni",
    description:
      "The celebration of our marriage — ceremony, dinner, and dancing under the Campania sky.",
  },
  {
    day: "Monday",
    title: "Farewell / Brunch",
    date: "September 6, 2027",
    time: "11:00 AM",
    location: "Casale dei Mascioni",
    description:
      "A leisurely farewell brunch before we all depart — one last toast in the Italian sun.",
  },
] as const;

export const WEDDING_DAY_TIMELINE = [
  {
    title: "Ceremony",
    time: "4:30 PM",
    description: "Exchange of vows in the garden overlooking the countryside.",
  },
  {
    title: "Cocktail Hour",
    time: "5:30 PM",
    description: "Aperitivo and canapés on the terrace as the sun begins to set.",
  },
  {
    title: "Dinner",
    time: "7:00 PM",
    description: "A multi-course Italian feast served family-style under the stars.",
  },
  {
    title: "Dancing",
    time: "9:30 PM",
    description: "Music, celebration, and dancing into the evening.",
  },
  {
    title: "Late Night",
    time: "11:30 PM",
    description: "Late-night bites and one final glass of limoncello.",
  },
] as const;

export const HOTELS = [
  {
    name: "Grand Hotel Vesuvio",
    distance: "45 minutes from venue",
    priceRange: "€€€",
    description:
      "A landmark Naples hotel with sweeping views of the Gulf and timeless Belle Époque elegance.",
    booking: "Book directly or mention the Fore–[Surname] wedding for preferred rates.",
    transport: "Private car service available; shuttle coordination details to follow.",
    image: "/images/hotel-luxury.jpg",
  },
  {
    name: "Palazzo Avino",
    distance: "1 hour from venue",
    priceRange: "€€€€",
    description:
      "A cliffside retreat on the Amalfi Coast — ideal for guests extending their stay along the coast.",
    booking: "Reserve early for September; limited availability in Ravello.",
    transport: "Scenic coastal drive; we recommend hiring a driver for the winding roads.",
    image: "/images/hotel-boutique.jpg",
  },
  {
    name: "Hotel San Francesco al Monte",
    distance: "30 minutes from venue",
    priceRange: "€€",
    description:
      "A restored monastery in Naples with panoramic city views and quiet, contemplative charm.",
    booking: "Contact the hotel directly; group block details coming soon.",
    transport: "Easy access to Naples Central Station and airport transfers.",
    image: "/images/naples.jpg",
  },
] as const;

export const CAMPANIA_DESTINATIONS = [
  {
    name: "Naples",
    travelTime: "30–45 min from venue",
    see: "Historic centro, Spaccanapoli, Castel dell'Ovo, archaeological treasures.",
    eat: "Neapolitan pizza, sfogliatella, fresh seafood along the waterfront.",
    do: "Wander the piazzas, visit Museo Archeologico, explore the vibrant street life.",
    image: "/images/naples.jpg",
  },
  {
    name: "Rome",
    travelTime: "2 hours by train",
    see: "The Colosseum, Vatican, Trevi Fountain, Trastevere at golden hour.",
    eat: "Cacio e pepe, supplì, gelato at Giolitti, aperitivo in Monti.",
    do: "Perfect for a pre- or post-wedding extension — high-speed trains from Naples.",
    image: "/images/rome.jpg",
  },
  {
    name: "Amalfi Coast",
    travelTime: "1–1.5 hours from venue",
    see: "Positano, Ravello, the Path of the Gods, emerald waters below cliffside villages.",
    eat: "Fresh catch of the day, limoncello, lemon delizia in every pastel-hued town.",
    do: "Boat tours, coastal hikes, lazy afternoons on the terrazza with a spritz.",
    image: "/images/amalfi-coast.jpg",
  },
  {
    name: "Caserta",
    travelTime: "20 min from venue",
    see: "The Royal Palace of Caserta — Italy's answer to Versailles, with vast gardens.",
    eat: "Rustic Campanian cuisine in the nearby historic center.",
    do: "A half-day visit; the palace gardens are extraordinary in late summer light.",
    image: "/images/caserta.jpg",
  },
  {
    name: "Sorrento",
    travelTime: "1 hour from venue",
    see: "Cliffside views, Piazza Tasso, lemon groves, gateway to Capri.",
    eat: "Gnocchi alla sorrentina, insalata caprese, local limoncello.",
    do: "Sunset aperitivo overlooking the bay; ferry to Capri for a day trip.",
    image: "/images/sorrento.jpg",
  },
] as const;

export const FAQ_ITEMS = [
  {
    question: "When should I RSVP?",
    answer:
      "Please respond by June 1, 2027. Your prompt reply helps us finalize seating, catering, and accommodations with our venue.",
  },
  {
    question: "What should I wear?",
    answer:
      "Black tie optional for the wedding ceremony and reception. Think elevated European elegance — linen, silk, and refined tailoring. Comfortable shoes for terrace and garden terrain are encouraged.",
  },
  {
    question: "Where should I stay?",
    answer:
      "We recommend staying in Naples or along the Amalfi Coast. See our Accommodations section for curated hotel suggestions with approximate distances and price ranges.",
  },
  {
    question: "How do I get to the venue?",
    answer:
      "Fly into Naples International Airport (NAP). From there, private car, taxi, or pre-arranged shuttle service to Casale dei Mascioni takes approximately 45 minutes. Detailed directions will be sent with your invitation.",
  },
  {
    question: "Will transportation be provided?",
    answer:
      "Shuttle service between recommended hotels and the venue will be arranged for wedding events. Specific pickup times and locations will be shared closer to the date.",
  },
  {
    question: "What will the weather be like?",
    answer:
      "Early September in Campania is warm and sunny, with daytime temperatures around 75–85°F (24–29°C) and pleasant evenings. Light layers are perfect for outdoor dining.",
  },
  {
    question: "Can I extend my trip in Italy?",
    answer:
      "Absolutely — we hope you do. Campania is the perfect base for exploring Naples, the Amalfi Coast, Pompeii, Capri, and beyond. See our Campania Guide for inspiration.",
  },
  {
    question: "Are children invited?",
    answer:
      "We love your little ones, but have chosen an adults-only celebration to allow all our guests to relax and enjoy the weekend. Thank you for understanding.",
  },
] as const;
