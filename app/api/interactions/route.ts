import { NextResponse } from "next/server";
import { getTrendingContractInteractions } from "@/lib/baseInteractions";

export const runtime = "nodejs";

export async function GET() {
  try {
    const interactions = await getTrendingContractInteractions();

    return NextResponse.json(
      {
        interactions,
        updatedAt: new Date().toISOString(),
      },
      {
        headers: {
          "Cache-Control": "public, s-maxage=15, stale-while-revalidate=45",
        },
      },
    );
  } catch (error) {
    console.error("Failed to load Base contract interactions", error);

    return NextResponse.json(
      { error: "Failed to load Base contract interactions" },
      { status: 502 },
    );
  }
}