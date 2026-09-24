import type { ReactNode } from "react";

export function SetupStep({
  number,
  title,
  description,
  children,
}: {
  number: number;
  title: string;
  description: string;
  children: ReactNode;
}) {
  return (
    <div className="flex gap-4">
      <div className="flex size-8 shrink-0 items-center justify-center rounded-full bg-zinc-100 text-sm font-medium text-zinc-600">
        {number}
      </div>
      <div className="flex flex-1 flex-col gap-3">
        <div>
          <h3 className="text-lg font-semibold text-zinc-900">{title}</h3>
          <p className="mt-1 text-sm text-zinc-600">{description}</p>
        </div>
        {children}
      </div>
    </div>
  );
}
