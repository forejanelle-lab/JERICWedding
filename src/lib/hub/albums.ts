import type { GuestPhoto, HubState, PhotoFolder } from "@/lib/hub/types";

export const DEFAULT_PHOTO_FOLDERS: PhotoFolder[] = [
  { id: "recent", label: "Recent" },
  { id: "friday", label: "Saturday" },
  { id: "wedding", label: "Wedding" },
  { id: "sunday", label: "Monday" },
  { id: "travel", label: "Travel" },
];

const DEFAULT_LABEL_KEYS: Record<string, string> = {
  recent: "photos.recent",
  friday: "photos.saturday",
  wedding: "photos.wedding",
  sunday: "photos.monday",
  travel: "photos.travel",
};

export function normalizePhotoFolders(value: unknown): PhotoFolder[] {
  if (!Array.isArray(value)) return DEFAULT_PHOTO_FOLDERS.map((folder) => ({ ...folder }));
  const seen = new Set<string>();
  const folders: PhotoFolder[] = [];
  for (const item of value) {
    if (!item || typeof item !== "object") continue;
    const id = String((item as PhotoFolder).id ?? "").trim();
    const label = String((item as PhotoFolder).label ?? "").trim();
    if (!id || !label || seen.has(id)) continue;
    seen.add(id);
    folders.push({ id, label });
  }
  return folders.length ? folders : DEFAULT_PHOTO_FOLDERS.map((folder) => ({ ...folder }));
}

export function samePhotoFolders(a: PhotoFolder[], b: PhotoFolder[]) {
  return a.length === b.length && a.every((folder, index) => folder.id === b[index]?.id && folder.label === b[index]?.label);
}

export function mergePhotoFolders(remote: unknown, local: PhotoFolder[]) {
  const remoteFolders = normalizePhotoFolders(remote);
  const localFolders = normalizePhotoFolders(local);
  if (!samePhotoFolders(remoteFolders, DEFAULT_PHOTO_FOLDERS)) return remoteFolders;
  if (!samePhotoFolders(localFolders, DEFAULT_PHOTO_FOLDERS)) return localFolders;
  return remoteFolders;
}

export function photoFolderLabel(folder: PhotoFolder, t: (key: string) => string) {
  const fallback = DEFAULT_PHOTO_FOLDERS.find((item) => item.id === folder.id);
  const key = DEFAULT_LABEL_KEYS[folder.id];
  if (key && fallback && folder.label === fallback.label) return t(key);
  return folder.label;
}

export function nextPhotoFolderId(label: string, folders: PhotoFolder[]) {
  const base = label
    .trim()
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "") || "album";
  let id = base;
  let n = 2;
  const taken = new Set(folders.map((folder) => folder.id));
  while (taken.has(id)) {
    id = `${base}-${n}`;
    n += 1;
  }
  return id;
}

export function visibleGuestPhotos(state: Pick<HubState, "photos" | "identity" | "adminAuthed">) {
  return state.photos.filter((photo) => {
    const mine = photo.authorId === state.identity?.guestId;
    return photo.approved || mine || state.adminAuthed;
  });
}

export function photosInFolder(photos: GuestPhoto[], folderId: string) {
  return photos.filter((photo) => photo.album === folderId);
}
