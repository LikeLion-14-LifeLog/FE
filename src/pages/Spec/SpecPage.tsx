import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import {
  getSpecFormOptions,
  getSavedSpecProfileMock,
  saveSpecProfileMock,
  type SpecProfileDraft,
} from "@/apis/spec";
import { getActiveMockDiagnosis, startMockDiagnosis } from "@/mocks/diagnosis";
import { useCurrentUser } from "@/store/authStore";
import type { SpecFormOptions } from "@/types/spec/profile";
import BasicInfoSection from "./components/BasicInfoSection";
import EducationSection from "./components/EducationSection";
import QualificationSection from "./components/QualificationSection";
import ExperienceSection from "./components/ExperienceSection";
import SpecFooter from "./components/SpecFooter";
import {
  isValidBasicInfo,
  isValidEducation,
  isValidCertificate,
  isValidLanguage,
  isValidExperience,
} from "./utils/specValidation";

const upsert = <T extends { localId: number }>(items: T[], value: T): T[] =>
  items.some((item) => item.localId === value.localId)
    ? items.map((item) => item.localId === value.localId ? value : item)
    : [...items, value];

const emptyProfile = (): SpecProfileDraft => ({
  basicInfo: { birthYear: "", residenceRegion: "", jobId: null, jobName: "" },
  educations: [],
  certificates: [],
  languageScores: [],
  experiences: [],
});

function SpecFormPage({ email }: { email: string | undefined }) {
  const navigate = useNavigate();
  const [profile, setProfile] = useState<SpecProfileDraft>(() =>
    email ? getSavedSpecProfileMock(email) ?? emptyProfile() : emptyProfile(),
  );
  const [options, setOptions] = useState<SpecFormOptions | null>(null);
  const [optionsError, setOptionsError] = useState(false);
  const [saving, setSaving] = useState(false);
  const [notice, setNotice] = useState("");
  const [editingEducation, setEditingEducation] = useState(false);
  const [editingQualification, setEditingQualification] = useState(false);
  const [editingExperience, setEditingExperience] = useState(false);

  useEffect(() => {
    let active = true;

    getSpecFormOptions()
      .then((data) => {
        if (active) setOptions(data);
      })
      .catch(() => {
        if (active) setOptionsError(true);
      });

    return () => {
      active = false;
    };
  }, []);

  const { basicInfo, educations, certificates, languageScores, experiences } =
    profile;

  const hasPendingEdits =
    editingEducation || editingQualification || editingExperience;
  const validBasic =
    options !== null && isValidBasicInfo(basicInfo, options.residentialAreas);
  const validEducation =
    options !== null &&
    educations.length > 0 &&
    educations.every((value) => isValidEducation(value, options));
  const validOptional =
    certificates.every(isValidCertificate) &&
    languageScores.every(isValidLanguage) &&
    experiences.every(isValidExperience);
  const canDiagnose =
    validBasic && validEducation && validOptional && !hasPendingEdits;

  const update = (changes: Partial<SpecProfileDraft>) => {
    setProfile((prev) => ({ ...prev, ...changes }));
    setNotice("");
  };

  const handleSave = async () => {
    if (saving) return;

    if (hasPendingEdits) {
      setNotice("작성 중인 항목을 저장하거나 취소한 뒤 임시 저장해 주세요.");
      return;
    }

    if (!email) {
      navigate("/error/login-required");
      return;
    }

    if (getActiveMockDiagnosis(email)) {
      setNotice("분석 중에는 스펙을 수정할 수 없습니다.");
      return;
    }

    setSaving(true);
    setNotice("");

    try {
      await saveSpecProfileMock(profile, email);
      setNotice("Mock 임시 저장 완료");
    } catch {
      setNotice("저장에 실패했습니다. 다시 시도해 주세요.");
    } finally {
      setSaving(false);
    }
  };

  const handleDiagnose = async () => {
    if (!canDiagnose || saving) return;

    if (!email) {
      navigate("/error/login-required");
      return;
    }

    const active = getActiveMockDiagnosis(email);

    if (active) {
      navigate(`/diagnosis/loading?runId=${active.runId}`);
      return;
    }

    setSaving(true);
    setNotice("");

    try {
      await saveSpecProfileMock(profile, email);
      const run = startMockDiagnosis(profile, email);
      navigate(`/diagnosis/loading?runId=${run.runId}`);
    } catch {
      setNotice("분석을 시작하지 못했습니다. 다시 시도해 주세요.");
    } finally {
      setSaving(false);
    }
  };

  if (optionsError) return <p role="alert">선택 항목을 불러오지 못했습니다.</p>;
  if (!options) return <p role="status">선택 항목을 불러오는 중입니다.</p>;

  return (
    <div className="w-full pb-28">
      <div className="mb-6 border-t border-border-strong" />
      <div className="grid gap-8 lg:grid-cols-2">
        <div className="space-y-8 lg:border-r lg:border-border lg:pr-8">
          <BasicInfoSection
            value={basicInfo}
            residentialAreas={options.residentialAreas}
            onChange={(value) => update({ basicInfo: value })}
          />
          <EducationSection
            educations={educations}
            options={options}
            onEditingChange={setEditingEducation}
            onSave={(value) => update({ educations: upsert(educations, value) })}
            onDelete={(id) =>
              update({ educations: educations.filter((item) => item.localId !== id) })
            }
          />
          <QualificationSection
            certificates={certificates}
            languageScores={languageScores}
            onEditingChange={setEditingQualification}
            onSaveCertificate={(value) =>
              update({ certificates: upsert(certificates, value) })
            }
            onSaveLanguage={(value) =>
              update({ languageScores: upsert(languageScores, value) })
            }
            onDeleteCertificate={(id) =>
              update({ certificates: certificates.filter((item) => item.localId !== id) })
            }
            onDeleteLanguage={(id) =>
              update({ languageScores: languageScores.filter((item) => item.localId !== id) })
            }
          />
        </div>
        <ExperienceSection
          experiences={experiences}
          onEditingChange={setEditingExperience}
          onSave={(value) => update({ experiences: upsert(experiences, value) })}
          onDelete={(id) =>
            update({ experiences: experiences.filter((item) => item.localId !== id) })
          }
        />
      </div>
      {notice && (
        <p role="status" className="mt-5 text-[12px] text-text-secondary">
          {notice}
        </p>
      )}
      <SpecFooter
        saving={saving}
        canDiagnose={canDiagnose}
        onSave={handleSave}
        onDiagnose={handleDiagnose}
      />
    </div>
  );
}

export default function SpecPage() {
  const email = useCurrentUser()?.email;

  return <SpecFormPage key={email ?? "guest"} email={email} />;
}