import type { VersionInfo } from "@/lib/db/analysisVersions";

export function TicketVersionLabel({
  ticketKey,
  versionInfo,
}: {
  ticketKey: string;
  versionInfo?: VersionInfo;
}) {
  if (!versionInfo || versionInfo.totalVersions <= 1) {
    return <>{ticketKey}</>;
  }

  return (
    <>
      {ticketKey} <span className="text-zinc-400">·</span> Analysis #{versionInfo.version}
      {versionInfo.isLatest && (
        <>
          {" "}
          <span className="text-zinc-400">·</span>{" "}
          <span className="rounded-full bg-zinc-900 px-2 py-0.5 align-middle text-xs font-medium text-white">
            Latest
          </span>
        </>
      )}
    </>
  );
}
