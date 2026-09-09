import { formatDate, formatTime } from "@/lib/hub/utils";
import { unsubscribeUrl } from "@/lib/rides/token";
import { loadDigestStore, markPostsSent, pendingDigestPosts, type DigestPost } from "@/lib/rides/store";

function siteOrigin() {
  return process.env.NEXT_PUBLIC_SITE_URL ?? "http://localhost:3000";
}

function lineFor(post: DigestPost) {
  const when = [formatDate(post.date), post.time ? formatTime(post.time) : ""].filter(Boolean).join(" ");
  const seats = post.seats ? ` · ${post.seats} seat${post.seats === 1 ? "" : "s"}` : "";
  const notes = post.notes ? `<br/><span style="color:#77736C">${escapeHtml(post.notes)}</span>` : "";
  return `<p style="margin:0 0 14px;font-size:15px;line-height:1.45;color:#242424"><strong>${escapeHtml(post.authorName)}</strong> — ${escapeHtml(post.from)} → ${escapeHtml(post.to)}<br/>${escapeHtml(when)}${escapeHtml(seats)}${notes}</p>`;
}

function escapeHtml(value: string) {
  return value
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;");
}

function buildHtml(offers: DigestPost[], requests: DigestPost[], email: string) {
  const origin = siteOrigin();
  const unsub = unsubscribeUrl(origin, email);
  const offerBlock = offers.length
    ? `<h2 style="font-size:13px;letter-spacing:0.16em;text-transform:uppercase;color:#2D3B2D;margin:28px 0 12px">Guests who can drive</h2>${offers.map(lineFor).join("")}`
    : "";
  const requestBlock = requests.length
    ? `<h2 style="font-size:13px;letter-spacing:0.16em;text-transform:uppercase;color:#2D3B2D;margin:28px 0 12px">Guests who need a ride</h2>${requests.map(lineFor).join("")}`
    : "";
  return `<!doctype html>
<html><body style="margin:0;background:#F9F7F2;font-family:Georgia,serif">
  <div style="max-width:560px;margin:0 auto;padding:32px 24px;background:#F9F7F2;color:#242424">
    <p style="letter-spacing:0.2em;text-transform:uppercase;font-size:11px;color:#77736C;font-family:Helvetica,Arial,sans-serif">Janelle &amp; Eric</p>
    <h1 style="font-weight:300;font-size:28px;letter-spacing:0.08em;text-transform:uppercase;margin:8px 0 8px">Today's ride board</h1>
    <p style="font-size:15px;line-height:1.5;color:#77736C">A summary of new posts from today. Coordinate on the ride board.</p>
    ${offerBlock}
    ${requestBlock}
    <p style="margin-top:28px"><a href="${origin}/rides" style="display:inline-block;background:#2D3B2D;color:#F9F7F2;text-decoration:none;padding:12px 18px;border-radius:999px;font-family:Helvetica,Arial,sans-serif;font-size:11px;letter-spacing:0.16em;text-transform:uppercase">Open ride board</a></p>
    <p style="margin-top:36px;font-size:12px;color:#77736C;font-family:Helvetica,Arial,sans-serif">Don't want these emails? <a href="${unsub}" style="color:#2D3B2D">Unsubscribe</a></p>
  </div>
</body></html>`;
}

async function sendResend(to: string, subject: string, html: string) {
  const key = process.env.RESEND_API_KEY;
  const from = process.env.RESEND_FROM ?? "Janelle & Eric <beth.t@example.com>";
  if (!key) {
    console.info(`[ride-digest] skipped send to ${to} (no RESEND_API_KEY)`);
    return { ok: true, skipped: true };
  }
  const response = await fetch("https://api.resend.com/emails", {
    method: "POST",
    headers: {
      Authorization: `Bearer ${key}`,
      "Content-Type": "application/json",
    },
    body: JSON.stringify({ from, to, subject, html }),
  });
  if (!response.ok) {
    const body = await response.text();
    throw new Error(`Resend ${response.status}: ${body}`);
  }
  return { ok: true, skipped: false };
}

export async function sendDailyRideDigest() {
  const store = await loadDigestStore();
  const posts = pendingDigestPosts(store);
  const offers = posts.filter((post) => post.kind === "offer");
  const requests = posts.filter((post) => post.kind === "request");
  if (!offers.length && !requests.length) {
    return { sent: 0, skipped: true, reason: "empty" as const, offers: 0, requests: 0, recipients: 0 };
  }

  const recipients = store.subscribers.filter((email) => !store.unsubscribed.includes(email));
  if (!recipients.length) {
    return { sent: 0, skipped: true, reason: "no-recipients" as const, offers: offers.length, requests: requests.length, recipients: 0 };
  }

  if (!process.env.RESEND_API_KEY) {
    return {
      sent: 0,
      skipped: true,
      reason: "no-mailer" as const,
      offers: offers.length,
      requests: requests.length,
      recipients: recipients.length,
    };
  }

  let sent = 0;
  const parts = [
    offers.length ? `${offers.length} driving` : "",
    requests.length ? `${requests.length} need a ride` : "",
  ].filter(Boolean);
  const subject = `Ride board today — ${parts.join(", ")} · Janelle & Eric`;

  for (const email of recipients) {
    await sendResend(email, subject, buildHtml(offers, requests, email));
    sent += 1;
  }

  await markPostsSent(posts.map((post) => post.id));
  return {
    sent,
    skipped: false,
    offers: offers.length,
    requests: requests.length,
    recipients: recipients.length,
  };
}
