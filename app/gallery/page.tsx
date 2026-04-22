"use client";

import Link from "next/link";
import Image from "next/image";
import { useCallback, useEffect, useMemo, useState } from "react";

const PAGE_SIZE = 9;

type GalleryItem = {
  filename: string;
  savedAt: string;
  url: string;
};

type GalleryResponse = {
  page: number;
  pageSize: number;
  total: number;
  totalPages: number;
  items: GalleryItem[];
};

function visiblePageNumbers(current: number, total: number, width: number): number[] {
  if (total <= width) {
    return Array.from({ length: total }, (_, i) => i + 1);
  }
  const half = Math.floor(width / 2);
  let start = Math.max(1, current - half);
  let end = start + width - 1;
  if (end > total) {
    end = total;
    start = Math.max(1, end - width + 1);
  }
  return Array.from({ length: end - start + 1 }, (_, i) => start + i);
}

const btnClass =
  "font-unifont inline-flex min-h-9 touch-manipulation items-center justify-center rounded border-2 border-[var(--aitelier-border)] bg-[var(--aitelier-surface)] px-3 text-xs font-medium text-[var(--aitelier-text)] shadow-none transition-opacity hover:opacity-90 active:opacity-100 disabled:pointer-events-none disabled:opacity-50 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[var(--aitelier-border-dark)] focus-visible:ring-offset-2 focus-visible:ring-offset-[var(--aitelier-bg)]";

const numBtnClass = `${btnClass} min-w-9 px-2 tabular-nums`;

export default function GalleryPage() {
  const [page, setPage] = useState(1);
  const [data, setData] = useState<GalleryResponse | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [deleting, setDeleting] = useState<Record<string, boolean>>({});

  const load = useCallback(async (p: number) => {
    setLoading(true);
    setError(null);
    try {
      const res = await fetch(
        `/api/gallery?page=${encodeURIComponent(String(p))}&pageSize=${PAGE_SIZE}`,
        { cache: "no-store" },
      );
      const json = (await res.json()) as GalleryResponse & { error?: string };
      if (!res.ok) {
        throw new Error(
          typeof json.error === "string" ? json.error : `載入失敗 (${res.status})`,
        );
      }
      setData(json);
      setPage((prev) => (json.page !== prev ? json.page : prev));
    } catch (e) {
      setError(e instanceof Error ? e.message : "載入失敗");
      setData(null);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    void load(page);
  }, [load, page]);

  const totalPages = data?.totalPages ?? 1;
  const total = data?.total ?? 0;
  const pageNums = useMemo(() => {
    if (!data || error) return [1];
    return visiblePageNumbers(page, totalPages, 7);
  }, [data, error, page, totalPages]);

  const navDisabled = loading || error !== null;

  const go = (p: number) => {
    const next = Math.min(Math.max(1, p), totalPages);
    if (next !== page) setPage(next);
    else void load(next);
  };

  const handleDelete = useCallback(
    async (filename: string) => {
      if (
        !window.confirm(
          `確定刪除「${filename}」？將從伺服器資料夾永久移除，無法復原。`,
        )
      ) {
        return;
      }
      setDeleting((d) => ({ ...d, [filename]: true }));
      try {
        const res = await fetch(
          `/api/gallery/file/${encodeURIComponent(filename)}`,
          { method: "DELETE" },
        );
        const json = (await res.json()) as { error?: string };
        if (!res.ok) {
          throw new Error(
            typeof json.error === "string" ? json.error : `刪除失敗 (${res.status})`,
          );
        }
        await load(page);
      } catch (e) {
        window.alert(e instanceof Error ? e.message : "刪除失敗");
      } finally {
        setDeleting((d) => {
          const next = { ...d };
          delete next[filename];
          return next;
        });
      }
    },
    [load, page],
  );

  return (
    <div className="flex min-h-0 flex-1 flex-col bg-[var(--aitelier-bg)]">
      <main className="mx-auto flex w-full max-w-3xl flex-1 flex-col gap-5 px-4 py-6 pb-[max(1.5rem,env(safe-area-inset-bottom))] pt-[max(1.5rem,env(safe-area-inset-top))] sm:px-6 sm:py-8">
        <header className="shrink-0">
          <div className="flex flex-col gap-2 sm:flex-row sm:items-end sm:justify-between">
            <div>
              <h1
                className="font-taipei text-xl font-normal tracking-wide text-[var(--aitelier-text)] sm:text-2xl"
                style={{ letterSpacing: "0.06em" }}
              >
                圖庫
              </h1>
              <p
                className="font-unifont mt-2 text-sm text-[var(--aitelier-text-muted)]"
                style={{ letterSpacing: "0.12em" }}
              >
                本機伺服器資料夾中的已保存 PNG
              </p>
            </div>
            <Link
              href="/"
              className="font-unifont text-xs text-[var(--aitelier-text-muted)] underline decoration-[var(--aitelier-border-dark)] underline-offset-4 transition-opacity hover:opacity-80"
              style={{ letterSpacing: "0.12em" }}
            >
              返回首頁
            </Link>
          </div>
        </header>

        <section className="flex flex-col gap-4">
          <div className="font-unifont flex flex-wrap items-center justify-between gap-2 text-xs text-[var(--aitelier-text-muted)]">
            <span className="tabular-nums" style={{ letterSpacing: "0.08em" }}>
              {data && !error ? (
                <>
                  共 {total} 張 · 全 {totalPages} 頁
                </>
              ) : error ? (
                <>無法讀取目錄</>
              ) : (
                <>載入目錄中…</>
              )}
            </span>
            {loading && data ? (
              <span style={{ letterSpacing: "0.08em" }}>更新中…</span>
            ) : null}
          </div>

          {error ? (
            <div className="flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">
              <p
                className="font-unifont rounded border border-[var(--aitelier-border)] bg-[var(--aitelier-surface)] px-3 py-2 text-sm text-[var(--aitelier-text)]"
                style={{ letterSpacing: "0.06em" }}
              >
                {error}
              </p>
              <button
                type="button"
                className={btnClass}
                style={{ letterSpacing: "0.12em" }}
                onClick={() => void load(page)}
              >
                重試
              </button>
            </div>
          ) : null}

          {!loading && !error && data && data.items.length === 0 ? (
            <p
              className="font-unifont text-sm text-[var(--aitelier-text-muted)]"
              style={{ letterSpacing: "0.08em" }}
            >
              尚無已保存的圖片。於首頁生成後按「保存」即可加入此處。
            </p>
          ) : null}

          <div className="grid grid-cols-3 gap-2 sm:gap-3">
            {(data?.items ?? []).map((item) => (
              <div
                key={item.filename}
                className="flex min-w-0 flex-col gap-2 overflow-hidden rounded border border-[var(--aitelier-border)] bg-[var(--aitelier-surface)] p-1.5"
              >
                <div className="relative aspect-square w-full min-w-0 overflow-hidden rounded border border-[var(--aitelier-border)] bg-[var(--aitelier-input-bg)]">
                  <Image
                    src={item.url}
                    alt={item.filename}
                    fill
                    className="object-contain"
                    sizes="(max-width: 768px) 28vw, 12rem"
                    unoptimized
                    loading="lazy"
                    decoding="async"
                  />
                </div>
                <div className="flex min-w-0 flex-col gap-1.5">
                  <a
                    href={item.url}
                    download={item.filename}
                    className={`${btnClass} w-full`}
                    style={{ letterSpacing: "0.12em" }}
                  >
                    下載
                  </a>
                  <button
                    type="button"
                    className={`${btnClass} w-full border-[var(--aitelier-border-dark)] text-[var(--aitelier-text-muted)] hover:text-[var(--aitelier-text)]`}
                    style={{ letterSpacing: "0.12em" }}
                    disabled={navDisabled || !!deleting[item.filename]}
                    onClick={() => void handleDelete(item.filename)}
                  >
                    {deleting[item.filename] ? "刪除中…" : "刪除"}
                  </button>
                </div>
              </div>
            ))}
          </div>

          <nav
            className="flex flex-col gap-3 border-t border-[var(--aitelier-border)] pt-4"
            aria-label="分頁"
          >
            <div className="font-unifont text-center text-xs text-[var(--aitelier-text-muted)] tabular-nums">
              {data && !error ? (
                <>
                  第 {page} / {totalPages} 頁
                </>
              ) : (
                <>第 — / — 頁</>
              )}
            </div>
            <div className="flex flex-wrap items-center justify-center gap-2">
              <button
                type="button"
                className={btnClass}
                style={{ letterSpacing: "0.12em" }}
                disabled={navDisabled || page <= 1}
                onClick={() => go(1)}
              >
                首頁
              </button>
              <button
                type="button"
                className={btnClass}
                style={{ letterSpacing: "0.12em" }}
                disabled={navDisabled || page <= 1}
                onClick={() => go(page - 1)}
              >
                上一頁
              </button>
              <button
                type="button"
                className={btnClass}
                style={{ letterSpacing: "0.12em" }}
                disabled={navDisabled || page >= totalPages}
                onClick={() => go(page + 1)}
              >
                下一頁
              </button>
              <button
                type="button"
                className={btnClass}
                style={{ letterSpacing: "0.12em" }}
                disabled={navDisabled || page >= totalPages}
                onClick={() => go(totalPages)}
              >
                末頁
              </button>
            </div>
            <div className="flex flex-wrap items-center justify-center gap-1.5">
              {pageNums.map((n) => (
                <button
                  key={n}
                  type="button"
                  className={numBtnClass}
                  style={{ letterSpacing: "0.06em" }}
                  disabled={navDisabled}
                  aria-current={n === page ? "page" : undefined}
                  onClick={() => go(n)}
                >
                  {n}
                </button>
              ))}
            </div>
          </nav>
        </section>
      </main>
    </div>
  );
}
