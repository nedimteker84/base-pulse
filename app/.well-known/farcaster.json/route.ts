import { NextResponse } from "next/server";

const appUrl = process.env.NEXT_PUBLIC_APP_URL ?? "http://localhost:3000";
const iconUrl = process.env.NEXT_PUBLIC_APP_ICON_URL ?? `${appUrl}/window.svg`;
const imageUrl = process.env.NEXT_PUBLIC_APP_IMAGE_URL ?? `${appUrl}/globe.svg`;

export const dynamic = "force-static";

export function GET() {
  return NextResponse.json({
    accountAssociation: {
      header: process.env.FARCASTER_ACCOUNT_ASSOCIATION_HEADER ?? "",
      payload: process.env.FARCASTER_ACCOUNT_ASSOCIATION_PAYLOAD ?? "",
      signature: process.env.FARCASTER_ACCOUNT_ASSOCIATION_SIGNATURE ?? "",
    },
    miniapp: {
      version: "1",
      name: "Base Pulse",
      homeUrl: appUrl,
      iconUrl,
      imageUrl,
      buttonTitle: "Open Base Pulse",
      splashImageUrl: iconUrl,
      splashBackgroundColor: "#050816",
    },
  });
}