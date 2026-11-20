import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import {
  getSpecFormOptions,
  getSpecProfile,
  saveSpecProfile,
  saveSpecProfileMock,
  type SpecProfileDraft,
} from "@/apis/spec";
import {
  ANALYSIS_ALREADY_RUNNING,
  getLatestDiagnosisRunId,
  startDiagnosis,
} from "@/apis/diagnosis";
import { toApiError } from "@/apis/client";
import { getAccessToken, useCurrentUser } from "@/store/authStore";
import { saveDefaultCareerJobOnce } from "@/store/defaultCareerJobStore";
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
  basicInfo: { birthYear: "", residenceRegion: "", jobId: null, jobName: "" },
  educations: [],
  certificates: [],
  languageScores: [],
  experiences: [],
});

function SpecFormPage({ email }: { email: string | undefined }) {
  const navigate = useNavigate();
  const [profile, setProfile] = useState<SpecProfileDraft>(emptyProfile);
  const [options, setOptions] = useState<SpecFormOptions | null>(null);
  const [optionsError, setOptionsError] = useState(false);
  const [saving, setSaving] = useState(false);
  const [notice, setNotice] = useState("");
  const [editingEducation, setEditingEducation] = useState(false);
  const [editingQualification, setEditingQualification] = useState(false);
  const [editingExperience, setEditingExperience] = useState(false);

  useEffect(() => {
    let active = true;

    const loadProfile = async () => {
      try {
        const accessToken = (
          getAccessToken() ?? localStorage.getItem("accessToken")
        )?.trim();

        if (!accessToken) {
          throw new Error("스펙 조회에 필요한 인증 토큰이 없습니다.");
        }

        const [formOptions, savedProfile] = await Promise.all([
          getSpecFormOptions(accessToken),
          getSpecProfile(accessToken),
        ]);

        if (!active) return;

        if (savedProfile) setProfile(savedProfile);
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

  /** 처음 등록한 희망 직무를 커리어 경로 출발 직업 기본값으로 저장 */
  const rememberFirstJob = (userEmail: string) =>
    saveDefaultCareerJobOnce(userEmail, {
      jobId: basicInfo.jobId,
      code: basicInfo.jobCode,
      name: basicInfo.jobName,
    });

  /** 서버(CURRENT 스펙)에 저장한 뒤, 서버가 매긴 항목 PK를 다시 받아 둔다 */
  const saveToServer = async () => {
    const accessToken = (
      getAccessToken() ?? localStorage.getItem("accessToken")
    )?.trim();
    if (!accessToken) throw new Error("로그인이 필요합니다.");
    await saveSpecProfile(profile, accessToken);
    const saved = await getSpecProfile(accessToken).catch(() => null);
    if (saved) setProfile(saved);
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

    setSaving(true);
    setNotice("");

    try {
      await saveToServer();
      await saveSpecProfileMock(profile, email);
      rememberFirstJob(email);
      setNotice("임시 저장되었습니다.");
    } catch (error: unknown) {
      setNotice(
        error instanceof Error && error.message
          ? `저장에 실패했습니다. ${error.message}`
          : "저장에 실패했습니다. 다시 시도해 주세요."
      );
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

    setSaving(true);
    setNotice("");

    try {
      await saveToServer();
      await saveSpecProfileMock(profile, email);
      rememberFirstJob(email);
      const run = await startDiagnosis();
      navigate(`/diagnosis/loading?runId=${run.runId}`);
    } catch (error: unknown) {
      const { message } = toApiError(error);
      const code =
        toApiError(error).code ?? (error as { code?: string } | null)?.code;
      // 이미 진행 중인 분석이 있으면(스펙 저장도 409 로 거절됨) 그 진행 화면으로 보낸다
      if (code === ANALYSIS_ALREADY_RUNNING) {
        const runId = await getLatestDiagnosisRunId().catch(() => null);
        if (runId !== null) {
          navigate(`/diagnosis/loading?runId=${runId}`);
          return;
        }
      }
      setNotice(
        message
          ? `분석을 시작하지 못했습니다. ${message}`
          : error instanceof Error && error.message
          ? `분석을 시작하지 못했습니다. ${error.message}`
          : "분석을 시작하지 못했습니다. 다시 시도해 주세요."
      );
    } finally {
      setSaving(false);
    }
  };

  if (optionsError)
    return <p role="alert">스펙 등록 정보를 불러오지 못했습니다.</p>;
  if (!options) return <p role="status">스펙 등록 정보를 불러오는 중입니다.</p>;

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
