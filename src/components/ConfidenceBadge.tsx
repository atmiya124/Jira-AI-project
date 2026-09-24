const COLORS: Record<string, string> = {
  high: "bg-green-100 text-green-800",
  medium: "bg-amber-100 text-amber-800",
  low: "bg-red-100 text-red-800",
};

const SIZE_CLASSES = {
  sm: "px-2 py-0.5 text-xs",
  md: "px-3 py-1 text-sm",
};

export function ConfidenceBadge({
  confidence,
  size = "md",
}: {
  confidence: string;
  size?: "sm" | "md";
}) {
  const colorClass = COLORS[confidence] ?? "bg-zinc-100 text-zinc-800";
  const label = confidence.charAt(0).toUpperCase() + confidence.slice(1);

  return (
    <span
      className={`inline-flex items-center gap-1 rounded-full font-medium ${SIZE_CLASSES[size]} ${colorClass}`}
    >
      Confidence: {label}
    </span>
  );
}
