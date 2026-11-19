import { useEffect, useRef, useState } from "react";
import {
  searchConfig,
  type SearchItem,
  type SearchKind,
} from "@/constants/specSearch";
import { searchSpecItems } from "@/apis/specSearch";

type Props = {
  kind: SearchKind;
  initialCategory?: string;
  onSelect: (item: SearchItem) => void;
  onClose: () => void;
};

type SearchState = {
  items: SearchItem[];
  total: number;
  hasNext: boolean;
  page: number;
};

const emptyResults = (): SearchState => ({
  items: [],
  total: 0,
  hasNext: false,
  page: 0,
});

export default function SearchModal({
  kind,
  initialCategory = "all",
  onSelect,
  onClose,
}: Props) {
  const dialogRef = useRef<HTMLDialogElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);
  const requestId = useRef(0);
  const config = searchConfig[kind];
  const [keyword, setKeyword] = useState("");
  const [activeTab, setActiveTab] = useState(() =>
    config.tabs.some((tab) => tab.value === initialCategory)
      ? initialCategory
      : "all"
  );
  const [results, setResults] = useState<SearchState>(emptyResults);
  const [loading, setLoading] = useState(true);
  const [loadingMore, setLoadingMore] = useState(false);
  const [error, setError] = useState(false);
  const [retry, setRetry] = useState(0);

  useEffect(() => {
    const dialog = dialogRef.current;
    if (!dialog) return;
    if (!dialog.open) dialog.showModal();
    inputRef.current?.focus();
    return () => {
      if (dialog.open) dialog.close();
    };
  }, []);

  useEffect(() => {
    const id = ++requestId.current;
    let active = true;
    const timer = window.setTimeout(
      () => {
        searchSpecItems({ kind, keyword, category: activeTab, page: 1 })
          .then((page) => {
            if (!active || id !== requestId.current) return;
            setResults({ ...page, page: 1 });
            setError(false);
          })
          .catch(() => {
            if (!active || id !== requestId.current) return;
            setError(true);
          })
          .finally(() => {
            if (active && id === requestId.current) setLoading(false);
          });
      },
      keyword ? 250 : 0
    );

    return () => {
      active = false;
      window.clearTimeout(timer);
    };
  }, [kind, keyword, activeTab, retry]);

  const resetQuery = () => {
    ++requestId.current;
    setResults(emptyResults());
    setLoading(true);
    setLoadingMore(false);
    setError(false);
  };

  const loadMore = async (retryFailed = false) => {
    if (loading || loadingMore || (error && !retryFailed) || !results.hasNext)
      return;
    const id = requestId.current;
    const nextPage = results.page + 1;
    setLoadingMore(true);
    try {
      const page = await searchSpecItems({
        kind,
        keyword,
        category: activeTab,
        page: nextPage,
      });
      if (id !== requestId.current) return;
      setResults((current) => ({
        items: [
          ...current.items,
          ...page.items.filter(
            (item) => !current.items.some((prev) => prev.key === item.key)
          ),
        ],
        total: page.total,
        hasNext: page.hasNext,
        page: nextPage,
      }));
      setError(false);
    } catch {
      if (id === requestId.current) setError(true);
    } finally {
      if (id === requestId.current) setLoadingMore(false);
    }
  };

  const handleRetry = () => {
    setError(false);
    if (results.items.length > 0 && results.hasNext) {
      void loadMore(true);
    } else {
      resetQuery();
      setRetry((value) => value + 1);
    }
  };

  return (
    <dialog
      ref={dialogRef}
      aria-labelledby="search-modal-title"
      aria-describedby="search-modal-description"
      onCancel={(event) => {
        event.preventDefault();
        onClose();
      }}
      className="m-auto h-[456px] max-h-[calc(100dvh-32px)] w-[392px] max-w-[calc(100vw-32px)] flex-col overflow-hidden rounded-xl border-0 bg-white p-0 text-text-primary shadow-xl backdrop:bg-text-primary/40 open:flex"
    >
      <header className="flex shrink-0 items-start justify-between border-b border-border px-5 pt-5 pb-4">
        <div className="min-w-0 pr-4">
          <h2
            id="search-modal-title"
            className="text-[15px] font-semibold text-text-primary"
          >
            {config.title}
          </h2>
          <p
            id="search-modal-description"
            className="mt-1.5 text-[11px] leading-relaxed text-text-muted"
          >
            {config.description}
          </p>
        </div>
        <button
          type="button"
          onClick={onClose}
          aria-label="검색 창 닫기"
          className="flex h-6 w-6 shrink-0 items-center justify-center rounded-md text-text-secondary transition-colors hover:bg-brand-soft hover:text-text-primary focus-visible:outline-2 focus-visible:outline-brand"
        >
          <svg
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="1.7"
            strokeLinecap="round"
            aria-hidden="true"
            className="h-4 w-4"
          >
            <path d="M18 6 6 18M6 6l12 12" />
          </svg>
        </button>
      </header>

      <div className="flex min-h-0 flex-1 flex-col px-5 pt-3">
        <div
          role="group"
          aria-label="검색 카테고리"
          className="flex shrink-0 gap-5 overflow-x-auto border-b border-border"
        >
          {config.tabs.map((tab) => {
            const active = activeTab === tab.value;
            const disabled = kind === "job" && tab.value !== "all";
            return (
              <button
                key={tab.value}
                type="button"
                aria-pressed={active}
                disabled={disabled}
                onClick={() => {
                  if (active) return;
                  resetQuery();
                  setActiveTab(tab.value);
                }}
                className={`relative shrink-0 cursor-pointer pb-2.5 text-[11px] font-medium whitespace-nowrap focus-visible:rounded-sm focus-visible:outline-2 focus-visible:outline-brand ${
                  active
                    ? "text-brand-strong after:absolute after:right-0 after:bottom-0 after:left-0 after:h-[2px] after:bg-brand"
                    : disabled
                      ? "cursor-not-allowed text-text-muted"
                      : "text-text-secondary hover:text-text-primary"
                }`}
              >
                {tab.label}
              </button>
            );
          })}
        </div>

        <div className="relative mt-3 shrink-0">
          <svg
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="1.8"
            strokeLinecap="round"
            strokeLinejoin="round"
            aria-hidden="true"
            className="pointer-events-none absolute top-1/2 left-3 h-4 w-4 -translate-y-1/2 text-brand-strong"
          >
            <circle cx="11" cy="11" r="7" />
            <path d="m20 20-4-4" />
          </svg>
          <input
            ref={inputRef}
            type="search"
            aria-label="검색어"
            value={keyword}
            onChange={(event) => {
              resetQuery();
              setKeyword(event.target.value);
            }}
            placeholder={config.placeholder}
            maxLength={config.maxLength}
            className="h-10 w-full rounded-lg border border-brand bg-brand-soft/40 pr-3 pl-10 text-[12px] text-text-primary outline-none placeholder:text-text-muted focus:ring-1 focus:ring-brand"
          />
        </div>
        <p
          aria-live="polite"
          className="shrink-0 py-3 text-[10px] text-text-muted"
        >
          {loading ? "검색 중..." : `검색 결과 ${results.total}건`}
        </p>
        <div className="min-h-0 flex-1 overflow-y-auto">
          {loading ? (
            <p
              role="status"
              className="py-12 text-center text-[12px] text-text-muted"
            >
              검색 중입니다.
            </p>
          ) : results.items.length === 0 && !error ? (
            <p className="py-12 text-center text-[12px] text-text-muted">
              검색 결과가 없습니다.
            </p>
          ) : (
            <ul className="pb-3">
              {results.items.map((item) => (
                <li
                  key={item.key}
                  className="border-b border-border last:border-b-0"
                >
                  <button
                    type="button"
                    onClick={() => {
                      onSelect(item);
                      onClose();
                    }}
                    className="group flex min-h-[60px] w-full cursor-pointer items-center justify-between gap-3 rounded-md px-2 py-3 text-left transition-colors hover:bg-brand-soft focus-visible:bg-brand-soft focus-visible:outline-2 focus-visible:outline-brand"
                  >
                    <span className="min-w-0">
                      <span className="block truncate text-[12px] font-semibold text-text-primary">
                        {item.name}
                      </span>
                      {item.description && (
                        <span className="mt-1 block truncate text-[10px] text-text-muted">
                          {item.description}
                        </span>
                      )}
                    </span>
                    <span className="shrink-0 text-[10px] text-text-muted group-hover:text-brand-strong group-focus-visible:text-brand-strong">
                      선택
                    </span>
                  </button>
                </li>
              ))}
            </ul>
          )}
          {error && (
            <div
              role="alert"
              className="py-4 text-center text-[12px] text-text-muted"
            >
              <p>검색 결과를 불러오지 못했습니다.</p>
              <button
                type="button"
                onClick={handleRetry}
                className="mt-2 cursor-pointer text-[12px] font-semibold text-brand-strong hover:underline"
              >
                다시 시도
              </button>
            </div>
          )}
          {!error && !loading && results.hasNext && (
            <button
              type="button"
              disabled={loadingMore}
              onClick={() => void loadMore()}
              className="mb-4 mt-2 w-full cursor-pointer rounded-lg border border-border py-2 text-[12px] font-semibold text-brand-strong disabled:cursor-not-allowed disabled:opacity-50"
            >
              {loadingMore ? "불러오는 중..." : "더 보기"}
            </button>
          )}
        </div>
      </div>
    </dialog>
  );
}
