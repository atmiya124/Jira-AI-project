import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/db/prisma";

export async function GET(request: NextRequest) {
  const limitParam = request.nextUrl.searchParams.get("limit");
  const cursor = request.nextUrl.searchParams.get("cursor") ?? undefined;
  const limit = Math.min(Math.max(Number(limitParam) || 50, 1), 100);

  const items = await prisma.analysis.findMany({
    take: limit,
    ...(cursor ? { skip: 1, cursor: { id: cursor } } : {}),
    orderBy: { createdAt: "desc" },
    select: {
      id: true,
      ticketKey: true,
      ticketSummary: true,
      estimatedComplexity: true,
      createdAt: true,
      commentPosted: true,
    },
  });

  return NextResponse.json({ items });
}

export async function DELETE() {
  await prisma.analysis.deleteMany({});
  return NextResponse.json({ ok: true });
}
