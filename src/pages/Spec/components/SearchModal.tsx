import { useEffect, useRef, useState } from "react";
import {
  mockSearchItems,
  searchConfig,
  type SearchItem,
  type SearchKind,
} from "@/mocks/specSearch";

type Props = {
  kind: SearchKind;
  initialCategory?: string;
  onSelect: (item: SearchItem) => void;
  onClose: () => void;
};

export default function SearchModal({
  kind,
  initialCategory = "all",
  onSelect,
  onClose,
}: Props) {
  const dialogRef = useRef<HTMLDialogElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);
  const [keyword, setKeyword] = useState("");

  const config = searchConfig[kind];
  const [activeTab, setActiveTab] = useState(() =>
    kind === "major" &&
    config.tabs.some((tab) => tab.value === initialCategory)
      ? initialCategory
      : "all",
  );

  const query = keyword.trim().toLocaleLowerCase();

  const results = mockSearchItems[kind].filter((item) => {
    const matchesKeyword = item.name.toLocaleLowerCase().includes(query);
    const matchesCategory =
      kind !== "major" ||
      activeTab === "all" ||
      item.category === activeTab;

    return matchesKeyword && matchesCategory;
  });

  useEffect(() => {
    const dialog = dialogRef.current;
    if (!dialog) return;

    if (!dialog.open) dialog.showModal();
    inputRef.current?.focus();

    return () => {
      if (dialog.open) dialog.close();
    };
  }, []);

  const handleSelect = (item: SearchItem) => {
    onSelect(item);
    onClose();
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
            const disabled = kind !== "major" && tab.value !== "all";

            return (
              <button
                key={tab.value}
                type="button"
                disabled={disabled}
                aria-pressed={active}
                onClick={() => setActiveTab(tab.value)}
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
            onChange={(event) => setKeyword(event.target.value)}
            placeholder={config.placeholder}
            maxLength={config.maxLength}
            className="h-10 w-full rounded-lg border border-brand bg-brand-soft/40 pr-3 pl-10 text-[12px] text-text-primary outline-none placeholder:text-text-muted focus:ring-1 focus:ring-brand"
          />
        </div>

        <p
          aria-live="polite"
          className="shrink-0 py-3 text-[10px] text-text-muted"
        >
          검색 결과 {results.length}건
        </p>

        <div className="min-h-0 flex-1 overflow-y-auto">
          {results.length === 0 ? (
            <p className="py-12 text-center text-[12px] text-text-muted">
              검색 결과가 없습니다.
            </p>
          ) : (
            <ul className="pb-3">
              {results.map((item) => (
                <li
                  key={item.key}
                  className="border-b border-border last:border-b-0"
                >
                  <button
                    type="button"
                    onClick={() => handleSelect(item)}
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
        </div>
      </div>
    </dialog>
  );
}