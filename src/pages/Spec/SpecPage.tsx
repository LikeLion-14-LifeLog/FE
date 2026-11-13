import { useEffect, useState } from "react";
import {
  getSpecFormOptions,
  saveSpecProfileMock,
  type SpecProfileDraft,
} from "@/apis/spec";
import type { BasicInfo, SpecFormOptions } from "@/types/spec/profile";
import type { Education } from "@/types/spec/education";
import type {
  Certificate,
  LanguageScore,
} from "@/types/spec/qualification";
import type { Experience } from "@/types/spec/experience";
import BasicInfoSection from "./components/BasicInfoSection";
import EducationSection from "./components/EducationSection";
import QualificationSection from "./components/QualificationSection";
import ExperienceSection from "./components/ExperienceSection";
import SpecFooter from "./components/SpecFooter";

function upsert<T extends { localId: number }>(items: T[], value: T): T[] {
  return items.some((item) => item.localId === value.localId)
    ? items.map((item) =>
        item.localId === value.localId ? value : item,
      )
    : [...items, value];
}

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

  const birthYear = Number(basicInfo.birthYear);

  const validBasicInfo =
    basicInfo.birthYear.trim() !== "" &&
    Number.isInteger(birthYear) &&
    birthYear >= 1 &&
    birthYear <= new Date().getFullYear() &&
    Boolean(
      options?.residentialAreas.some(
        (area) => area.code === basicInfo.residenceRegion,
      ),
    ) &&
    basicInfo.jobName.trim() !== "";

  const validEducations =
    educations.length > 0 &&
    educations.every((item) => {
      const hasMajorInput = Boolean(
        item.majorAffiliation || item.majorName || item.majorId != null,
      );

      return (
        item.type.trim() !== "" &&
        item.status.trim() !== "" &&
        item.location.trim() !== "" &&
        (!hasMajorInput ||
          (item.majorAffiliation.trim() !== "" &&
            item.majorName.trim() !== ""))
      );
    });

  // 진단에만 필수 입력 조건 적용
  const canDiagnose = validBasicInfo && validEducations;

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
    setNotice("");

    try {
      await saveSpecProfileMock(profile);
      setNotice("임시 저장되었습니다. 새로고침하면 데이터가 사라집니다.");
    } catch {
      setNotice("저장에 실패했습니다. 다시 시도해 주세요.");
    } finally {
      setSaving(false);
    }
  };

  const handleDiagnose = () => {
    if (!canDiagnose || saving) return;

    // TODO: 진단 API 연결 후 실제 진단 요청
    setNotice("진단 기능은 API 연결 후 이용할 수 있습니다.");
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
            onChange={(value) => {
              setBasicInfo(value);
              setNotice("");
            }}
            residentialAreas={options.residentialAreas}
          />

          <EducationSection
            educations={educations}
            options={options}
            onSave={(value) => {
              setEducations((prev) => upsert(prev, value));
              setNotice("");
            }}
            onDelete={(id) => {
              setEducations((prev) =>
                prev.filter((item) => item.localId !== id),
              );
              setNotice("");
            }}
          />

          <QualificationSection
            certificates={certificates}
            languageScores={languageScores}
            onSaveCertificate={(value) => {
              setCertificates((prev) => upsert(prev, value));
              setNotice("");
            }}
            onSaveLanguage={(value) => {
              setLanguageScores((prev) => upsert(prev, value));
              setNotice("");
            }}
            onDeleteCertificate={(id) => {
              setCertificates((prev) =>
                prev.filter((item) => item.localId !== id),
              );
              setNotice("");
            }}
            onDeleteLanguage={(id) => {
              setLanguageScores((prev) =>
                prev.filter((item) => item.localId !== id),
              );
              setNotice("");
            }}
          />
        </div>

        <ExperienceSection
          experiences={experiences}
          onSave={(value) => {
            setExperiences((prev) => upsert(prev, value));
            setNotice("");
          }}
          onDelete={(id) => {
            setExperiences((prev) =>
              prev.filter((item) => item.localId !== id),
            );
            setNotice("");
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
        onDiagnose={handleDiagnose}
      />
    </div>
  );
}