const STORAGE_KEY = 'anni14mars_submissions';
const SUPABASE_URL = import.meta.env.VITE_SUPABASE_URL;
const SUPABASE_ANON_KEY = import.meta.env.VITE_SUPABASE_ANON_KEY;

let supabaseClient = null;

export const TABLES = {
  QUIZ: 'quiz_submissions',
  PLAYLIST: 'playlist_submissions',
  KARAOKE: 'karaoke_submissions',
  HOSTING: 'hosting_requests',
};

async function getSupabaseClient() {
  if (!SUPABASE_URL || !SUPABASE_ANON_KEY) {
    return null;
  }

  if (supabaseClient) {
    return supabaseClient;
  }

  const { createClient } = await import('@supabase/supabase-js');
  supabaseClient = createClient(SUPABASE_URL, SUPABASE_ANON_KEY);
  return supabaseClient;
}

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

function mapPayloadForTable(table, payload) {
  if (table === TABLES.QUIZ) {
    return {
      author: payload.author,
      question: payload.question,
      answer_a: payload.answerA,
      answer_b: payload.answerB,
      answer_c: payload.answerC,
      answer_d: payload.answerD,
      correct_answer: payload.correctAnswer,
    };
  }

  if (table === TABLES.KARAOKE) {
    return {
      author: payload.author,
      song: payload.song,
      with_whom: payload.withWhom,
      note: payload.note || null,
    };
  }

  if (table === TABLES.PLAYLIST) {
    return {
      title: payload.title,
      artist: payload.artist,
      link: payload.link || null,
      vibe: payload.vibe || null,
    };
  }

  if (table === TABLES.HOSTING) {
    return {
      author: payload.author,
      needs_hosting: payload.needsHosting ?? true,
    };
  }

  return payload;
}

async function postToRemote(table, payload) {
  const client = await getSupabaseClient();
  if (!client) {
    return null;
  }

  const mappedPayload = mapPayloadForTable(table, payload);
  const { error } = await client.from(table).insert(mappedPayload);
  if (error) {
    throw new Error(`Supabase: ${error.message}`);
  }
  return true;
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
