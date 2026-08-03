import { useState, useEffect, useRef, useCallback } from "react";

export function useCashflow(assessmentId, frozenResult = null) {
  const [projection, setProjection] = useState(frozenResult ?? null);
  const [scenarios, setScenarios] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  const fetchIdRef = useRef(0);

  const compute = useCallback(
    async (financing = null, { persist = true } = {}) => {
      if (!assessmentId) return;

      let cancelled = false;
      const fetchId = ++fetchIdRef.current;

      setLoading(true);
      setError(null);

      try {
        const [projRes, scenRes] = await Promise.all([
          fetch(`/api/cashflow/assessment/${assessmentId}`, {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ financing, persist }),
          }),
          fetch(`/api/cashflow/scenarios/${assessmentId}`, {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({}),
          }),
        ]);

        if (cancelled || fetchId !== fetchIdRef.current) return;

        if (!projRes.ok) {
          const err = await projRes.json().catch(() => ({}));
          throw new Error(err.error || `Projection failed (${projRes.status})`);
        }

        const { projection: proj } = await projRes.json();
        setProjection(proj);

        if (scenRes.ok) {
          const { scenarios: sc } = await scenRes.json();
          setScenarios(sc);
        }
      } catch (err) {
        if (!cancelled && fetchId === fetchIdRef.current) {
          setError(err.message);
        }
      } finally {
        if (!cancelled && fetchId === fetchIdRef.current) {
          setLoading(false);
        }
      }

      return () => {
        cancelled = true;
      };
    },
    [assessmentId],
  );

  useEffect(() => {
    if (!assessmentId) return;

    let cancelled = false;

    const run = async () => {
      if (frozenResult) {
        // projection already seeded via useState — just fetch scenarios
        try {
          const r = await fetch(`/api/cashflow/scenarios/${assessmentId}`, {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({}),
          });
          if (!cancelled && r.ok) {
            const data = await r.json();
            if (!cancelled) setScenarios(data.scenarios);
          }
        } catch {
          // scenarios are non-fatal
        }
      } else {
        await compute();
      }
    };

    run();

    return () => {
      cancelled = true;
    };
  }, [assessmentId]); // eslint-disable-line react-hooks/exhaustive-deps

  return { projection, scenarios, loading, error, recompute: compute };
}
