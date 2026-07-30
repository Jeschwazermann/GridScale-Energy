/**
 * Step 1: Customer selects their segment type.
 * Selecting a type triggers an API call to fetch the appliance template.
 */

const SEGMENTS = [
  {
    id: "residential",
    label: "Residential",
    desc: "Family home",
    icon: "🏠",
    hint: "Fridge, fans, lights, TV",
  },
  {
    id: "sme_office",
    label: "SME — Office",
    desc: "Computers, AC, lights",
    icon: "🖥",
    hint: "Laptops, router, AC unit",
  },
  {
    id: "sme_retail",
    label: "SME — Retail",
    desc: "Shop or market stall",
    icon: "🏪",
    hint: "Display fridge, POS, CCTV",
  },
  {
    id: "cold_room",
    label: "Cold Room",
    desc: "Continuous 24h compressor load",
    icon: "🧊",
    hint: "Compressors, condenser fans",
  },
  {
    id: "clinic",
    label: "Clinic",
    desc: "Medical equipment",
    icon: "🏥",
    hint: "Suction, vaccine fridge, lights",
  },
  {
    id: "worship_centre",
    label: "Worship Centre",
    desc: "Intermittent heavy load",
    icon: "⛪",
    hint: "PA system, projector, AC",
  },
];

export function StepType({ selected, onSelect, onNext }) {
  return (
    <div className="pb-step">
      <div className="pb-step-header">
        <h2 className="pb-step-title">What type of customer is this?</h2>
        <p className="pb-step-subtitle">
          Choosing a type pre-fills typical appliances. You can edit everything
          on the next step.
        </p>
      </div>

      <div className="pb-seg-grid">
        {SEGMENTS.map((seg) => (
          <button
            key={seg.id}
            className={`pb-seg-card ${selected === seg.id ? "pb-seg-selected" : ""}`}
            onClick={() => onSelect(seg.id)}
            aria-pressed={selected === seg.id}
          >
            <span className="pb-seg-icon" aria-hidden>
              {seg.icon}
            </span>
            <span className="pb-seg-name">{seg.label}</span>
            <span className="pb-seg-desc">{seg.desc}</span>
            <span className="pb-seg-hint">{seg.hint}</span>
          </button>
        ))}
      </div>

      <div className="pb-actions">
        <button
          className="pb-btn-primary"
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
