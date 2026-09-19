const BREVO_API = "https://api.brevo.com/v3";
const RSVP_LIST_NAME = "Website RSVPs";
const YES_CAMPAIGN = "RSVP Yes Confirmation";
const NO_CAMPAIGN = "RSVP No Confirmation";
const SENDER_FALLBACK = { name: "JERIC Wedding", email: "janellefore98@gmail.com" };

export type RsvpBrevoInput = {
  attending: boolean;
  email: string;
  firstName?: string;
  lastName?: string;
  fullName?: string;
};

type CampaignSummary = {
  id: number;
  name: string;
  subject?: string;
  htmlContent?: string;
  previewText?: string;
  sender?: { email?: string; name?: string };
  replyTo?: string;
};

let listIdCache: number | null | undefined;
let campaignCache: { at: number; campaigns: CampaignSummary[] } | null = null;

function apiKey() {
  return process.env.BREVO_API_KEY?.trim() ?? "";
}

function splitName(fullName?: string, firstName?: string, lastName?: string) {
  const first = firstName?.trim() ?? "";
  const last = lastName?.trim() ?? "";
  if (first || last) return { firstName: first, lastName: last };
  const parts = fullName?.trim().split(/\s+/).filter(Boolean) ?? [];
  if (parts.length === 0) return { firstName: "", lastName: "" };
  if (parts.length === 1) return { firstName: parts[0], lastName: "" };
  return { firstName: parts[0], lastName: parts.slice(1).join(" ") };
}

function substituteContactFields(html: string, fields: { FIRSTNAME: string; LASTNAME: string; EMAIL: string }) {
  return html.replace(/\{\{\s*contact\.(FIRSTNAME|LASTNAME|EMAIL)\s*\}\}/gi, (_, key: string) => {
    const value = fields[key.toUpperCase() as keyof typeof fields];
    return value ?? "";
  });
}

async function brevoFetch(path: string, init?: RequestInit) {
  const key = apiKey();
  const response = await fetch(`${BREVO_API}${path}`, {
    ...init,
    headers: {
      "api-key": key,
      Accept: "application/json",
      ...(init?.body ? { "Content-Type": "application/json" } : {}),
      ...init?.headers,
    },
  });
  const text = await response.text();
  let json: unknown = null;
  if (text) {
    try {
      json = JSON.parse(text) as unknown;
    } catch {
      json = { raw: text };
    }
  }
  return { ok: response.ok || response.status === 204, status: response.status, json, text };
}

async function resolveRsvpListId(): Promise<number | null> {
  const fromEnv = Number.parseInt(process.env.BREVO_RSVP_LIST_ID?.trim() ?? "", 10);
  if (Number.isFinite(fromEnv) && fromEnv > 0) return fromEnv;
  if (listIdCache !== undefined) return listIdCache;

  const { ok, json } = await brevoFetch("/contacts/lists?limit=50&offset=0");
  if (!ok) {
    listIdCache = null;
    return null;
  }
  const lists = (json as { lists?: { id: number; name: string }[] }).lists ?? [];
  const match = lists.find((list) => list.name === RSVP_LIST_NAME);
  listIdCache = match?.id ?? null;
  return listIdCache;
}

async function resolveCampaign(name: string): Promise<CampaignSummary | null> {
  const now = Date.now();
  if (!campaignCache || now - campaignCache.at > 5 * 60 * 1000) {
    const { ok, json } = await brevoFetch("/emailCampaigns?limit=50");
    if (!ok) return null;
    campaignCache = {
      at: now,
      campaigns: ((json as { campaigns?: CampaignSummary[] }).campaigns ?? []).map((campaign) => ({
        id: campaign.id,
        name: campaign.name,
        subject: campaign.subject,
        htmlContent: campaign.htmlContent,
        previewText: campaign.previewText,
        sender: campaign.sender,
        replyTo: campaign.replyTo,
      })),
    };
  }
  return campaignCache.campaigns.find((campaign) => campaign.name === name) ?? null;
}

async function upsertRsvpContact(input: RsvpBrevoInput & { firstName: string; lastName: string; email: string }) {
  const attending = input.attending;
  const rsvpValue = attending ? "Yes" : "No";
  const listId = await resolveRsvpListId();
  const attributes: Record<string, unknown> = {
    RSVP: [rsvpValue],
  };
  if (input.firstName) attributes.FIRSTNAME = input.firstName;
  if (input.lastName) attributes.LASTNAME = input.lastName;

  const payload: Record<string, unknown> = {
    email: input.email,
    updateEnabled: true,
    attributes,
    tags: [`RSVP ${rsvpValue}`],
  };
  if (listId) payload.listIds = [listId];

  const created = await brevoFetch("/contacts", {
    method: "POST",
    body: JSON.stringify(payload),
  });
  if (created.ok) return { synced: true as const };

  const updated = await brevoFetch(`/contacts/${encodeURIComponent(input.email)}`, {
    method: "PUT",
    body: JSON.stringify({
      attributes,
      ...(listId ? { listIds: [listId] } : {}),
    }),
  });
  if (updated.ok) return { synced: true as const };

  return {
    synced: false as const,
    error: created.text || updated.text || "Brevo contact sync failed",
  };
}

async function sendRsvpConfirmation(input: RsvpBrevoInput & { firstName: string; lastName: string; email: string }) {
  const campaignName = input.attending ? YES_CAMPAIGN : NO_CAMPAIGN;
  const campaign = await resolveCampaign(campaignName);
  if (!campaign?.htmlContent || !campaign.subject) {
    return { sent: false as const, error: `Brevo campaign "${campaignName}" was not found.` };
  }

  const htmlContent = substituteContactFields(campaign.htmlContent, {
    FIRSTNAME: input.firstName,
    LASTNAME: input.lastName,
    EMAIL: input.email,
  });
  const senderEmail = campaign.sender?.email?.trim() || SENDER_FALLBACK.email;
  const senderName = campaign.sender?.name?.trim() || SENDER_FALLBACK.name;
  const displayName = [input.firstName, input.lastName].filter(Boolean).join(" ");

  const sent = await brevoFetch("/smtp/email", {
    method: "POST",
    body: JSON.stringify({
      sender: { name: senderName, email: senderEmail },
      to: [{ email: input.email, ...(displayName ? { name: displayName } : {}) }],
      subject: campaign.subject,
      htmlContent,
      ...(campaign.replyTo ? { replyTo: { email: campaign.replyTo } } : {}),
      tags: [input.attending ? "rsvp-yes-confirmation" : "rsvp-no-confirmation"],
    }),
  });

  if (sent.ok) return { sent: true as const };
  return { sent: false as const, error: sent.text || "Brevo confirmation email failed" };
}

export async function syncRsvpToBrevo(input: RsvpBrevoInput) {
  if (!apiKey()) {
    return { synced: false, sent: false, error: "BREVO_API_KEY is not configured" };
  }

  const email = input.email.trim().toLowerCase();
  if (!email || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
    return { synced: false, sent: false, error: "A valid email is required." };
  }

  const { firstName, lastName } = splitName(input.fullName, input.firstName, input.lastName);
  const contact = await upsertRsvpContact({ ...input, email, firstName, lastName });
  if (!contact.synced) {
    return { synced: false, sent: false, error: contact.error };
  }

  const mail = await sendRsvpConfirmation({ ...input, email, firstName, lastName });
  return {
    synced: true,
    sent: mail.sent,
    error: mail.error,
  };
}
