"use server";

import { createClient } from "@/lib/supabase/server";
import { createAdminClient, hasServiceKey } from "@/lib/supabase/admin";

const BUCKET = "bike-images";
// Must remain below Vercel's 4.5 MB function request ceiling after FormData
// and Server Action overhead are included.
const MAX_BYTES = Math.floor(3.75 * 1024 * 1024);
const EXT_BY_TYPE: Record<string, string> = {
  "image/png": "png",
  "image/jpeg": "jpg",
  "image/webp": "webp",
  "image/avif": "avif",
};

export type UploadResult =
  | { ok: true; url: string }
  | { ok: false; error: "auth" | "noenv" | "nofile" | "type" | "toobig" | "upload" };

/** Only an authenticated admin may upload — the upload itself uses the
    service-role key (bypasses RLS), so we gate it explicitly here. */
async function requireAdmin() {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) return false;

  const { data, error } = await supabase.rpc("is_admin");
  return !error && data === true;
}

export async function uploadBikeImage(formData: FormData): Promise<UploadResult> {
  if (!hasServiceKey()) return { ok: false, error: "noenv" };
  if (!(await requireAdmin())) return { ok: false, error: "auth" };

  const file = formData.get("file");
  if (!(file instanceof File) || file.size === 0) return { ok: false, error: "nofile" };
  if (file.size > MAX_BYTES) return { ok: false, error: "toobig" };

  const ext = EXT_BY_TYPE[file.type];
  if (!ext) return { ok: false, error: "type" };

  const path = `bikes/${crypto.randomUUID()}.${ext}`;
  const supabase = createAdminClient();
  const { error } = await supabase.storage
    .from(BUCKET)
    .upload(path, file, { contentType: file.type, upsert: false });
  if (error) return { ok: false, error: "upload" };

  const { data } = supabase.storage.from(BUCKET).getPublicUrl(path);
  return { ok: true, url: data.publicUrl };
}

/** Best-effort removal of a stored image by its public URL. */
export async function deleteBikeImage(url: string): Promise<{ ok: boolean }> {
  if (!hasServiceKey()) return { ok: false };
  if (!(await requireAdmin())) return { ok: false };

  const marker = `/object/public/${BUCKET}/`;
  const i = url.indexOf(marker);
  if (i === -1) return { ok: false };
  const path = url.slice(i + marker.length);

  const supabase = createAdminClient();
  const { error } = await supabase.storage.from(BUCKET).remove([path]);
  return { ok: !error };
}
