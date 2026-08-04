import { useState, useEffect, useRef, useCallback } from "react";
import { computeCashflow, computeScenarios } from "../services/installerApi";

export function useCashflow(assessmentId, frozenResult = null) {
  const [projection, setProjection] = useState(frozenResult ?? null);
  const [scenarios, setScenarios] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  const fetchIdRef = useRef(0);

  const compute = useCallback(
    async (financing = null, { persist = true } = {}) => {
      if (!assessmentId) return;

      const fetchId = ++fetchIdRef.current;

      setLoading(true);
      setError(null);

      try {
        const [projRes, scenRes] = await Promise.allSettled([
          computeCashflow(assessmentId, { financing, persist }),
          computeScenarios(assessmentId, {}),
        ]);

        if (fetchId !== fetchIdRef.current) return;

        if (projRes.status === "rejected") {
          throw new Error(
            projRes.reason?.response?.data?.error ||
              projRes.reason?.message ||
              "Projection failed",
          );
        }

        setProjection(projRes.value.data.projection);

        if (scenRes.status === "fulfilled") {
          setScenarios(scenRes.value.data.scenarios);
        }
        // scenarios failure is non-fatal — just leave as null
      } catch (err) {
        if (fetchId === fetchIdRef.current) {
          setError(err.message);
        }
      } finally {
        if (fetchId === fetchIdRef.current) {
          setLoading(false);
        }
      }
    },
    [assessmentId],
  );

  useEffect(() => {
    if (!assessmentId) return;

    let cancelled = false;

    const run = async () => {
      if (frozenResult) {
        // projection already seeded — just fetch scenarios
        try {
          const res = await computeScenarios(assessmentId, {});
          if (!cancelled) setScenarios(res.data.scenarios);
        } catch {
          // non-fatal
        }
      } else {
        if (!cancelled) await compute();
      }
    };

    run();

    return () => {
      cancelled = true;
    };
  }, [assessmentId]); // eslint-disable-line react-hooks/exhaustive-deps

  return { projection, scenarios, loading, error, recompute: compute };
}
