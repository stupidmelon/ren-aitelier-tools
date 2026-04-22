import { writeFile } from "node:fs/promises";
import path from "node:path";
import {
  ensureGalleryDir,
  newGalleryFilename,
  parseDataUrlPngBase64,
  prependManifestEntry,
} from "@/lib/gallery/storage";

export const runtime = "nodejs";

type SaveBody = {
  image?: string;
};

export async function POST(req: Request) {
  let body: SaveBody;
  try {
    body = (await req.json()) as SaveBody;
  } catch {
    return Response.json({ error: "Invalid JSON body" }, { status: 400 });
  }

  const image = typeof body.image === "string" ? body.image : "";
  const png = parseDataUrlPngBase64(image);
  if (!png) {
    return Response.json(
      { error: "Expected data:image/png;base64,... with a valid PNG payload" },
      { status: 400 },
    );
  }

  const dir = await ensureGalleryDir();
  const filename = newGalleryFilename();
  const fullPath = path.join(dir, filename);
  await writeFile(fullPath, png);

  const savedAt = new Date().toISOString();
  await prependManifestEntry({ filename, savedAt });

  return Response.json({ ok: true, filename, savedAt });
}
