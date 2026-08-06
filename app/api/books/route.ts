import ImageKit from "imagekit";
import { NextResponse } from "next/server";
import { auth } from "@clerk/nextjs/server";

export async function GET() {
  const { userId } = auth();
  if (!userId) {
    return NextResponse.json({ files: [] });
  }

  const imagekit = new ImageKit({
    publicKey: process.env.NEXT_PUBLIC_IMAGEKIT_PUBLIC_KEY!,
    privateKey: process.env.IMAGEKIT_PRIVATE_KEY!,
    urlEndpoint: process.env.NEXT_PUBLIC_IMAGEKIT_URL_ENDPOINT!
  });

  try {
    const files = await imagekit.listFiles({
      path: `/vocal_reader/${userId}/`,
    });
    return NextResponse.json({ files });
  } catch (e) {
    console.error("Error fetching ImageKit files:", e);
    return NextResponse.json({ files: [] });
  }
}
