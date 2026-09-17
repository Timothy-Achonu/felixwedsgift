import { decodeGalleryCursor, getApprovedPhotos } from "@/lib/photos/public";

export async function GET(request: Request) {
  const cursorValue = new URL(request.url).searchParams.get("cursor");
  const cursor = decodeGalleryCursor(cursorValue);
  if (cursorValue && !cursor)
    return Response.json({ error: "Invalid gallery cursor." }, { status: 400 });
  try {
    return Response.json(await getApprovedPhotos(24, cursor));
  } catch {
    return Response.json(
      { error: "The gallery could not be loaded." },
      { status: 503 },
    );
  }
}
