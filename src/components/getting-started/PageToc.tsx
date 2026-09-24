"use client";

import { useEffect, useState } from "react";

const SECTIONS = [
  { id: "introduction", label: "Introduction" },
  { id: "what-can-you-do", label: "What can you do?" },
  { id: "setup", label: "Set up your first project" },
  { id: "try-it", label: "Try it with a real ticket" },
];

export function PageToc() {
  const [activeId, setActiveId] = useState(SECTIONS[0].id);

  useEffect(() => {
    const observer = new IntersectionObserver(
      (entries) => {
        for (const entry of entries) {
          if (entry.isIntersecting) {
            setActiveId(entry.target.id);
          }
        }
      },
      { rootMargin: "-20% 0px -70% 0px" },
    );

    for (const section of SECTIONS) {
      const el = document.getElementById(section.id);
      if (el) observer.observe(el);
    }

    return () => observer.disconnect();
  }, []);

  return (
    <nav className="flex flex-col gap-1 text-sm">
      <p className="mb-1 text-xs font-semibold uppercase tracking-wide text-zinc-400">
        On this page
      </p>
      {SECTIONS.map((section) => (
        <a
          key={section.id}
          href={`#${section.id}`}
          className={`border-l-2 py-1 pl-3 transition-colors ${
            activeId === section.id
              ? "border-orange-500 font-medium text-orange-600"
              : "border-transparent text-zinc-500 hover:text-zinc-800"
          }`}
        >
          {section.label}
        </a>
      ))}
    </nav>
  );
}
