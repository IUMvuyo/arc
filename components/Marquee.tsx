// A horizontal ticker of raw week fragments streaming past. The material of a
// life, moving. Duplicated once so the loop is seamless; paused for reduced motion.
export function Marquee({ items }: { items: string[] }) {
  if (!items.length) return null;
  const doubled = [...items, ...items];

  return (
    <div
      className="relative flex w-full overflow-hidden border-y border-paper/12 py-5 select-none motion-reduce:overflow-x-auto"
      aria-hidden
    >
      <div className="flex shrink-0 animate-marquee items-center gap-0 whitespace-nowrap motion-reduce:animate-none">
        {doubled.map((item, i) => (
          <span key={i} className="flex items-center">
            <span className="font-mono text-sm text-paper/45">{item}</span>
            <span className="mx-8 text-accent/70">/</span>
          </span>
        ))}
      </div>
    </div>
  );
}
