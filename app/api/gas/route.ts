import { NextResponse } from "next/server";
import { getBaseGasSnapshot } from "@/lib/baseGas";

export const runtime = "nodejs";

export async function GET() {
  try {
    const gas = await getBaseGasSnapshot();

    return NextResponse.json(gas, {
      headers: {
        "Cache-Control": "public, s-maxage=15, stale-while-revalidate=45",
      },
    });
  } catch (error) {
    console.error("Failed to load Base gas snapshot", error);

    return NextResponse.json(
      { error: "Failed to load Base gas snapshot" },
      { status: 502 },
    );
  }
}