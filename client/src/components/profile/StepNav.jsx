/**
 * StepNav.jsx — step progress bar matching the mockup:
 * numbered circle + icon + two-line label (title + subtitle) + dashed connector
 */

const STEP_META = {
  1: {
    subtitle: "Choose profile type",
    icon: (
      <svg width="16" height="16" viewBox="0 0 16 16" fill="none">
        <path
          d="M8 2L2 6v8h4v-4h4v4h4V6L8 2z"
          stroke="currentColor"
          strokeWidth="1.4"
          strokeLinejoin="round"
        />
      </svg>
    ),
  },
  2: {
    subtitle: "Add your appliances",
    icon: (
      <svg width="16" height="16" viewBox="0 0 16 16" fill="none">
        <rect
          x="2"
          y="4"
          width="12"
          height="9"
          rx="1.5"
          stroke="currentColor"
          strokeWidth="1.4"
        />
        <path
          d="M5 4V3a1 1 0 011-1h4a1 1 0 011 1v1"
          stroke="currentColor"
          strokeWidth="1.4"
        />
        <path
          d="M8 8v2M7 9h2"
          stroke="currentColor"
          strokeWidth="1.4"
          strokeLinecap="round"
        />
      </svg>
    ),
  },
  3: {
    subtitle: "Tell us how you use energy",
    icon: (
      <svg width="16" height="16" viewBox="0 0 16 16" fill="none">
        <path
          d="M2 12L6 7l3 3 2-4 3 4"
          stroke="currentColor"
          strokeWidth="1.4"
          strokeLinecap="round"
          strokeLinejoin="round"
        />
      </svg>
    ),
  },
  4: {
    subtitle: "Confirm & save",
    icon: (
      <svg width="16" height="16" viewBox="0 0 16 16" fill="none">
        <path
          d="M3 8l3.5 3.5L13 5"
          stroke="currentColor"
          strokeWidth="1.4"
          strokeLinecap="round"
          strokeLinejoin="round"
        />
      </svg>
    ),
  },
};

export function StepNav({ steps, current, canNavigate, onNavigate }) {
  return (
    <nav
      className="flex items-center px-5 sm:px-7 pt-5 pb-4 overflow-x-auto scrollbar-none [&::-webkit-scrollbar]:hidden gap-0"
      aria-label="Profile builder steps"
    >
      {steps.map((step, i) => {
        const done = step.id < current;
        const active = step.id === current;
        const reachable = canNavigate(step.id);
        const meta = STEP_META[step.id] ?? { subtitle: "", icon: null };

        return (
          <div key={step.id} className="flex items-center min-w-0">
            {/* Step button */}
            <button
              className={[
                "flex items-center gap-2.5 bg-transparent border-0 p-0 cursor-pointer transition-all duration-150 min-w-0",
                !reachable && !done && !active
                  ? "opacity-35 cursor-default"
                  : "",
              ]
                .filter(Boolean)
                .join(" ")}
              onClick={() => reachable && onNavigate(step.id)}
              disabled={!reachable && !done && !active}
              aria-current={active ? "step" : undefined}
            >
              {/* Number circle */}
              <span
                className={[
                  "w-7 h-7 rounded-full flex items-center justify-center text-[12px] font-bold shrink-0 transition-all duration-200",
                  active
                    ? "bg-amber-500 text-black shadow-[0_0_0_4px_theme(colors.amber.500/20%)]"
                    : done
                      ? "bg-emerald-500 text-white"
                      : "bg-white border-[1.5px] border-(--border,#e5e7eb) text-(--text-muted,#9ca3af)",
                ].join(" ")}
              >
                {done ? (
                  <svg
                    width="12"
                    height="12"
                    viewBox="0 0 12 12"
                    fill="none"
                    aria-hidden
                  >
                    <path
                      d="M2.5 6l2.5 2.5L9.5 4"
                      stroke="white"
                      strokeWidth="1.75"
                      strokeLinecap="round"
                      strokeLinejoin="round"
                    />
                  </svg>
                ) : (
                  step.id
                )}
              </span>

              {/* Icon + two-line label */}
              <div className="flex items-center gap-1.5 min-w-0">
                <span
                  className={[
                    "shrink-0 transition-colors duration-150",
                    active
                      ? "text-amber-500"
                      : done
                        ? "text-emerald-500"
                        : "text-(--text-muted,#9ca3af)",
                  ].join(" ")}
                >
                  {meta.icon}
                </span>
                <div className="flex flex-col min-w-0">
                  <span
                    className={[
                      "text-[12.5px] font-semibold leading-tight whitespace-nowrap transition-colors duration-150",
                      active
                        ? "text-(--text-primary,#111)"
                        : done
                          ? "text-(--text-secondary,#6b7280)"
                          : "text-(--text-muted,#9ca3af)",
                    ].join(" ")}
                  >
                    {step.label}
                  </span>
                  <span
                    className={[
                      "text-[10.5px] leading-tight whitespace-nowrap transition-colors duration-150 hidden sm:block",
                      active
                        ? "text-(--text-secondary,#6b7280)"
                        : "text-(--text-muted,#9ca3af)",
                    ].join(" ")}
                  >
                    {meta.subtitle}
                  </span>
                </div>
              </div>
            </button>

            {/* Connector — dashed line outside button */}
            {i < steps.length - 1 && (
              <div className="flex items-center mx-3 shrink-0" aria-hidden>
                <div
                  className={[
                    "w-10 h-px",
                    done
                      ? "bg-linear-to-r from-emerald-400/60 to-(--border,#e5e7eb)"
                      : "border-t border-dashed border-(--border,#e5e7eb)",
                  ].join(" ")}
                />
              </div>
            )}
          </div>
        );
      })}
    </nav>
  );
}
