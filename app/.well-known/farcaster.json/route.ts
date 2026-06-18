import { NextResponse } from "next/server";

const appUrl =
  process.env.NEXT_PUBLIC_APP_URL ?? "https://base-pulse-psi.vercel.app";
const iconUrl = process.env.NEXT_PUBLIC_APP_ICON_URL ?? `${appUrl}/window.svg`;
const imageUrl = process.env.NEXT_PUBLIC_APP_IMAGE_URL ?? `${appUrl}/globe.svg`;

export const dynamic = "force-static";

export function GET() {
  return NextResponse.json({
    accountAssociation: {
      header: "eyJmaWQiOjc2OTM2OCwidHlwZSI6ImF1dGgiLCJrZXkiOiIweEU5MWM5RWNiODkzOGE2RDc4Njg5MjM0NTEyN0YzOTJBQmMwRTdjNTIifQ",
      payload: "eyJkb21haW4iOiJiYXNlLXB1bHNlLXBzaS52ZXJjZWwuYXBwIn0",
      signature: "YFyvr+w7aNdL0CEOjZJuCmkbM90SvKgutnSkIJyCyetWC46D8UgsJZdr8K1v1UpXxquSEORNPj4NTbQSzKtfjRw="
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