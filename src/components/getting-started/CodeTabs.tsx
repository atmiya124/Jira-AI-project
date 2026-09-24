"use client";

import { useState } from "react";

export function CodeTabs({ commands }: { commands: Record<string, string> }) {
  const tabs = Object.keys(commands);
  const [active, setActive] = useState(tabs[0]);
  const [firstWord, ...rest] = commands[active].split(" ");

  return (
    <div className="overflow-hidden rounded-lg border border-zinc-200 bg-white">
      {tabs.length > 1 && (
        <div className="flex gap-4 border-b border-zinc-200 px-4 pt-2">
          {tabs.map((tab) => (
            <button
              key={tab}
              type="button"
              onClick={() => setActive(tab)}
              className={`border-b-2 pb-2 text-sm font-medium transition-colors ${
                active === tab
                  ? "border-zinc-900 text-zinc-900"
                  : "border-transparent text-zinc-400 hover:text-zinc-600"
              }`}
            >
              {tab}
            </button>
          ))}
        </div>
      )}
      <pre className="overflow-x-auto px-4 py-3 text-sm">
        <code className="font-mono">
          <span className="text-pink-600">{firstWord}</span>
          {rest.length > 0 && <span className="text-zinc-700"> {rest.join(" ")}</span>}
        </code>
      </pre>
    </div>
  );
}
