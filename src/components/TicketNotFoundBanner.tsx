export function TicketNotFoundBanner({
  ticketKey,
  onRetry,
}: {
  ticketKey: string;
  onRetry: () => void;
}) {
  return (
    <div className="flex flex-col items-start gap-2 rounded-md border border-zinc-200 bg-zinc-50 px-4 py-3">
      <p className="text-sm font-semibold text-zinc-900">Ticket not found</p>
      <p className="text-sm text-zinc-600">
        We couldn&apos;t find <span className="font-medium">{ticketKey}</span> in Jira. Check the
        ticket key and try again.
      </p>
      <button
        type="button"
        onClick={onRetry}
        className="rounded-md border border-zinc-300 bg-white px-3 py-1.5 text-sm font-medium text-zinc-900 transition-colors hover:bg-zinc-100"
      >
        Try Again
      </button>
    </div>
  );
}
