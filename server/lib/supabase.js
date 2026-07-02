import dotenv from "dotenv";
import { createClient } from "@supabase/supabase-js";

dotenv.config();

const supabaseUrl = process.env.SUPABASE_URL;
const supabaseService = process.env.SUPABASE_SERVICE_KEY;
const supabaseAnon = process.env.SUPABASE_ANON_KEY;

if (!supabaseUrl || !supabaseService) {
  throw new Error(
    "Missing Supabase server variables. " +
      "Add SUPABASE_URL and SUPABASE_SERVICE_KEY to your .env file.",
  );
}

/* Service role client — bypasses RLS for admin operations.
   Never expose this key to the frontend.                    */
export const supabaseAdmin = createClient(supabaseUrl, supabaseService);

/* Create a per-request client that respects RLS by using
   the authenticated user's JWT from the request header.   */
export const supabaseForUser = (token) =>
  createClient(supabaseUrl, supabaseAnon, {
    global: { headers: { Authorization: `Bearer ${token}` } },
  });
