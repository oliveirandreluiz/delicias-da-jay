import { createClient } from "@supabase/supabase-js";

const SUPA_URL  = import.meta.env.VITE_SUPA_URL;
const SUPA_ANON = import.meta.env.VITE_SUPA_ANON;

export const supabase = createClient(SUPA_URL, SUPA_ANON, {
  auth: {
    persistSession: true,
    autoRefreshToken: true,
    detectSessionInUrl: true,
    storage: window.localStorage,
    storageKey: "delicias-jay-auth",
    lock: async (_n, _t, fn) => await fn(),
  },
});
