/**
 * Reusable 24-bar chart showing kWh per hour.
 * Used in StepAppliances (live preview) and StepReview (summary).
 *
 * Props:
 *   curve       {number[]}  24-element array of kWh values
 *   height      {number}    chart height in px (default 48)
 *   showLabels  {boolean}   show hour labels (0h, 6h, 12h, 18h)
 *   highlightPeak {boolean} amber-highlight the peak hour
 */

export function MiniLoadCurve({
  curve = [],
  height = 48,
  showLabels = false,
  highlightPeak = true,
}) {
  if (!curve || curve.length !== 24) return null;

  const max = Math.max(...curve, 0.001); // avoid divide-by-zero
  const peakH = curve.indexOf(max);

  return (
    <div className="mlc-root" style={{ "--mlc-h": `${height}px` }} aria-hidden>
      <div className="mlc-bars">
        {curve.map((val, h) => {
          const pct = (val / max) * 100;
          const isPeak = highlightPeak && h === peakH && val > 0;
          const isEve = h >= 18 && h <= 22; // evening — subtle highlight

          return (
            <div
              key={h}
              className={[
                "mlc-bar",
                isPeak ? "mlc-bar-peak" : "",
                isEve && !isPeak ? "mlc-bar-eve" : "",
              ]
                .filter(Boolean)
                .join(" ")}
              style={{ height: `${pct}%` }}
              title={`${h}:00 — ${val.toFixed(3)} kWh`}
            />
          );
        })}
      </div>

      {showLabels && (
        <div className="mlc-labels">
          {[0, 6, 12, 18, 23].map((h) => (
            <span
              key={h}
              className="mlc-label"
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
