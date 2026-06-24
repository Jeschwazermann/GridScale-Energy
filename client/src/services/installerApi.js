import axios from "axios";
import { supabase } from "../lib/supabase";

const api = axios.create({
  baseURL: import.meta.env.VITE_API_URL || "http://localhost:3000",
});

/* ── Interceptor: attach Supabase JWT to every request ──
   This means callers never need to think about auth headers. */
api.interceptors.request.use(async (config) => {
  const {
    data: { session },
  } = await supabase.auth.getSession();
  if (session?.access_token) {
    config.headers.Authorization = `Bearer ${session.access_token}`;
  }
  return config;
});

/* ── Assessments ── */
export const runAssessment = (payload) =>
  api.post("/api/installer/assessments", payload);
export const fetchAssessment = (id) =>
  api.get(`/api/installer/assessments/${id}`);

/* ── Sizing ── */
export const fetchSizing = (effectiveDailyKWh) =>
  api.post("/api/installer/sizing", { effectiveDailyKWh });

/* ── Quotations ── */
export const createQuotation = (payload) =>
  api.post("/api/installer/quotations", payload);
export const fetchQuotation = (id) =>
  api.get(`/api/installer/quotations/${id}`);
export const updateQuotation = (id, payload) =>
  api.put(`/api/installer/quotations/${id}`, payload);

/* ── Profile ── */
export const updateProfile = (payload) =>
  api.put("/api/installer/profile", payload);
export const uploadLogo = (payload) =>
  api.post("/api/installer/profile/logo", payload);

/* ── Leads (claim/convert actions go through Express) ── */
export const claimLead = (id) => api.put(`/api/installer/leads/${id}/claim`);
export const convertLead = (id) =>
  api.put(`/api/installer/leads/${id}/convert`);
