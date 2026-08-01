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
    <div className="flex flex-col gap-5">
      <div className="pt-1">
        <h2 className="text-[17px] font-medium text-(--text-primary) mb-1 tracking-[-0.01em]">
          What type of customer is this?
        </h2>
        <p className="text-[13px] text-(--text-secondary) leading-normal">
          Choosing a type pre-fills typical appliances. You can edit everything
          on the next step.
        </p>
      </div>

      <div className="grid grid-cols-[repeat(auto-fill,minmax(200px,1fr))] gap-2">
        {SEGMENTS.map((seg) => {
          const isSelected = selected === seg.id;
          return (
            <button
              key={seg.id}
              className={`flex flex-col gap-0.75 py-3 px-3.5 bg-(--surface-2) border-[0.5px] rounded-[10px] cursor-pointer text-left transition-[border-color,background-color] duration-120 ${
                isSelected
                  ? "border-amber-500 bg-amber-500/6"
                  : "border-(--border) hover:border-(--border-strong)"
              }`}
              onClick={() => onSelect(seg.id)}
              aria-pressed={isSelected}
            >
              <span className="text-lg mb-1" aria-hidden>
                {seg.icon}
              </span>
              <span
                className={`text-[13px] font-medium ${isSelected ? "text-amber-700" : "text-(--text-primary)"}`}
              >
                {seg.label}
              </span>
              <span className="text-xs text-(--text-secondary)">
                {seg.desc}
              </span>
              <span className="text-[11px] text-(--text-muted) mt-1">
                {seg.hint}
              </span>
            </button>
          );
        })}
      </div>

      <div className="flex items-center justify-between gap-2 pt-2 border-t-[0.5px] border-(--border)">
        <button
          className="flex items-center justify-center sm:justify-start gap-1.75 w-full sm:w-auto py-2 px-4 bg-amber-500 text-black rounded-lg text-[13px] font-medium cursor-pointer transition-colors duration-120 enabled:hover:bg-amber-600 disabled:opacity-45 disabled:cursor-not-allowed"
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
