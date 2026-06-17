import { supabaseAdmin } from "../lib/supabase.js";

export const requireAuth = async (req, res, next) => {
  const authHeader = req.headers.authorization;

  if (!authHeader || !authHeader.startsWith("Bearer ")) {
    return res
      .status(401)
      .json({ error: "Missing or invalid authorization header." });
  }

  const token = authHeader.replace("Bearer ", "");

  const {
    data: { user },
    error,
  } = await supabaseAdmin.auth.getUser(token);

  if (error || !user) {
    return res
      .status(401)
      .json({ error: "Unauthorized. Please sign in again." });
  }

  /* Attach user and token to request for downstream use */
  req.user = user;
  req.token = token;
  next();
};
