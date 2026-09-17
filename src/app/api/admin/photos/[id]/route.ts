import { getAdminIdentity } from "@/lib/auth/admin";
import { maximumPhotoCaptionLength } from "@/lib/photos/constants";
import {
  invalidatePhotoPages,
  moderatePhoto,
  removePhoto,
} from "@/lib/photos/moderation";
import { createSupabaseServerClient } from "@/lib/supabase/server";

type Context = { params: Promise<{ id: string }> };

export async function PATCH(request: Request, context: Context) {
  const { id } = await context.params;
  let input: {
    action?: unknown;
    expectedRevision?: unknown;
    caption?: unknown;
  };
  try {
    input = (await request.json()) as typeof input;
  } catch {
    return Response.json(
      { error: "Invalid moderation request." },
      { status: 400 },
    );
  }
  if (!/^[0-9a-f-]{36}$/.test(id) || !Number.isInteger(input.expectedRevision))
    return Response.json(
      { error: "Invalid moderation request." },
      { status: 400 },
    );
  if (input.action === "approve" || input.action === "reject") {
    try {
      const result = await moderatePhoto(
        id,
        input.action,
        input.expectedRevision as number,
      );
      return Response.json(result.ok ? result : { error: result.error }, {
        status: result.ok ? 200 : result.status,
      });
    } catch (error) {
      console.error("Photo moderation failed", error);
      return Response.json(
        { error: "The photograph could not be moderated." },
        { status: 502 },
      );
    }
  }
  if (input.action === "caption") {
    if (!(await getAdminIdentity()))
      return Response.json(
        { error: "Admin authorization required." },
        { status: 403 },
      );
    if (
      input.caption !== null &&
      (typeof input.caption !== "string" ||
        input.caption.trim().length > maximumPhotoCaptionLength)
    )
      return Response.json(
        { error: "Caption must be 240 characters or fewer." },
        { status: 400 },
      );
    const supabase = await createSupabaseServerClient();
    const { data, error } = await supabase
      .from("photos")
      .update({
        caption:
          typeof input.caption === "string" && input.caption.trim()
            ? input.caption.trim()
            : null,
        updated_at: new Date().toISOString(),
        revision: (input.expectedRevision as number) + 1,
      })
      .eq("id", id)
      .eq("revision", input.expectedRevision)
      .select("revision, caption")
      .maybeSingle();
    if (error || !data)
      return Response.json(
        { error: "This photograph changed. Reload and try again." },
        { status: 409 },
      );
    invalidatePhotoPages();
    return Response.json({ ok: true, photo: data });
  }
  return Response.json(
    { error: "Unknown moderation action." },
    { status: 400 },
  );
}

export async function DELETE(request: Request, context: Context) {
  const { id } = await context.params;
  const revision = Number(new URL(request.url).searchParams.get("revision"));
  if (!/^[0-9a-f-]{36}$/.test(id) || !Number.isInteger(revision))
    return Response.json(
      { error: "Invalid deletion request." },
      { status: 400 },
    );
  try {
    const result = await removePhoto(id, revision);
    return Response.json(result.ok ? result : { error: result.error }, {
      status: result.ok ? 200 : result.status,
    });
  } catch (error) {
    console.error("Photo deletion failed", error);
    return Response.json(
      { error: "The photograph could not be deleted." },
      { status: 502 },
    );
  }
}
