"use server";

import { redirect } from "next/navigation";
import { createServerClient } from "@/lib/supabase/server";
import type { BoardCategory, GuestRegion, RideType } from "@/lib/types/database";

const CONFIG_ERROR =
  "Guest portal is not configured yet. Copy .env.local.example to .env.local and add your Supabase keys.";

async function getSupabaseClient() {
  const supabase = await createServerClient();
  if (!supabase) {
    return { error: CONFIG_ERROR, supabase: null };
  }
  return { error: null, supabase };
}

export async function createProfile(formData: FormData) {
  const { error: configError, supabase } = await getSupabaseClient();
  if (configError || !supabase) {
    return { error: configError ?? CONFIG_ERROR };
  }

  const displayName = String(formData.get("display_name") ?? "").trim();
  const region = String(formData.get("region") ?? "") as GuestRegion;
  const homeCity = String(formData.get("home_city") ?? "").trim() || null;
  const arrivalDate = String(formData.get("arrival_date") ?? "") || null;
  const departureDate = String(formData.get("departure_date") ?? "") || null;
  const bio = String(formData.get("bio") ?? "").trim() || null;

  if (!displayName) {
    return { error: "Please enter your name." };
  }

  if (region !== "us" && region !== "europe") {
    return { error: "Please select your region." };
  }

  const { error } = await supabase.from("profiles").insert({
    display_name: displayName,
    region,
    home_city: homeCity,
    arrival_date: arrivalDate,
    departure_date: departureDate,
    bio,
  });

  if (error) {
    return { error: error.message };
  }

  redirect("/lounge/members");
}

export async function createRide(formData: FormData) {
  const { error: configError, supabase } = await getSupabaseClient();
  if (configError || !supabase) {
    return { error: configError ?? CONFIG_ERROR };
  }

  const authorName = String(formData.get("author_name") ?? "").trim();
  const type = String(formData.get("type") ?? "") as RideType;
  const fromLocation = String(formData.get("from_location") ?? "").trim();
  const toLocation = String(formData.get("to_location") ?? "").trim();
  const rideDate = String(formData.get("ride_date") ?? "");
  const seats = Number(formData.get("seats") ?? 1);
  const notes = String(formData.get("notes") ?? "").trim() || null;
  const regionTagRaw = String(formData.get("region_tag") ?? "");
  const regionTag =
    regionTagRaw === "us" || regionTagRaw === "europe" ? regionTagRaw : null;

  if (!authorName) {
    return { error: "Please enter your name." };
  }

  if (!fromLocation || !toLocation || !rideDate) {
    return { error: "Please fill in route and date." };
  }

  if (type !== "offer" && type !== "request") {
    return { error: "Invalid ride type." };
  }

  const { error } = await supabase.from("rides").insert({
    author_name: authorName,
    type,
    from_location: fromLocation,
    to_location: toLocation,
    ride_date: rideDate,
    seats: Number.isFinite(seats) && seats > 0 ? seats : 1,
    notes,
    region_tag: regionTag,
  });

  if (error) {
    return { error: error.message };
  }

  redirect("/lounge/travel");
}

export async function deleteRideAction(rideId: string) {
  "use server";
  const { supabase } = await getSupabaseClient();
  if (supabase) {
    await supabase.from("rides").delete().eq("id", rideId);
  }
  redirect("/lounge/travel");
}

export async function deleteBoardPostAction(postId: string) {
  "use server";
  const { supabase } = await getSupabaseClient();
  if (supabase) {
    await supabase.from("board_posts").delete().eq("id", postId);
  }
  redirect("/lounge/discussions");
}

export async function createBoardPost(formData: FormData) {
  const { error: configError, supabase } = await getSupabaseClient();
  if (configError || !supabase) {
    return { error: configError ?? CONFIG_ERROR };
  }

  const authorName = String(formData.get("author_name") ?? "").trim();
  const category = String(formData.get("category") ?? "") as BoardCategory;
  const title = String(formData.get("title") ?? "").trim();
  const body = String(formData.get("body") ?? "").trim();
  const regionTagRaw = String(formData.get("region_tag") ?? "");
  const regionTag =
    regionTagRaw === "us" || regionTagRaw === "europe" ? regionTagRaw : null;

  if (!authorName) {
    return { error: "Please enter your name." };
  }

  if (!title || !body) {
    return { error: "Please add a title and message." };
  }

  const { error } = await supabase.from("board_posts").insert({
    author_name: authorName,
    category,
    title,
    body,
    region_tag: regionTag,
  });

  if (error) {
    return { error: error.message };
  }

  redirect("/lounge/discussions");
}

export async function createBoardReply(formData: FormData) {
  const { error: configError, supabase } = await getSupabaseClient();
  if (configError || !supabase) {
    return { error: configError ?? CONFIG_ERROR };
  }

  const authorName = String(formData.get("author_name") ?? "").trim();
  const postId = String(formData.get("post_id") ?? "");
  const body = String(formData.get("body") ?? "").trim();

  if (!authorName) {
    return { error: "Please enter your name." };
  }

  if (!postId || !body) {
    return { error: "Please enter a reply." };
  }

  const { error } = await supabase.from("board_replies").insert({
    post_id: postId,
    author_name: authorName,
    body,
  });

  if (error) {
    return { error: error.message };
  }

  redirect(`/lounge/discussions/${postId}`);
}
