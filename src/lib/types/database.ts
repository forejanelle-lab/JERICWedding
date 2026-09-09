export type GuestRegion = "us" | "europe";

export type RideType = "offer" | "request";

export type BoardCategory =
  | "general"
  | "travel_tips"
  | "meetups"
  | "us_travelers"
  | "europe_guests";

export type Profile = {
  id: string;
  user_id: string | null;
  display_name: string;
  region: GuestRegion;
  home_city: string | null;
  arrival_date: string | null;
  departure_date: string | null;
  bio: string | null;
  avatar_url: string | null;
  created_at: string;
  updated_at: string;
};

export type Ride = {
  id: string;
  user_id: string | null;
  author_name: string | null;
  type: RideType;
  from_location: string;
  to_location: string;
  ride_date: string;
  seats: number;
  notes: string | null;
  region_tag: GuestRegion | null;
  created_at: string;
  updated_at: string;
};

export type BoardPost = {
  id: string;
  user_id: string | null;
  author_name: string | null;
  category: BoardCategory;
  title: string;
  body: string;
  region_tag: GuestRegion | null;
  created_at: string;
  updated_at: string;
};

export type BoardReply = {
  id: string;
  post_id: string;
  user_id: string | null;
  author_name: string | null;
  body: string;
  created_at: string;
};

export type Database = {
  public: {
    Tables: {
      profiles: {
        Row: Profile;
        Insert: {
          id?: string;
          user_id?: string | null;
          display_name: string;
          region: GuestRegion;
          home_city?: string | null;
          arrival_date?: string | null;
          departure_date?: string | null;
          bio?: string | null;
          avatar_url?: string | null;
          created_at?: string;
          updated_at?: string;
        };
        Update: {
          display_name?: string;
          region?: GuestRegion;
          home_city?: string | null;
          arrival_date?: string | null;
          departure_date?: string | null;
          bio?: string | null;
          avatar_url?: string | null;
          updated_at?: string;
        };
        Relationships: [];
      };
      rides: {
        Row: Ride;
        Insert: {
          id?: string;
          user_id?: string | null;
          author_name?: string | null;
          type: RideType;
          from_location: string;
          to_location: string;
          ride_date: string;
          seats?: number;
          notes?: string | null;
          region_tag?: GuestRegion | null;
          created_at?: string;
          updated_at?: string;
        };
        Update: {
          author_name?: string | null;
          type?: RideType;
          from_location?: string;
          to_location?: string;
          ride_date?: string;
          seats?: number;
          notes?: string | null;
          region_tag?: GuestRegion | null;
          updated_at?: string;
        };
        Relationships: [];
      };
      board_posts: {
        Row: BoardPost;
        Insert: {
          id?: string;
          user_id?: string | null;
          author_name?: string | null;
          category: BoardCategory;
          title: string;
          body: string;
          region_tag?: GuestRegion | null;
          created_at?: string;
          updated_at?: string;
        };
        Update: {
          author_name?: string | null;
          category?: BoardCategory;
          title?: string;
          body?: string;
          region_tag?: GuestRegion | null;
          updated_at?: string;
        };
        Relationships: [];
      };
      board_replies: {
        Row: BoardReply;
        Insert: {
          id?: string;
          post_id: string;
          user_id?: string | null;
          author_name?: string | null;
          body: string;
          created_at?: string;
        };
        Update: {
          author_name?: string | null;
          body?: string;
        };
        Relationships: [];
      };
    };
    Views: Record<string, never>;
    Functions: Record<string, never>;
    Enums: Record<string, never>;
    CompositeTypes: Record<string, never>;
  };
};
