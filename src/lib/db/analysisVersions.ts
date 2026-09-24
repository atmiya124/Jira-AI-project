import { prisma } from "./prisma";

export type VersionInfo = {
  version: number;
  totalVersions: number;
  isLatest: boolean;
};

export async function getVersionInfo(
  ticketKey: string,
  createdAt: Date,
): Promise<VersionInfo> {
  const [version, laterCount] = await Promise.all([
    prisma.analysis.count({ where: { ticketKey, createdAt: { lte: createdAt } } }),
    prisma.analysis.count({ where: { ticketKey, createdAt: { gt: createdAt } } }),
  ]);

  return { version, totalVersions: version + laterCount, isLatest: laterCount === 0 };
}

export async function buildVersionInfoMap(): Promise<Map<string, VersionInfo>> {
  const rows = await prisma.analysis.findMany({
    select: { id: true, ticketKey: true, createdAt: true },
    orderBy: { createdAt: "asc" },
  });

  const byTicket = new Map<string, typeof rows>();
  for (const row of rows) {
    const list = byTicket.get(row.ticketKey) ?? [];
    list.push(row);
    byTicket.set(row.ticketKey, list);
  }

  const result = new Map<string, VersionInfo>();
  for (const ticketRows of byTicket.values()) {
    ticketRows.forEach((row, i) => {
      result.set(row.id, {
        version: i + 1,
        totalVersions: ticketRows.length,
        isLatest: i === ticketRows.length - 1,
      });
    });
  }
  return result;
}
