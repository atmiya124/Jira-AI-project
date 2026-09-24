import Link from "next/link";
import type { ActivityItem } from "@/lib/dashboard/queries";

export function RecentActivityList({ items }: { items: ActivityItem[] }) {
  return (
    <div className="flex flex-col gap-3">
      <h2 className="text-sm font-semibold uppercase tracking-wide text-zinc-500">
        Recent Activity
      </h2>
      {items.length === 0 ? (
        <p className="text-sm text-zinc-500">No activity yet.</p>
      ) : (
        <ul className="flex flex-col gap-1.5 text-sm">
          {items.map((item) => (
            <li key={item.id} className="text-zinc-600">
              <span className="font-medium text-zinc-900">{item.ticketKey}</span> → {item.label}
            </li>
          ))}
        </ul>
      )}
      <Link
        href="/history"
        className="text-xs font-medium text-zinc-500 transition-colors hover:text-zinc-900 hover:underline"
      >
        View History →
      </Link>
    </div>
  );
}
