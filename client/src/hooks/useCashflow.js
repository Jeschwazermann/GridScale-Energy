/**
 * useCashflow.js
 * GridScale Africa
 *
 * Manages cashflow projection state for a given assessment.
 * Follows the same frozen-result pattern as sizing_result:
 *   1. Check if assessment already has cashflow_result frozen
 *   2. If yes, use it — no API call
 *   3. If no, POST to /api/cashflow/assessment/:id to compute + freeze
 *
 * Also fetches scenarios (diesel price sensitivity) in parallel.
 *
 * Usage:
 *   const { projection, scenarios, loading, error, recompute } =
 *     useCashflow(assessmentId, frozenResult);
 *
 *   recompute(financing) — triggers a fresh compute with optional loan params
 */

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

        // Scenarios are non-fatal — don't throw if they fail
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

  // On mount: use frozen result if available, otherwise compute
  useEffect(() => {
    if (frozenResult) {
      setProjection(frozenResult);
      // Still fetch scenarios even if projection is frozen
      fetch(`/api/cashflow/scenarios/${assessmentId}`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({}),
      })
        .then((r) => (r.ok ? r.json() : null))
        .then((data) => data && setScenarios(data.scenarios))
        .catch(() => {});
      return;
    }

    if (assessmentId) {
      compute();
    }
  }, [assessmentId]); // eslint-disable-line react-hooks/exhaustive-deps

  return {
    projection,
    scenarios,
    loading,
    error,
    recompute: compute,
  };
}
