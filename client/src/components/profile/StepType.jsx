/**
 * StepType.jsx — Step 1 card grid matching the mockup:
 * Large illustration, bold label, subtitle, hint pills, green selected state.
 */

const SEGMENTS = [
  {
    id: "residential",
    label: "Residential",
    desc: "Family home",
    emoji: "🏠",
    illustration: "🏡",
    hints: ["Fridge, fans, lights, TV"],
  },
  {
    id: "sme_office",
    label: "SME — Office",
    desc: "Small & medium office",
    illustration: "🖥️",
    hints: ["Computers, AC, lights", "Laptops, router, AC unit"],
  },
  {
    id: "sme_retail",
    label: "SME — Retail",
    desc: "Shop or market stall",
    illustration: "🏪",
    hints: ["Display fridge, POS, CCTV"],
  },
  {
    id: "cold_room",
    label: "Cold Room",
    desc: "Continuous 24h compressor load",
    illustration: "🧊",
    hints: ["Compressors, condenser fans"],
  },
  {
    id: "clinic",
    label: "Clinic",
    desc: "Medical facility",
    illustration: "🏥",
    hints: ["Suction, vaccine fridge, lights"],
  },
  {
    id: "worship_centre",
    label: "Worship Centre",
    desc: "Intermittent heavy load",
    illustration: "⛪",
    hints: ["PA system, projector, AC"],
  },
];

export function StepType({ selected, onSelect, onNext }) {
  return (
    <div className="flex flex-col gap-6">
      {/* Header row */}
      <div className="flex items-start justify-between gap-4 pt-1">
        <div>
          <h2 className="text-[20px] font-bold text-[var(--text-primary,#111)] tracking-[-0.02em] mb-1">
            What type of customer is this?
          </h2>
          {/* Amber underline accent */}
          <div className="w-8 h-[3px] rounded-full bg-amber-500 mb-2" />
          <p className="text-[13px] text-[var(--text-secondary,#6b7280)] leading-relaxed max-w-md">
            Choosing a type pre-fills typical appliances. You can edit
            everything on the next step.
          </p>
        </div>

        {/* Tip callout */}
        <div className="hidden sm:flex items-start gap-2.5 bg-amber-50 border border-amber-200 rounded-xl px-3.5 py-3 shrink-0 max-w-[210px]">
          <span className="text-amber-500 mt-0.5 shrink-0">
            <svg width="16" height="16" viewBox="0 0 16 16" fill="none">
              <path
                d="M8 1a4 4 0 100 8A4 4 0 008 1zM8 10v2M8 13.5v.5"
                stroke="#f59e0b"
                strokeWidth="1.4"
                strokeLinecap="round"
              />
              <circle cx="8" cy="13.75" r=".5" fill="#f59e0b" />
            </svg>
          </span>
          <div>
            <p className="text-[12px] font-semibold text-amber-700 leading-tight">
              You can customise everything
            </p>
            <p className="text-[11px] text-amber-600/80 leading-snug mt-0.5">
              Don't worry, you can edit later.
            </p>
          </div>
        </div>
      </div>

      {/* Card grid */}
      <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
        {SEGMENTS.map((seg) => {
          const isSelected = selected === seg.id;
          return (
            <button
              key={seg.id}
              className={[
                "relative flex flex-col items-center gap-2 pt-6 pb-4 px-3 rounded-2xl border text-center cursor-pointer transition-all duration-200 overflow-hidden group",
                isSelected
                  ? "border-emerald-500 bg-white shadow-[0_0_0_3px_theme(colors.emerald.500/15%)]"
                  : "border-[var(--border,#e5e7eb)] bg-white hover:border-[var(--border-strong,#d1d5db)] hover:shadow-sm",
              ].join(" ")}
              onClick={() => onSelect(seg.id)}
              aria-pressed={isSelected}
            >
              {/* Selected checkmark badge */}
              {isSelected && (
                <span className="absolute top-2.5 right-2.5 w-5 h-5 bg-emerald-500 rounded-full flex items-center justify-center shadow-sm">
                  <svg
                    width="10"
                    height="10"
                    viewBox="0 0 10 10"
                    fill="none"
                    aria-hidden
                  >
                    <path
                      d="M2 5l2 2.5L8 3"
                      stroke="white"
                      strokeWidth="1.75"
                      strokeLinecap="round"
                      strokeLinejoin="round"
                    />
                  </svg>
                </span>
              )}

              {/* Illustration */}
              <div
                className={[
                  "w-16 h-16 rounded-2xl flex items-center justify-center text-4xl transition-transform duration-200 group-hover:scale-105",
                  isSelected
                    ? "bg-emerald-50"
                    : "bg-[var(--surface-2,#f9fafb)]",
                ].join(" ")}
              >
                {seg.illustration}
              </div>

              {/* Label */}
              <div className="flex flex-col gap-0.5 min-w-0 w-full">
                <span
                  className={[
                    "text-[13.5px] font-semibold leading-tight",
                    isSelected
                      ? "text-emerald-700"
                      : "text-[var(--text-primary,#111)]",
                  ].join(" ")}
                >
                  {seg.label}
                </span>
                <span className="text-[11.5px] text-[var(--text-secondary,#6b7280)] leading-tight">
                  {seg.desc}
                </span>
              </div>

              {/* Hint pills */}
              {seg.hints && seg.hints.length > 0 && (
                <div className="flex flex-wrap items-center justify-center gap-1 mt-1">
                  {seg.hints.map((hint) => (
                    <span
                      key={hint}
                      className={[
                        "text-[10.5px] px-2 py-0.5 rounded-full border leading-tight",
                        isSelected
                          ? "bg-emerald-50 border-emerald-200 text-emerald-700"
                          : "bg-[var(--surface-2,#f3f4f6)] border-[var(--border,#e5e7eb)] text-[var(--text-muted,#9ca3af)]",
                      ].join(" ")}
                    >
                      {hint}
                    </span>
                  ))}
                </div>
              )}

              {/* Selected: green gradient wash at bottom */}
              {isSelected && (
                <div
                  className="absolute inset-x-0 bottom-0 h-12 pointer-events-none"
                  style={{
                    background:
                      "linear-gradient(to top, rgba(16,185,129,0.06), transparent)",
                  }}
                />
              )}
            </button>
          );
        })}
      </div>

      {/* Bottom bar */}
      <div className="flex items-center justify-between gap-3 pt-3 border-t border-[var(--border,#e5e7eb)]">
        {/* Trust signal */}
        <div className="flex items-center gap-2 text-[var(--text-muted,#9ca3af)]">
          <svg
            width="14"
            height="14"
            viewBox="0 0 14 14"
            fill="none"
            aria-hidden
          >
            <path
              d="M7 1.5L2 3.5v4c0 3 2.5 5 5 5s5-2 5-5v-4L7 1.5z"
              stroke="currentColor"
              strokeWidth="1.3"
              strokeLinejoin="round"
            />
            <path
              d="M4.5 7l1.5 1.5L9.5 5.5"
              stroke="currentColor"
              strokeWidth="1.3"
              strokeLinecap="round"
              strokeLinejoin="round"
            />
          </svg>
          <div>
            <p className="text-[11.5px] font-medium text-[var(--text-secondary,#6b7280)] leading-tight">
              Secure &amp; private
            </p>
            <p className="text-[10.5px] text-[var(--text-muted,#9ca3af)] leading-tight">
              Your data is protected
            </p>
          </div>
        </div>

        {/* CTA */}
        <button
          className="flex items-center gap-2 py-2.5 px-5 bg-amber-500 text-black rounded-xl text-[13.5px] font-semibold cursor-pointer transition-all duration-150 enabled:hover:bg-amber-600 disabled:opacity-40 disabled:cursor-not-allowed shadow-sm"
          onClick={onNext}
          disabled={!selected}
        >
          Next — Appliances
          <svg
            width="14"
            height="14"
            viewBox="0 0 14 14"
            fill="none"
            aria-hidden
          >
            <path
              d="M3 7h8M8 4l3 3-3 3"
              stroke="currentColor"
              strokeWidth="1.5"
              strokeLinecap="round"
              strokeLinejoin="round"
            />
          </svg>
        </button>
      </div>
    </div>
  );
}
