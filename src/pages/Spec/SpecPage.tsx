import { useEffect, useState } from "react";
import {
  getSpecFormOptions,
  saveSpecProfileMock,
  type SpecProfileDraft,
} from "@/apis/spec";
import type { BasicInfo, SpecFormOptions } from "@/types/spec/profile";
import type { Education } from "@/types/spec/education";
import type { Certificate, LanguageScore } from "@/types/spec/qualification";
import type { Experience } from "@/types/spec/experience";
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

export default function SpecPage() {
  const [basicInfo, setBasicInfo] = useState<BasicInfo>({
    birthYear: "",
    residenceRegion: "",
    jobId: null,
    jobName: "",
  });
  const [educations, setEducations] = useState<Education[]>([]);
  const [certificates, setCertificates] = useState<Certificate[]>([]);
  const [languageScores, setLanguageScores] = useState<LanguageScore[]>([]);
  const [experiences, setExperiences] = useState<Experience[]>([]);
  const [options, setOptions] = useState<SpecFormOptions | null>(null);
  const [optionsError, setOptionsError] = useState(false);
  const [saving, setSaving] = useState(false);
  const [notice, setNotice] = useState("");

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

  const validBasic =
    options !== null &&
    isValidBasicInfo(basicInfo, options.residentialAreas);

  const validEducation =
    options !== null &&
    educations.length > 0 &&
    educations.every((item) => isValidEducation(item, options));

  const validOptional =
    certificates.every(isValidCertificate) &&
    languageScores.every(isValidLanguage) &&
    experiences.every(isValidExperience);

  const canDiagnose = validBasic && validEducation && validOptional;
  const clearNotice = () => setNotice("");

  const handleSave = async () => {
    if (saving) return;

    const profile: SpecProfileDraft = {
      basicInfo,
      educations,
      certificates,
      languageScores,
      experiences,
    };

    setSaving(true);
    clearNotice();

    try {
      await saveSpecProfileMock(profile);
      setNotice("Mock 임시 저장 완료 · 새로고침하면 데이터가 사라집니다.");
    } catch {
      setNotice("저장에 실패했습니다. 다시 시도해 주세요.");
    } finally {
      setSaving(false);
    }
  };

  if (optionsError) {
    return <p role="alert">선택 항목을 불러오지 못했습니다.</p>;
  }

  if (!options) {
    return <p role="status">선택 항목을 불러오는 중입니다.</p>;
  }

  return (
    <div className="w-full pb-28">
      <div className="mb-6 border-t border-border-strong" />

      <div className="grid gap-8 lg:grid-cols-2">
        <div className="space-y-8 lg:border-r lg:border-border lg:pr-8">
          <BasicInfoSection
            value={basicInfo}
            residentialAreas={options.residentialAreas}
            onChange={(value) => {
              setBasicInfo(value);
              clearNotice();
            }}
          />

          <EducationSection
            educations={educations}
            options={options}
            onSave={(value) => {
              setEducations((prev) => upsert(prev, value));
              clearNotice();
            }}
            onDelete={(id) => {
              setEducations((prev) =>
                prev.filter((item) => item.localId !== id),
              );
              clearNotice();
            }}
          />

          <QualificationSection
            certificates={certificates}
            languageScores={languageScores}
            onSaveCertificate={(value) => {
              setCertificates((prev) => upsert(prev, value));
              clearNotice();
            }}
            onSaveLanguage={(value) => {
              setLanguageScores((prev) => upsert(prev, value));
              clearNotice();
            }}
            onDeleteCertificate={(id) => {
              setCertificates((prev) =>
                prev.filter((item) => item.localId !== id),
              );
              clearNotice();
            }}
            onDeleteLanguage={(id) => {
              setLanguageScores((prev) =>
                prev.filter((item) => item.localId !== id),
              );
              clearNotice();
            }}
          />
        </div>

        <ExperienceSection
          experiences={experiences}
          onSave={(value) => {
            setExperiences((prev) => upsert(prev, value));
            clearNotice();
          }}
          onDelete={(id) => {
            setExperiences((prev) =>
              prev.filter((item) => item.localId !== id),
            );
            clearNotice();
          }}
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
        onDiagnose={() => {
          if (canDiagnose && !saving) {
            setNotice("진단 기능은 API 연결 후 이용할 수 있습니다.");
          }
        }}
      />
    </div>
  );
}