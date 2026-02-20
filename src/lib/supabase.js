import { createClient } from "@supabase/supabase-js";

export const supabase = createClient(import.meta.env.VITE_SUPABASE_URL, import.meta.env.VITE_SUPABASE_ANON_KEY);

export const getUser = async () => {
  const {
    data: { session },
  } = await supabase.auth.getSession();
  return session?.user;
};
