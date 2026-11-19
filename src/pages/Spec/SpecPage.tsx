import { useEffect, useState } from "react";
import {
  getSpecFormOptions,
  getSpecProfile,
  saveSpecProfile,
  type SpecProfileDraft,
} from "@/apis/spec";
import { getAccessToken, useCurrentUser } from "@/store/authStore";
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
    ? items.map((item) => (item.localId === value.localId ? value : item))
    : [...items, value];

const emptyProfile = (): SpecProfileDraft => ({
  basicInfo: {
    birthYear: "",
    residenceRegion: "",
    jobId: null,
    jobName: "",
  },
  educations: [],
  certificates: [],
  languageScores: [],
  experiences: [],
});

function SpecFormPage() {
  const [profile, setProfile] = useState<SpecProfileDraft>(emptyProfile);
  const [options, setOptions] = useState<SpecFormOptions | null>(null);
  const [optionsError, setOptionsError] = useState(false);
  const [saving, setSaving] = useState(false);
  const [needsReload, setNeedsReload] = useState(false);
  const [notice, setNotice] = useState("");
  const [editingEducation, setEditingEducation] = useState(false);
  const [editingQualification, setEditingQualification] = useState(false);
  const [editingExperience, setEditingExperience] = useState(false);

  useEffect(() => {
    let active = true;

    const loadProfile = async () => {
      try {
        const accessToken = getAccessToken();

        if (!accessToken) {
          throw new Error("스펙 조회에 필요한 인증 토큰이 없습니다.");
        }

        const [formOptions, savedProfile] = await Promise.all([
          getSpecFormOptions(accessToken),
          getSpecProfile(accessToken),
        ]);

        if (!active) return;

        setProfile(savedProfile);
        setOptions(formOptions);
      } catch (error: unknown) {
        if (!active) return;

        console.error("스펙 등록 정보 조회 실패", error);
        setOptionsError(true);
      }
    };

    void loadProfile();

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
    if (saving || needsReload) return;

    if (hasPendingEdits) {
      setNotice("작성 중인 항목을 저장하거나 취소한 뒤 저장해 주세요.");
      return;
    }

    if (!canDiagnose) {
      setNotice("필수 정보와 입력한 항목을 확인해 주세요.");
      return;
    }

    setSaving(true);
    setNotice("");

    let saved = false;

    try {
      const accessToken = getAccessToken();

      if (!accessToken) {
        throw new Error("스펙 저장에 필요한 인증 토큰이 없습니다.");
      }

      await saveSpecProfile(profile, accessToken);
      saved = true;

      const savedProfile = await getSpecProfile(accessToken);

      setProfile(savedProfile);
      setNotice("스펙이 저장되었습니다.");
    } catch (error: unknown) {
      console.error("스펙 저장 처리 실패", error);

      if (saved) {
        setNeedsReload(true);
        setNotice(
          "저장은 완료됐지만 최신 정보를 불러오지 못했습니다. 새로고침해 주세요."
        );
      } else {
        setNotice(
          error instanceof Error
            ? error.message
            : "저장에 실패했습니다. 다시 시도해 주세요."
        );
      }
    } finally {
      setSaving(false);
    }
  };

  const handleDiagnose = () => {
    if (saving || needsReload) return;

    setNotice(
      "진단 기능은 API 연동 준비 중입니다. 프로필 저장을 먼저 이용해 주세요."
    );
  };

  if (optionsError) {
    return <p role="alert">스펙 등록 정보를 불러오지 못했습니다.</p>;
  }

  if (!options) {
    return <p role="status">스펙 등록 정보를 불러오는 중입니다.</p>;
  }

  return (
    <div className="w-full pb-28">
      <div className="mb-6 border-t border-border-strong" />

      <fieldset disabled={saving || needsReload} className="contents">
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
              onSave={(value) =>
                update({ educations: upsert(educations, value) })
              }
              onDelete={(id) =>
                update({
                  educations: educations.filter((item) => item.localId !== id),
                })
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
                update({
                  certificates: certificates.filter(
                    (item) => item.localId !== id
                  ),
                })
              }
              onDeleteLanguage={(id) =>
                update({
                  languageScores: languageScores.filter(
                    (item) => item.localId !== id
                  ),
                })
              }
            />
          </div>

          <ExperienceSection
            experiences={experiences}
            onEditingChange={setEditingExperience}
            onSave={(value) =>
              update({ experiences: upsert(experiences, value) })
            }
            onDelete={(id) =>
              update({
                experiences: experiences.filter((item) => item.localId !== id),
              })
            }
          />
        </div>
      </fieldset>

      {notice && (
        <p role="status" className="mt-5 text-[12px] text-text-secondary">
          {notice}
        </p>
      )}

      <SpecFooter
        saving={saving || needsReload}
        canDiagnose={canDiagnose && !needsReload}
        onSave={handleSave}
        onDiagnose={handleDiagnose}
      />
    </div>
  );
}

export default function SpecPage() {
  const email = useCurrentUser()?.email;

  return <SpecFormPage key={email ?? "guest"} />;
}
