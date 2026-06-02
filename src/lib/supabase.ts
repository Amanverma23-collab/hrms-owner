import { createClient } from "@supabase/supabase-js";

const supabaseUrl = "https://lquyttnxohdbhuuzqniq.supabase.co";

const supabaseAnonKey = "sb_publishable_O5edHk10p4KxHQWnf7AeyQ_FxA7CGHo";

const supabase = createClient(
  supabaseUrl,
  supabaseAnonKey
);

export default supabase;