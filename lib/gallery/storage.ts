import { mkdir, readFile, rename, stat, unlink, writeFile } from "node:fs/promises";
import path from "node:path";

const MANIFEST_NAME = "manifest.json";

export type GalleryManifestEntry = {
  filename: string;
  savedAt: string;
};

export type GalleryManifest = {
  version: 1;
  entries: GalleryManifestEntry[];
};

export function getGalleryDir(): string {
  const fromEnv = process.env.GALLERY_DIR?.trim();
  if (fromEnv) return path.resolve(fromEnv);
  return path.join(process.cwd(), "data", "gallery");
}

export async function ensureGalleryDir(): Promise<string> {
  const dir = getGalleryDir();
  await mkdir(dir, { recursive: true });
  return dir;
}

const SAFE_PNG = /^[a-zA-Z0-9._-]+\.png$/;

export function isSafeGalleryPngFilename(name: string): boolean {
  if (!SAFE_PNG.test(name)) return false;
  if (name.includes("..")) return false;
  return path.basename(name) === name;
}

export async function readManifest(): Promise<GalleryManifest> {
  const dir = getGalleryDir();
  const file = path.join(dir, MANIFEST_NAME);
  try {
    const raw = await readFile(file, "utf8");
    const parsed = JSON.parse(raw) as unknown;
    if (!parsed || typeof parsed !== "object") return emptyManifest();
    const o = parsed as Record<string, unknown>;
    if (o.version !== 1 || !Array.isArray(o.entries)) return emptyManifest();
    const entries: GalleryManifestEntry[] = [];
    for (const row of o.entries) {
      if (!row || typeof row !== "object") continue;
      const r = row as Record<string, unknown>;
      if (
        typeof r.filename === "string" &&
        typeof r.savedAt === "string" &&
        isSafeGalleryPngFilename(r.filename)
      ) {
        entries.push({ filename: r.filename, savedAt: r.savedAt });
      }
    }
    return { version: 1, entries };
  } catch (e) {
    const err = e as NodeJS.ErrnoException;
    if (err.code === "ENOENT") return emptyManifest();
    throw e;
  }
}

function emptyManifest(): GalleryManifest {
  return { version: 1, entries: [] };
}

export async function writeManifest(manifest: GalleryManifest): Promise<void> {
  const dir = await ensureGalleryDir();
  const finalPath = path.join(dir, MANIFEST_NAME);
  const tmpPath = `${finalPath}.${process.pid}.${Date.now()}.tmp`;
  const body = `${JSON.stringify(manifest, null, 0)}\n`;
  await writeFile(tmpPath, body, "utf8");
  await rename(tmpPath, finalPath);
}

/** Prepends a new entry (newest first). Caller must have written `filename` into the gallery dir. */
export async function prependManifestEntry(entry: GalleryManifestEntry): Promise<void> {
  const current = await readManifest();
  const next: GalleryManifest = {
    version: 1,
    entries: [entry, ...current.entries.filter((e) => e.filename !== entry.filename)],
  };
  await writeManifest(next);
}

export function newGalleryFilename(): string {
  const stamp = new Date().toISOString().replace(/[:.]/g, "-");
  const rand = crypto.randomUUID().slice(0, 8);
  return `${stamp}-${rand}.png`;
}

export function parseDataUrlPngBase64(dataUrl: string): Buffer | null {
  const s = dataUrl.trim();
  const comma = s.indexOf(",");
  if (comma === -1) return null;
  const meta = s.slice(0, comma).toLowerCase();
  if (!meta.startsWith("data:image/png")) return null;
  if (!meta.includes("base64")) return null;
  const b64 = s.slice(comma + 1).replace(/\s/g, "");
  try {
    const buf = Buffer.from(b64, "base64");
    if (buf.length < 8) return null;
    // PNG signature
    if (
      buf[0] !== 0x89 ||
      buf[1] !== 0x50 ||
      buf[2] !== 0x4e ||
      buf[3] !== 0x47 ||
      buf[4] !== 0x0d ||
      buf[5] !== 0x0a ||
      buf[6] !== 0x1a ||
      buf[7] !== 0x0a
    ) {
      return null;
    }
    return buf;
  } catch {
    return null;
  }
}

export async function fileExistsInGallery(filename: string): Promise<boolean> {
  if (!isSafeGalleryPngFilename(filename)) return false;
  const dir = getGalleryDir();
  const full = path.join(dir, filename);
  try {
    const s = await stat(full);
    return s.isFile();
  } catch {
    return false;
  }
}

/**
 * Removes the PNG from disk (if present) and drops it from the manifest.
 * Safe filename must already be validated by the caller.
 */
export async function deleteGalleryImage(filename: string): Promise<{
  removedFile: boolean;
  wasInManifest: boolean;
}> {
  if (!isSafeGalleryPngFilename(filename)) {
    throw new Error("Invalid filename");
  }

  const dir = getGalleryDir();
  const fullPath = path.join(dir, filename);

  let removedFile = false;
  try {
    await unlink(fullPath);
    removedFile = true;
  } catch (e) {
    const err = e as NodeJS.ErrnoException;
    if (err.code !== "ENOENT") throw e;
  }

  const current = await readManifest();
  const wasInManifest = current.entries.some((e) => e.filename === filename);
  if (wasInManifest) {
    await writeManifest({
      version: 1,
      entries: current.entries.filter((e) => e.filename !== filename),
    });
  }

  return { removedFile, wasInManifest };
}
