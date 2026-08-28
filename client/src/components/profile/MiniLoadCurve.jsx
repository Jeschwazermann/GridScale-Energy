/**
 * MiniLoadCurve.jsx
 * Reusable 24-bar chart showing kWh per hour.
 * Fully Tailwind — no external CSS classes required.
 *
 * Props:
 *   curve         {number[]}  24-element array of kWh values
 *   height        {number}    chart height in px (default 48)
 *   showLabels    {boolean}   show hour labels (0h, 6h, 12h, 18h, 23h)
 *   highlightPeak {boolean}   amber-highlight the peak hour
 */

export function MiniLoadCurve({
  curve = [],
  height = 48,
  showLabels = false,
  highlightPeak = true,
}) {
  if (!curve || curve.length !== 24) return null;

  const max = Math.max(...curve, 0.001);
  const peakH = curve.indexOf(max);

  return (
    <div
      className="relative w-full select-none"
      style={{ height: showLabels ? `${height + 16}px` : `${height}px` }}
      aria-hidden
    >
      {/* Bars */}
      <div
        className="absolute inset-x-0 top-0 flex items-end gap-px"
        style={{ height: `${height}px` }}
      >
        {curve.map((val, h) => {
          const pct = (val / max) * 100;
          const isPeak = highlightPeak && h === peakH && val > 0;
          const isEvening = h >= 18 && h <= 22 && !isPeak;

          return (
            <div
              key={h}
              className="flex-1 rounded-t-[1px] transition-all duration-300"
              style={{ height: `${Math.max(pct, val > 0 ? 4 : 0)}%` }}
              title={`${h}:00 — ${val.toFixed(3)} kWh`}
            >
              <div
                className={[
                  "w-full h-full rounded-t-[1px]",
                  isPeak
                    ? "bg-amber-500"
                    : isEvening
                      ? "bg-emerald-400"
                      : val > 0
                        ? "bg-emerald-300"
                        : "bg-(--border,#e5e7eb)",
                ].join(" ")}
              />
            </div>
          );
        })}
      </div>

      {/* Hour labels */}
      {showLabels && (
        <div
          className="absolute inset-x-0 flex"
          style={{ top: `${height + 3}px` }}
        >
          {[0, 6, 12, 18, 23].map((h) => (
            <span
              key={h}
              className="absolute text-[9px] text-(--text-muted,#9ca3af) tabular-nums -translate-x-1/2"
              style={{ left: `${(h / 23) * 100}%` }}
            >
              {h}h
            </span>
          ))}
        </div>
      )}
    </div>
  );
}
