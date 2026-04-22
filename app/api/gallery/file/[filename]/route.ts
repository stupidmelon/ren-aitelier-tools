import { readFile } from "node:fs/promises";
import path from "node:path";
import {
  deleteGalleryImage,
  ensureGalleryDir,
  getGalleryDir,
  isSafeGalleryPngFilename,
} from "@/lib/gallery/storage";

export const runtime = "nodejs";

type RouteContext = {
  params: Promise<{ filename: string }>;
};

export async function GET(_req: Request, context: RouteContext) {
  await ensureGalleryDir();
  const { filename: raw } = await context.params;
  const filename = decodeURIComponent(raw);

  if (!isSafeGalleryPngFilename(filename)) {
    return new Response("Not found", { status: 404 });
  }

  const dir = getGalleryDir();
  const fullPath = path.join(dir, filename);

  try {
    const buf = await readFile(fullPath);
    return new Response(buf, {
      status: 200,
      headers: {
        "Content-Type": "image/png",
        "Cache-Control": "public, max-age=3600, stale-while-revalidate=86400",
      },
    });
  } catch {
    return new Response("Not found", { status: 404 });
  }
}

export async function DELETE(_req: Request, context: RouteContext) {
  await ensureGalleryDir();
  const { filename: raw } = await context.params;
  const filename = decodeURIComponent(raw);

  if (!isSafeGalleryPngFilename(filename)) {
    return Response.json({ error: "Invalid filename" }, { status: 400 });
  }

  try {
    const { removedFile, wasInManifest } = await deleteGalleryImage(filename);
    if (!removedFile && !wasInManifest) {
      return Response.json({ error: "Not found" }, { status: 404 });
    }
    return Response.json({ ok: true, removedFile, wasInManifest });
  } catch (e) {
    const message = e instanceof Error ? e.message : "Delete failed";
    return Response.json({ error: message }, { status: 500 });
  }
}
