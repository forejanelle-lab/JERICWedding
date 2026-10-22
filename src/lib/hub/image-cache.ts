import type { GuestPhoto } from "@/lib/hub/types";

const DB_NAME = "jeric-images";
const DB_STORE = "files";

export type CachedSiteImage = {
  src: string;
  updatedAt: number;
};

function openDb(): Promise<IDBDatabase | null> {
  if (typeof indexedDB === "undefined") return Promise.resolve(null);
  return new Promise((resolve) => {
    const request = indexedDB.open(DB_NAME, 1);
    request.onupgradeneeded = () => {
      if (!request.result.objectStoreNames.contains(DB_STORE)) request.result.createObjectStore(DB_STORE);
    };
    request.onsuccess = () => resolve(request.result);
    request.onerror = () => resolve(null);
  });
}

function withStore<T>(mode: IDBTransactionMode, run: (store: IDBObjectStore) => IDBRequest<T>): Promise<T | null> {
  return openDb().then(
    (db) =>
      new Promise((resolve) => {
        if (!db) {
          resolve(null);
          return;
        }
        const tx = db.transaction(DB_STORE, mode);
        const request = run(tx.objectStore(DB_STORE));
        request.onsuccess = () => resolve(request.result);
        request.onerror = () => resolve(null);
      }),
  );
}

export function rememberSiteImage(id: string, src: string, updatedAt = Date.now()) {
  const value: CachedSiteImage = { src, updatedAt };
  return withStore("readwrite", (store) => store.put(value, `site:${id}`));
}

export function loadCachedSiteImages(): Promise<Record<string, CachedSiteImage>> {
  return openDb().then(
    (db) =>
      new Promise((resolve) => {
        if (!db) {
          resolve({});
          return;
        }
        const images: Record<string, CachedSiteImage> = {};
        const request = db.transaction(DB_STORE, "readonly").objectStore(DB_STORE).openCursor();
        request.onerror = () => resolve(images);
        request.onsuccess = () => {
          const cursor = request.result;
          if (!cursor) {
            resolve(images);
            return;
          }
          if (typeof cursor.key === "string" && cursor.key.startsWith("site:")) {
            const value = cursor.value as CachedSiteImage | undefined;
            if (value?.src) images[cursor.key.slice(5)] = { src: value.src, updatedAt: Number(value.updatedAt) || 0 };
          }
          cursor.continue();
        };
      }),
  );
}

export function rememberGuestPhoto(photo: GuestPhoto) {
  return withStore("readwrite", (store) => store.put(photo, `photo:${photo.id}`));
}

export function forgetGuestPhoto(id: string) {
  return withStore("readwrite", (store) => store.delete(`photo:${id}`));
}

export function loadCachedGuestPhotos(): Promise<GuestPhoto[]> {
  return openDb().then(
    (db) =>
      new Promise((resolve) => {
        if (!db) {
          resolve([]);
          return;
        }
        const photos: GuestPhoto[] = [];
        const request = db.transaction(DB_STORE, "readonly").objectStore(DB_STORE).openCursor();
        request.onerror = () => resolve(photos);
        request.onsuccess = () => {
          const cursor = request.result;
          if (!cursor) {
            resolve(photos);
            return;
          }
          if (typeof cursor.key === "string" && cursor.key.startsWith("photo:")) {
            const photo = cursor.value as GuestPhoto | undefined;
            if (photo?.id && photo.src) photos.push(photo);
          }
          cursor.continue();
        };
      }),
  );
}
