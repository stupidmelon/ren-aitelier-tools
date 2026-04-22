import { readManifest, isSafeGalleryPngFilename } from "@/lib/gallery/storage";

export const runtime = "nodejs";

const DEFAULT_PAGE_SIZE = 9;
const MAX_PAGE_SIZE = 24;

function parsePositiveInt(v: string | null, fallback: number, max: number): number {
  if (v === null) return fallback;
  const n = Number.parseInt(v, 10);
  if (!Number.isFinite(n) || n < 1) return fallback;
  return Math.min(n, max);
}

export async function GET(req: Request) {
  const url = new URL(req.url);
  const page = parsePositiveInt(url.searchParams.get("page"), 1, 1_000_000);
  const pageSize = parsePositiveInt(
    url.searchParams.get("pageSize"),
    DEFAULT_PAGE_SIZE,
    MAX_PAGE_SIZE,
  );

  const manifest = await readManifest();
  const total = manifest.entries.length;
  const totalPages = total === 0 ? 1 : Math.ceil(total / pageSize);
  const safePage = Math.min(page, totalPages);
  const start = (safePage - 1) * pageSize;
  const slice = manifest.entries.slice(start, start + pageSize);

  const items = slice
    .filter((e) => isSafeGalleryPngFilename(e.filename))
    .map((e) => ({
      filename: e.filename,
      savedAt: e.savedAt,
      url: `/api/gallery/file/${encodeURIComponent(e.filename)}`,
    }));

  return Response.json({
    page: safePage,
    pageSize,
    total,
    totalPages,
    items,
  });
}
