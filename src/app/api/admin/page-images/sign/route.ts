import { getAdminIdentity } from "@/lib/auth/admin";
import { signedPageImageUpload } from "@/lib/cloudinary/page-images";

export async function POST() {
  if (!(await getAdminIdentity())) {
    return Response.json(
      { error: "Admin authorization required." },
      { status: 403 },
    );
  }
  try {
    return Response.json(signedPageImageUpload());
  } catch {
    return Response.json(
      { error: "Cloudinary is not configured." },
      { status: 503 },
    );
  }
}
