const BASE_URL = import.meta.env.VITE_API_URL || "http://localhost:3000";

export async function calculate(payload) {
  const res = await fetch(`${BASE_URL}/api/calculate`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(payload),
  });

  if (!res.ok) {
    const err = await res.json().catch(() => ({ error: "Server error" }));
    throw new Error(err.error || "Calculation failed");
  }

  return res.json();
}
