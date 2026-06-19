import { supabaseAdmin } from "../lib/supabase.js";
import { AppError } from "../utils/AppError.js";

export const requireAuth = async (req, res, next) => {
  const authHeader = req.headers.authorization;

  if (!authHeader || !authHeader.startsWith("Bearer ")) {
    return next(new AppError("Missing or invalid authorization header.", 401));
  }

  const token = authHeader.replace("Bearer ", "");

  const {
    data: { user },
    error,
  } = await supabaseAdmin.auth.getUser(token);

  if (error || !user) {
    // error.message gives the real Supabase reason (e.g. "Invalid API key",
    // "JWT expired") — passed through so it lands in the logs, not just
    // a generic message.
    return next(
      new AppError(
        error?.message || "Unauthorized. Please sign in again.",
        401,
      ),
    );
  }

  req.user = user;
  req.token = token;
  next();
};
