import { moderatePhoto } from "@/lib/photos/moderation";

export async function POST(request: Request) {
  let input: { action?: unknown; photos?: unknown };
  try {
    input = (await request.json()) as typeof input;
  } catch {
    return Response.json({ error: "Invalid bulk request." }, { status: 400 });
  }
  if (
    (input.action !== "approve" && input.action !== "reject") ||
    !Array.isArray(input.photos) ||
    input.photos.length < 1 ||
    input.photos.length > 24
  )
    return Response.json(
      { error: "Choose up to 24 photographs." },
      { status: 400 },
    );
  const photos = input.photos as Array<{ id?: unknown; revision?: unknown }>;
  if (
    photos.some(
      ({ id, revision }) =>
        typeof id !== "string" ||
        !/^[0-9a-f-]{36}$/.test(id) ||
        !Number.isInteger(revision),
    )
  )
    return Response.json({ error: "Invalid bulk request." }, { status: 400 });
  const results = [];
  for (const photo of photos) {
    try {
      results.push({
        id: photo.id,
        ...(await moderatePhoto(
          photo.id as string,
          input.action,
          photo.revision as number,
        )),
      });
    } catch {
      results.push({ id: photo.id, ok: false, error: "Moderation failed." });
    }
  }
  return Response.json(
    { results },
    { status: results.every((item) => item.ok) ? 200 : 207 },
  );
}
