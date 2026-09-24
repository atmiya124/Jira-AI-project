const COLORS: Record<string, string> = {
  Low: "bg-green-100 text-green-800",
  Medium: "bg-amber-100 text-amber-800",
  High: "bg-red-100 text-red-800",
};

const SIZE_CLASSES = {
  sm: "px-2 py-0.5 text-xs",
  md: "px-3 py-1 text-sm",
};

export function ComplexityBadge({
  complexity,
  rationale,
  size = "md",
}: {
  complexity: string;
  rationale?: string;
  size?: "sm" | "md";
}) {
  const colorClass = COLORS[complexity] ?? "bg-zinc-100 text-zinc-800";

  return (
    <span
      className={`inline-flex items-center gap-1 rounded-full font-medium ${SIZE_CLASSES[size]} ${colorClass}`}
      title={rationale}
    >
      Complexity: {complexity}
    </span>
  );
}
