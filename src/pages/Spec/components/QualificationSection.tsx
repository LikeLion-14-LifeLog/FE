import { useEffect, useRef, useState } from "react";
import type {
  Certificate,
  LanguageScore,
  QualificationDraft,
} from "@/types/spec/qualification";
import QualificationForm from "./QualificationForm";

type Props = {
  certificates: Certificate[];
  languageScores: LanguageScore[];
  onSaveCertificate: (value: Certificate) => void;
  onSaveLanguage: (value: LanguageScore) => void;
  onDeleteCertificate: (id: number) => void;
  onDeleteLanguage: (id: number) => void;
};

function isValidDraft(draft: QualificationDraft | null): boolean {
  if (!draft) return false;

  if (draft.kind === "certificate") {
    return draft.value.certificateName.trim() !== "";
  }

  const { value } = draft;
  const needsNumeric =
    value.scoreType === "NUMERIC" ||
    value.scoreType === "NUMERIC_AND_GRADE";
  const needsGrade =
    value.scoreType === "GRADE" ||
    value.scoreType === "NUMERIC_AND_GRADE";

  return (
    value.languageExamName.trim() !== "" &&
    value.scoreType !== "" &&
    (!needsNumeric ||
      (value.scoreNumeric.trim() !== "" &&
        Number.isFinite(Number(value.scoreNumeric)))) &&
    (!needsGrade || value.scoreGrade.trim() !== "")
  );
}

export default function QualificationSection({
  certificates,
  languageScores,
  onSaveCertificate,
  onSaveLanguage,
  onDeleteCertificate,
  onDeleteLanguage,
}: Props) {
  const nextId = useRef(1);
  const menuRef = useRef<HTMLDivElement>(null);
  const [draft, setDraft] = useState<QualificationDraft | null>(null);
  const [showMenu, setShowMenu] = useState(false);

  const canSave = isValidDraft(draft);

  useEffect(() => {
    if (!showMenu) return;

    const handleOutsideClick = (event: PointerEvent) => {
      if (
        event.target instanceof Node &&
        !menuRef.current?.contains(event.target)
      ) {
        setShowMenu(false);
      }
    };

    const handleEscape = (event: KeyboardEvent) => {
      if (event.key === "Escape") {
        setShowMenu(false);
        menuRef.current?.querySelector("button")?.focus();
      }
    };

    document.addEventListener("pointerdown", handleOutsideClick);
    document.addEventListener("keydown", handleEscape);

    return () => {
      document.removeEventListener("pointerdown", handleOutsideClick);
      document.removeEventListener("keydown", handleEscape);
    };
  }, [showMenu]);

  const addCertificate = () => {
    setDraft({
      kind: "certificate",
      value: {
        localId: nextId.current++,
        specProfileCertificateId: null,
        certificateId: null,
        certificateName: "",
        acquiredYearMonth: "",
      },
    });
    setShowMenu(false);
  };

  const addLanguage = () => {
    setDraft({
      kind: "language",
      value: {
        localId: nextId.current++,
        languageExamScoreId: null,
        languageExamId: null,
        languageExamName: "",
        scoreType: "",
        scoreNumeric: "",
        scoreGrade: "",
        acquiredYearMonth: "",
        expiresYearMonth: "",
      },
    });
    setShowMenu(false);
  };

  const saveDraft = () => {
    if (!draft || !canSave) return;

    if (draft.kind === "certificate") {
      onSaveCertificate(draft.value);
    } else {
      onSaveLanguage(draft.value);
    }

    setDraft(null);
  };

  return (
    <section className="border-b border-border pb-6">
      <div className="mb-5 flex items-center gap-2">
        <span className="flex h-5 w-5 items-center justify-center rounded-full bg-brand-soft text-[10px] font-bold text-brand-strong">
          03
        </span>
        <h2 className="text-[15px] font-semibold text-text-primary">
          자격 및 어학
        </h2>
        <span className="text-[11px] text-text-muted">선택</span>

        <div ref={menuRef} className="relative ml-auto">
          <button
            type="button"
            aria-expanded={showMenu}
            aria-controls="qualification-add-menu"
            disabled={draft !== null}
            onClick={() => setShowMenu((prev) => !prev)}
            className="text-[11px] font-semibold text-brand-strong disabled:cursor-not-allowed disabled:opacity-40"
          >
            + 자격·어학 추가
          </button>

          {showMenu && (
            <div
              id="qualification-add-menu"
              className="absolute top-full right-0 z-10 mt-2 w-32 rounded-lg border border-border bg-white p-1 shadow-sm"
            >
              <button
                type="button"
                onClick={addCertificate}
                className="w-full rounded-md px-3 py-2 text-left text-[12px] text-text-primary hover:bg-brand-soft"
              >
                자격증
              </button>
              <button
                type="button"
                onClick={addLanguage}
                className="w-full rounded-md px-3 py-2 text-left text-[12px] text-text-primary hover:bg-brand-soft"
              >
                어학시험
              </button>
            </div>
          )}
        </div>
      </div>

      {certificates
        .filter(
          (item) =>
            !(
              draft?.kind === "certificate" &&
              draft.value.localId === item.localId
            ),
        )
        .map((item) => (
          <div
            key={`certificate-${item.localId}`}
            className="mb-4 flex items-center justify-between gap-3 border-b border-border pb-4"
          >
            <div className="min-w-0">
              <p className="break-words text-[13px] font-semibold text-text-primary">
                {item.certificateName}
              </p>
              <p className="mt-1 text-[11px] text-text-secondary">
                자격증
                {item.acquiredYearMonth && ` · ${item.acquiredYearMonth}`}
                {item.certificateId == null && " · 임시 등록"}
              </p>
            </div>

            <div className="flex shrink-0 gap-3 text-[11px]">
              <button
                type="button"
                disabled={draft !== null}
                onClick={() =>
                  setDraft({
                    kind: "certificate",
                    value: { ...item },
                  })
                }
                className="text-brand-strong disabled:cursor-not-allowed disabled:opacity-40"
              >
                수정
              </button>
              <button
                type="button"
                disabled={draft !== null}
                onClick={() => onDeleteCertificate(item.localId)}
                className="text-text-secondary disabled:cursor-not-allowed disabled:opacity-40"
              >
                삭제
              </button>
            </div>
          </div>
        ))}

      {languageScores
        .filter(
          (item) =>
            !(
              draft?.kind === "language" &&
              draft.value.localId === item.localId
            ),
        )
        .map((item) => (
          <div
            key={`language-${item.localId}`}
            className="mb-4 flex items-center justify-between gap-3 border-b border-border pb-4"
          >
            <div className="min-w-0">
              <p className="break-words text-[13px] font-semibold text-text-primary">
                {item.languageExamName}
              </p>
              <p className="mt-1 text-[11px] text-text-secondary">
                어학
                {item.scoreNumeric && ` · ${item.scoreNumeric}점`}
                {item.scoreGrade && ` · ${item.scoreGrade}`}
                {item.acquiredYearMonth && ` · ${item.acquiredYearMonth}`}
                {item.languageExamId == null && " · 임시 등록"}
              </p>
            </div>

            <div className="flex shrink-0 gap-3 text-[11px]">
              <button
                type="button"
                disabled={draft !== null}
                onClick={() =>
                  setDraft({
                    kind: "language",
                    value: { ...item },
                  })
                }
                className="text-brand-strong disabled:cursor-not-allowed disabled:opacity-40"
              >
                수정
              </button>
              <button
                type="button"
                disabled={draft !== null}
                onClick={() => onDeleteLanguage(item.localId)}
                className="text-text-secondary disabled:cursor-not-allowed disabled:opacity-40"
              >
                삭제
              </button>
            </div>
          </div>
        ))}

      {draft && (
        <QualificationForm
          draft={draft}
          canSave={canSave}
          onChange={setDraft}
          onSave={saveDraft}
          onCancel={() => setDraft(null)}
        />
      )}
    </section>
  );
}
