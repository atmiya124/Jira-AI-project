"use client";

import { useEffect, useRef } from "react";

/**
 * Calls `fetchFn` every `intervalMs` while the tab is visible. Skips the
 * tick (rather than tearing down the interval) when the tab is hidden, and
 * fires an immediate refresh when it becomes visible again so a hidden tab
 * catches up right away instead of waiting for the next tick. Cleans up
 * both the interval and the visibility listener on unmount.
 *
 * Deliberately doesn't manage any data/state itself - `fetchFn` is
 * responsible for fetching and applying whatever it fetches (e.g. via its
 * own setState calls), so this hook stays reusable across pages.
 */
export function usePolling(fetchFn: () => void, intervalMs: number) {
  const fetchFnRef = useRef(fetchFn);

  useEffect(() => {
    fetchFnRef.current = fetchFn;
  }, [fetchFn]);

  useEffect(() => {
    function tick() {
      if (document.visibilityState === "visible") {
        fetchFnRef.current();
      }
    }

    function handleVisibilityChange() {
      if (document.visibilityState === "visible") {
        fetchFnRef.current();
      }
    }

    const id = setInterval(tick, intervalMs);
    document.addEventListener("visibilitychange", handleVisibilityChange);

    return () => {
      clearInterval(id);
      document.removeEventListener("visibilitychange", handleVisibilityChange);
    };
  }, [intervalMs]);
}
