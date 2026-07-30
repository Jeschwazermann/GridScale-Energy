/**
 * ProfileBuilder.jsx
 * GridScale Africa
 *
 * Multi-step consumption profile capture form.
 * Steps: 1 Profile type → 2 Appliances → 3 Usage pattern → 4 Review & save
 *
 * Props:
 *   customerId   {string}   required — customer this profile belongs to
 *   profileId    {string}   optional — if provided, loads existing profile for editing
 *   onSave       {fn}       called with { profile, appliances, loadCurve } on success
 *   onCancel     {fn}       called when user dismisses without saving
 */

import { useState, useEffect, useCallback, useRef } from "react";
import { StepNav } from "./StepNav.jsx";
import { StepType } from "./StepType.jsx";
import { StepAppliances } from "./StepAppliances.jsx";
import { StepUsage } from "./StepUsage.jsx";
import { StepReview } from "./StepReview.jsx";
import { buildLoadCurveClient } from "../../utils/loadCurve.js";

// ---------------------------------------------------------------------------
// Constants
// ---------------------------------------------------------------------------

export const STEPS = [
  { id: 1, label: "Customer type" },
  { id: 2, label: "Appliances" },
  { id: 3, label: "Usage pattern" },
  { id: 4, label: "Review" },
];

const DEFAULT_USAGE = {
  gridHoursWeekday: 6,
  gridHoursWeekend: 4,
  isWeekendDifferent: false,
  peakPeriod: "evening",
  hasCriticalLoads: false,
  generatorHoursDay: "",
  generatorFuelLitres: "",
  generatorFuelSpend: "",
  notes: "",
};

// ---------------------------------------------------------------------------
// ProfileBuilder
// ---------------------------------------------------------------------------

export function ProfileBuilder({ customerId, profileId, onSave, onCancel }) {
  const [step, setStep] = useState(1);
  const [profileType, setProfileType] = useState(null);
  const [appliances, setAppliances] = useState([]);
  const [usage, setUsage] = useState(DEFAULT_USAGE);
  const [loadCurve, setLoadCurve] = useState(new Array(24).fill(0));
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState(null);
  const [loadingEdit, setLoadingEdit] = useState(false);

  // Track whether appliance templates have been loaded for this profile type
  // so we don't reload them if the user goes back to Step 1
  const loadedTypeRef = useRef(null);

  // -------------------------------------------------------------------
  // Edit mode: load existing profile
  // -------------------------------------------------------------------
  useEffect(() => {
    if (!profileId) return;
    let cancelled = false;
    setLoadingEdit(true);

    (async () => {
      try {
        const res = await fetch(`/api/profiles/${profileId}`);
        if (!res.ok) throw new Error("Failed to load profile");
        const data = await res.json();

        if (cancelled) return;

        const p = data.profile;
        setProfileType(p.profile_type);
        loadedTypeRef.current = p.profile_type;

        setAppliances(
          (data.appliances || []).map((a) => ({
            ...a,
            // Ensure active_hours is an array for the UI
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
        if (!cancelled) setLoadingEdit(false);
      }
    })();

    return () => {
      cancelled = true;
    };
  }, [profileId]);

  // -------------------------------------------------------------------
  // Recompute load curve whenever appliances change (client-side preview)
  // -------------------------------------------------------------------
  useEffect(() => {
    setLoadCurve(buildLoadCurveClient(appliances));
  }, [appliances]);

  // -------------------------------------------------------------------
  // Step 1 → 2: fetch appliance templates for selected type
  // -------------------------------------------------------------------
  const handleTypeSelect = useCallback(async (type) => {
    setProfileType(type);
    setError(null);

    // Don't re-fetch if already loaded for this type
    if (loadedTypeRef.current === type) return;

    try {
      const res = await fetch(`/api/profiles/templates/${type}`);
      if (!res.ok) throw new Error("Could not load appliance templates");
      const data = await res.json();

      setAppliances(
        (data.templates || []).map((t, i) => ({
          // No id yet — these are template rows being copied into a new profile
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
      const url = profileId ? `/api/profiles/${profileId}` : "/api/profiles";
      const method = profileId ? "PUT" : "POST";

      // For edits, update profile header then appliances separately
      let result;
      if (profileId) {
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
  const summary = (() => {
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
  })();

  // -------------------------------------------------------------------
  // Render
  // -------------------------------------------------------------------
  if (loadingEdit) {
    return (
      <div className="pb-loading">
        <div className="pb-spinner" />
        <span>Loading profile…</span>
      </div>
    );
  }

  return (
    <div className="pb-root">
      <StepNav
        steps={STEPS}
        current={step}
        canNavigate={(s) => s < step || (s === step + 1 && canProceed(step))}
        onNavigate={setStep}
      />

      {error && (
        <div className="pb-error" role="alert">
          <span>⚠ {error}</span>
          <button onClick={() => setError(null)}>Dismiss</button>
        </div>
      )}

      <div className="pb-body">
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
