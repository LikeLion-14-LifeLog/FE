import { useRef, useState } from "react";
import type {
  Certificate,
  LanguageScore,
  QualificationDraft,
} from "@/types/spec/qualification";
import QualificationForm from "./QualificationForm";
import SavedItemActions from "./SavedItemActions";
import { formatYearMonth } from "../utils/formatYearMonth";
import {
  isValidCertificate,
  isValidLanguage,
} from "../utils/specValidation";

type Props = {
  certificates: Certificate[];
  languageScores: LanguageScore[];
  onSaveCertificate: (value: Certificate) => void;
  onSaveLanguage: (value: LanguageScore) => void;
  onDeleteCertificate: (id: number) => void;
  onDeleteLanguage: (id: number) => void;
};

type Kind = QualificationDraft["kind"];

const isValid = (draft: QualificationDraft | null) =>
  draft?.kind === "certificate"
    ? isValidCertificate(draft.value)
    : draft?.kind === "language"
      ? isValidLanguage(draft.value)
      : false;

export default function QualificationSection({
  certificates,
  languageScores,
  onSaveCertificate,
  onSaveLanguage,
  onDeleteCertificate,
  onDeleteLanguage,
}: Props) {
  const nextId = useRef(
    Math.max(
      0,
      ...certificates.map((item) => item.localId),
      ...languageScores.map((item) => item.localId),
    ) + 1,
  );
  const cached = useRef<{
    certificate?: Certificate;
    language?: LanguageScore;
  }>({});
  const [draft, setDraft] = useState<QualificationDraft | null>(null);

  const isEditing = draft
    ? (draft.kind === "certificate" ? certificates : languageScores).some(
        (item) => item.localId === draft.value.localId,
      )
    : false;

  const createDraft = (kind: Kind): QualificationDraft => {
    nextId.current = Math.max(
      nextId.current,
      ...certificates.map((item) => item.localId + 1),
      ...languageScores.map((item) => item.localId + 1),
    );

    return kind === "certificate"
      ? {
          kind,
          value: {
            localId: nextId.current++,
            specProfileCertificateId: null,
            certificateId: null,
            certificateName: "",
            acquiredYearMonth: "",
          },
        }
      : {
          kind,
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
        };
  };

  const switchKind = (kind: Kind) => {
    if (!draft || isEditing || kind === draft.kind) return;

    if (draft.kind === "certificate") {
      cached.current.certificate = draft.value;
    } else {
      cached.current.language = draft.value;
    }

    if (kind === "certificate") {
      setDraft(
        cached.current.certificate
          ? { kind, value: cached.current.certificate }
          : createDraft(kind),
      );
    } else {
      setDraft(
        cached.current.language
          ? { kind, value: cached.current.language }
          : createDraft(kind),
      );
    }
  };

  const save = () => {
    if (!draft || !isValid(draft)) return;

    if (draft.kind === "certificate") {
      onSaveCertificate(draft.value);
    } else {
      onSaveLanguage(draft.value);
    }

    cached.current = {};
    setDraft(null);
  };

  const cancel = () => {
    cached.current = {};
    setDraft(null);
  };

  return (
    <section className="border-b border-border pb-6">
      <div className="mb-3 flex items-center gap-2">
        <span className="flex h-5 w-5 shrink-0 items-center justify-center rounded-full bg-brand-soft text-[10px] font-bold text-brand-strong">
          03
        </span>
        <h2 className="text-[15px] font-medium text-text-primary">
          자격 및 어학
        </h2>
        <button
          type="button"
          disabled={draft !== null}
          onClick={() => {
            cached.current = {};
            setDraft(createDraft("certificate"));
          }}
          className="ml-auto cursor-pointer text-[11px] font-semibold text-brand-strong disabled:cursor-not-allowed disabled:opacity-40"
        >
          + 자격·어학 추가
        </button>
      </div>

      {certificates
        .filter(
          (item) =>
            draft?.kind !== "certificate" ||
            item.localId !== draft.value.localId,
        )
        .map((item) => (
          <div
            key={`certificate-${item.localId}`}
            className="border-b border-border py-4 last:border-b-0"
          >
            <div className="flex items-start justify-between gap-3">
              <p className="min-w-0 break-words text-[12px] font-semibold text-text-primary">
                <span className="text-brand-strong">자격증</span>
                <span className="mx-2 text-text-muted">|</span>
                {item.certificateName}
              </p>
              <SavedItemActions
                disabled={draft !== null}
                onEdit={() =>
                  setDraft({ kind: "certificate", value: { ...item } })
                }
                onDelete={() => onDeleteCertificate(item.localId)}
              />
            </div>
            {item.acquiredYearMonth && (
              <p className="mt-2 text-[11px] text-text-secondary">
                {formatYearMonth(item.acquiredYearMonth)} 취득
              </p>
            )}
          </div>
        ))}

      {languageScores
        .filter(
          (item) =>
            draft?.kind !== "language" ||
            item.localId !== draft.value.localId,
        )
        .map((item) => (
          <div
            key={`language-${item.localId}`}
            className="border-b border-border py-4 last:border-b-0"
          >
            <div className="flex items-start justify-between gap-3">
              <p className="min-w-0 break-words text-[12px] font-semibold text-text-primary">
                <span className="text-brand-strong">어학</span>
                <span className="mx-2 text-text-muted">|</span>
                {item.languageExamName}
                {item.scoreNumeric && ` ${item.scoreNumeric}`}
                {item.scoreGrade && ` ${item.scoreGrade}`}
              </p>
              <SavedItemActions
                disabled={draft !== null}
                onEdit={() =>
                  setDraft({ kind: "language", value: { ...item } })
                }
                onDelete={() => onDeleteLanguage(item.localId)}
              />
            </div>
            {item.expiresYearMonth && (
              <p className="mt-2 text-[11px] text-text-secondary">
                유효기간 {formatYearMonth(item.expiresYearMonth)}
              </p>
            )}
          </div>
        ))}

      {draft && (
        <QualificationForm
          draft={draft}
          canSave={isValid(draft)}
          canSwitchKind={!isEditing}
          onSwitchKind={switchKind}
          onChange={setDraft}
          onSave={save}
          onCancel={cancel}
        />
      )}
    </section>
  );
}