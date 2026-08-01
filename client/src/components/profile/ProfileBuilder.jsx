/**
 * Multi-step consumption profile capture form.
 * Steps: 1 Profile type → 2 Appliances → 3 Usage pattern → 4 Review & save
 *
 * Props:
 *   customerId   {string}   required — customer this profile belongs to
 *   profileId    {string}   optional — if provided, loads existing profile for editing
 *   onSave       {fn}       called with { profile, appliances, loadCurve } on success
 *   onCancel     {fn}       called when user dismisses without saving
 */

import { useState, useEffect, useCallback, useRef, useMemo } from "react";
import { StepNav } from "./StepNav.jsx";
import { StepType } from "./StepType.jsx";
import { StepAppliances } from "./StepAppliances.jsx";
import { StepUsage } from "./StepUsage.jsx";
import { StepReview } from "./StepReview.jsx";
import { buildLoadCurveClient } from "../../utils/loadCurve.js";
import { STEPS, DEFAULT_USAGE } from "../../constants/profileBuild.js";

export function ProfileBuilder({ customerId, profileId, onSave, onCancel }) {
  const [step, setStep] = useState(1);
  const [profileType, setProfileType] = useState(null);
  const [appliances, setAppliances] = useState([]);
  const [usage, setUsage] = useState(DEFAULT_USAGE);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState(null);
  // Initialise to true when a profileId is present so the very first render
  // already shows the spinner — no synchronous setState inside the effect needed.
  const [loadingEdit, setLoadingEdit] = useState(!!profileId);

  // Tracks which profile type's templates are already in `appliances` so we
  // don't clobber them if the user goes back to Step 1 and re-selects the
  // same type, and so we don't clobber an in-flight edit load either.
  const loadedTypeRef = useRef(null);
  // True while the edit-load effect is still running; prevents handleTypeSelect
  // from overwriting appliances with templates before the real data arrives.
  const editLoadingRef = useRef(false);

  // -------------------------------------------------------------------
  // Edit mode: load existing profile
  // -------------------------------------------------------------------
  useEffect(() => {
    if (!profileId) return;
    let cancelled = false;

    editLoadingRef.current = true;

    (async () => {
      try {
        const res = await fetch(`/api/profiles/${profileId}`);
        if (!res.ok) throw new Error("Failed to load profile");
        const data = await res.json();

        if (cancelled) return;

        const p = data.profile;

        // Stamp the ref before calling setters so handleTypeSelect sees it
        // immediately and skips the template fetch if the user is fast.
        loadedTypeRef.current = p.profile_type;

        setProfileType(p.profile_type);

        setAppliances(
          (data.appliances || []).map((a) => ({
            ...a,
            active_hours: Array.isArray(a.active_hours)
              ? a.active_hours
              : a.active_hours
                ? JSON.parse(a.active_hours)
                : null,
          })),
        );

        setUsage({
          gridHoursWeekday: p.grid_hours_weekday ?? 6,
          gridHoursWeekend: p.grid_hours_weekend ?? 4,
          isWeekendDifferent: p.is_weekend_different ?? false,
          peakPeriod: p.peak_period ?? "evening",
          hasCriticalLoads: p.has_critical_loads ?? false,
          generatorHoursDay: p.generator_hours_day ?? "",
          generatorFuelLitres: p.generator_fuel_litres_month ?? "",
          generatorFuelSpend: p.generator_fuel_spend_month ?? "",
          notes: p.notes ?? "",
        });
      } catch (err) {
        if (!cancelled) setError(err.message);
      } finally {
        if (!cancelled) {
          editLoadingRef.current = false;
          setLoadingEdit(false);
        }
      }
    })();

    return () => {
      cancelled = true;
      editLoadingRef.current = false;
    };
  }, [profileId]);

  // -------------------------------------------------------------------
  // Derive load curve from appliances.
  // useMemo avoids a second render cycle (setState → re-render) and
  // prevents the old effect pattern from creating a new array reference
  // on every render and re-triggering itself.
  // -------------------------------------------------------------------
  const loadCurve = useMemo(
    () => buildLoadCurveClient(appliances),
    [appliances],
  );

  // -------------------------------------------------------------------
  // Step 1 → 2: fetch appliance templates for selected type
  // -------------------------------------------------------------------
  const handleTypeSelect = useCallback(async (type) => {
    setProfileType(type);
    setError(null);

    // Don't overwrite appliances that are still being loaded from the server,
    // or that are already correct for this type.
    if (editLoadingRef.current || loadedTypeRef.current === type) return;

    try {
      const res = await fetch(`/api/profiles/templates/${type}`);
      if (!res.ok) throw new Error("Could not load appliance templates");
      const data = await res.json();

      // Re-check after the await in case the edit-load effect resolved while
      // we were waiting and already populated appliances with real data.
      if (editLoadingRef.current || loadedTypeRef.current === type) return;

      setAppliances(
        (data.templates || []).map((t, i) => ({
          appliance_name: t.appliance_name,
          quantity: 1,
          watts: Number(t.watts),
          hours_weekday: Number(t.hours_weekday),
          hours_weekend: Number(t.hours_weekend),
          is_critical: t.is_critical,
          load_factor: Number(t.load_factor),
          active_hours: t.active_hours
            ? Array.isArray(t.active_hours)
              ? t.active_hours
              : JSON.parse(t.active_hours)
            : null,
          sort_order: i,
        })),
      );
      loadedTypeRef.current = type;
    } catch (err) {
      setError(err.message);
    }
  }, []);

  // -------------------------------------------------------------------
  // Save
  // -------------------------------------------------------------------
  const handleSave = useCallback(async () => {
    setSaving(true);
    setError(null);

    const body = {
      profile: {
        customer_id: customerId,
        profile_type: profileType,
        grid_hours_weekday: Number(usage.gridHoursWeekday),
        grid_hours_weekend: Number(usage.gridHoursWeekend),
        is_weekend_different: usage.isWeekendDifferent,
        peak_period: usage.peakPeriod,
        has_critical_loads: appliances.some((a) => a.is_critical),
        generator_hours_day:
          usage.generatorHoursDay !== ""
            ? Number(usage.generatorHoursDay)
            : null,
        generator_fuel_litres_month:
          usage.generatorFuelLitres !== ""
            ? Number(usage.generatorFuelLitres)
            : null,
        generator_fuel_spend_month:
          usage.generatorFuelSpend !== ""
            ? Number(usage.generatorFuelSpend)
            : null,
        notes: usage.notes || null,
      },
      appliances: appliances.map((a, i) => ({
        appliance_name: a.appliance_name,
        quantity: Number(a.quantity),
        watts: Number(a.watts),
        hours_weekday: Number(a.hours_weekday),
        hours_weekend: Number(a.hours_weekend),
        is_critical: a.is_critical,
        load_factor: Number(a.load_factor),
        active_hours: a.active_hours ?? null,
        sort_order: i,
      })),
    };

    try {
      let result;

      if (profileId) {
        // Edit: update profile header and appliances in parallel
        const [pRes, aRes] = await Promise.all([
          fetch(`/api/profiles/${profileId}`, {
            method: "PATCH",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ profile: body.profile }),
          }),
          fetch(`/api/profiles/${profileId}/appliances`, {
            method: "PUT",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ appliances: body.appliances }),
          }),
        ]);
        if (!pRes.ok || !aRes.ok) throw new Error("Failed to update profile");
        result = await pRes.json();
      } else {
        // Create: single POST with full body
        const res = await fetch("/api/profiles", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(body),
        });
        if (!res.ok) {
          const err = await res.json().catch(() => ({}));
          throw new Error(err.message || "Failed to save profile");
        }
        result = await res.json();
      }

      onSave?.({ ...result, loadCurve });
    } catch (err) {
      setError(err.message);
    } finally {
      setSaving(false);
    }
  }, [
    customerId,
    profileId,
    profileType,
    appliances,
    usage,
    loadCurve,
    onSave,
  ]);

  // -------------------------------------------------------------------
  // Step validation — what's needed to proceed
  // -------------------------------------------------------------------
  const canProceed = useCallback(
    (fromStep) => {
      if (fromStep === 1) return !!profileType;
      if (fromStep === 2) return appliances.length > 0;
      if (fromStep === 3)
        return (
          usage.gridHoursWeekday !== "" &&
          usage.gridHoursWeekend !== "" &&
          Number(usage.gridHoursWeekday) >= 0 &&
          Number(usage.gridHoursWeekend) >= 0
        );
      return true;
    },
    [profileType, appliances, usage],
  );

  // -------------------------------------------------------------------
  // Derived summary stats for Step 4
  // -------------------------------------------------------------------
  const summary = useMemo(() => {
    const totalWeekday = appliances.reduce(
      (acc, a) =>
        acc +
        (a.quantity * a.watts * (a.load_factor ?? 1) * a.hours_weekday) / 1000,
      0,
    );
    const totalWeekend = appliances.reduce(
      (acc, a) =>
        acc +
        (a.quantity * a.watts * (a.load_factor ?? 1) * a.hours_weekend) / 1000,
      0,
    );
    const peakW = appliances.reduce((acc, a) => acc + a.quantity * a.watts, 0);
    const criticalW = appliances
      .filter((a) => a.is_critical)
      .reduce((acc, a) => acc + a.quantity * a.watts * (a.load_factor ?? 1), 0);
    const criticalItems = appliances
      .filter((a) => a.is_critical)
      .map((a) => a.appliance_name);

    return {
      totalWeekday: totalWeekday.toFixed(2),
      totalWeekend: totalWeekend.toFixed(2),
      peakW: Math.round(peakW),
      criticalW: Math.round(criticalW),
      criticalItems,
    };
  }, [appliances]);

  // -------------------------------------------------------------------
  // Render
  // -------------------------------------------------------------------
  if (loadingEdit) {
    return (
      <div className="flex items-center gap-2.5 py-8 px-6 text-(--text-secondary) text-sm">
        <div className="inline-block w-5 h-5 rounded-full border-2 border-transparent border-t-current animate-[spin_0.65s_linear_infinite] motion-reduce:animate-none motion-reduce:border-current" />
        <span>Loading profile…</span>
      </div>
    );
  }

  return (
    <div className="flex flex-col max-w-215 mx-auto pb-8">
      <StepNav
        steps={STEPS}
        current={step}
        canNavigate={(s) => s < step || (s === step + 1 && canProceed(step))}
        onNavigate={setStep}
      />

      {error && (
        <div
          className="flex items-center justify-between gap-3 mx-6 mb-4 py-2.5 px-3.5 rounded-lg bg-(--bg-danger,#fef2f2) border-[0.5px] border-(--border-danger,#fca5a5) text-[13px] text-(--text-danger,#dc2626)"
          role="alert"
        >
          <span>⚠ {error}</span>
          <button
            className="text-xs text-(--text-danger) bg-transparent border-0 cursor-pointer underline shrink-0"
            onClick={() => setError(null)}
          >
            Dismiss
          </button>
        </div>
      )}

      <div className="px-4 sm:px-6">
        {step === 1 && (
          <StepType
            selected={profileType}
            onSelect={handleTypeSelect}
            onNext={() => setStep(2)}
          />
        )}

        {step === 2 && (
          <StepAppliances
            appliances={appliances}
            loadCurve={loadCurve}
            onChange={setAppliances}
            onBack={() => setStep(1)}
            onNext={() => setStep(3)}
          />
        )}

        {step === 3 && (
          <StepUsage
            usage={usage}
            onChange={setUsage}
            onBack={() => setStep(2)}
            onNext={() => setStep(4)}
          />
        )}

        {step === 4 && (
          <StepReview
            profileType={profileType}
            appliances={appliances}
            usage={usage}
            loadCurve={loadCurve}
            summary={summary}
            saving={saving}
            isEdit={!!profileId}
            onBack={() => setStep(3)}
            onSave={handleSave}
            onCancel={onCancel}
          />
        )}
      </div>
    </div>
  );
}
