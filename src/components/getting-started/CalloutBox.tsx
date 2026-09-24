import type { ReactNode } from "react";
import { InfoIcon } from "./icons";

export function CalloutBox({ children }: { children: ReactNode }) {
  return (
    <div className="flex items-start gap-2 rounded-lg border border-orange-200 bg-orange-50 px-4 py-3 text-sm text-orange-900">
      <InfoIcon className="mt-0.5 size-4 shrink-0 text-orange-500" />
      <div>{children}</div>
    </div>
  );
}
