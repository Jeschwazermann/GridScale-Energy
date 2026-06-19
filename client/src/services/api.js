import axios from "axios";

const api = axios.create({
  baseURL: import.meta.env.VITE_API_URL,
  headers: { "Content-Type": "application/json" },
});

export async function calculate(payload) {
  try {
    const { data } = await api.post("/api/calculate", payload);
    return data;
  } catch (err) {
    const message = err.response?.data?.error || "Calculation failed";
    throw new Error(message, { cause: err });
  }
}
