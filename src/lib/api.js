const STORAGE_KEY = 'anni14mars_submissions';
const REMOTE_ENDPOINT = import.meta.env.VITE_COLLECTOR_URL;

export const TABLES = {
  QUIZ: 'quiz_submissions',
  PLAYLIST: 'playlist_submissions',
  KARAOKE: 'karaoke_submissions',
  HOSTING: 'hosting_requests',
};

function readStore() {
  if (typeof window === 'undefined') {
    return {};
  }

  const raw = window.localStorage.getItem(STORAGE_KEY);
  if (!raw) {
    return {};
  }

  try {
    return JSON.parse(raw);
  } catch {
    return {};
  }
}

function writeStore(store) {
  if (typeof window === 'undefined') {
    return;
  }
  window.localStorage.setItem(STORAGE_KEY, JSON.stringify(store));
}

async function postToRemote(table, payload) {
  if (!REMOTE_ENDPOINT) {
    return null;
  }

  const response = await fetch(REMOTE_ENDPOINT, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ table, payload }),
  });

  if (!response.ok) {
    throw new Error('Impossible d’enregistrer la contribution.');
  }

  return response.json().catch(() => null);
}

export async function submitToTable(table, payload) {
  const entry = {
    id: Date.now().toString(),
    createdAt: new Date().toISOString(),
    ...payload,
  };

  const store = readStore();
  const currentRows = store[table] ?? [];
  store[table] = [entry, ...currentRows];
  writeStore(store);

  await postToRemote(table, entry);
  return entry;
}

export function getTableRows(table) {
  const store = readStore();
  return store[table] ?? [];
}
