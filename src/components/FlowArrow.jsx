const CHEVRONS = [
  { color: "var(--color-terracotta-300)", delay: "0s" },
  { color: "var(--color-terracotta-500)", delay: "0.15s" },
  { color: "var(--color-terracotta-700)", delay: "0.3s" },
];

function ChevronSvg({ vertical }) {
  return (
    <svg width={vertical ? 24 : 40} height={vertical ? 40 : 24} viewBox={vertical ? "0 0 24 40" : "0 0 40 24"} fill="none">
      {CHEVRONS.map((c, i) => {
        const offset = i * 12;
        const d = vertical ? `M4 ${2 + offset} l8 8 l8 -8` : `M${2 + offset} 4 l8 8 -8 8`;
        return (
          <path
            key={i}
            d={d}
            stroke={c.color}
            strokeWidth="3"
            strokeLinecap="round"
            strokeLinejoin="round"
            className={vertical ? "chevron-flow-vertical" : "chevron-flow"}
            style={{ animationDelay: c.delay }}
          />
        );
      })}
    </svg>
  );
}

export default function FlowArrow() {
  return (
    <div aria-hidden="true">
      <div className="flex h-10 items-center justify-center md:hidden">
        <ChevronSvg vertical />
      </div>
      <div className="hidden h-full items-center justify-center md:flex md:w-14">
        <ChevronSvg />
      </div>
    </div>
  );
}
