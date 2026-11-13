import { useEffect, useState } from "react";
import { getSpecFormOptions } from "@/apis/spec";
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

  if (optionsError) {
    return <p role="alert">선택 항목을 불러오지 못했습니다.</p>;
  }

  if (!options) {
    return <p role="status">선택 항목을 불러오는 중입니다.</p>;
  }

  // TODO: GET /api/spec-profile로 기존 데이터 및 서버 PK 초기화
  // TODO: PUT /api/spec-profiles/current/temporary 연동 시 전체 목록 전송
  // TODO: API 저장 전 검색 결과 ID와 요청 DTO 검증
  return (
    <div className="w-full pb-28">
      <div className="mb-6 border-t border-border-strong" />

      <div className="grid gap-8 lg:grid-cols-2">
        <div className="space-y-8 lg:border-r lg:border-border lg:pr-8">
          <BasicInfoSection
            value={basicInfo}
            onChange={setBasicInfo}
            residentialAreas={options.residentialAreas}
          />

          <EducationSection
            educations={educations}
            onSave={(value) =>
              setEducations((prev) => upsert(prev, value))
            }
            onDelete={(id) =>
              setEducations((prev) =>
                prev.filter((item) => item.localId !== id),
              )
            }
            options={options}
          />

          <QualificationSection
            certificates={certificates}
            languageScores={languageScores}
            onSaveCertificate={(value) =>
              setCertificates((prev) => upsert(prev, value))
            }
            onSaveLanguage={(value) =>
              setLanguageScores((prev) => upsert(prev, value))
            }
            onDeleteCertificate={(id) =>
              setCertificates((prev) =>
                prev.filter((item) => item.localId !== id),
              )
            }
            onDeleteLanguage={(id) =>
              setLanguageScores((prev) =>
                prev.filter((item) => item.localId !== id),
              )
            }
          />
        </div>

        <ExperienceSection
          experiences={experiences}
          onSave={(value) =>
            setExperiences((prev) => upsert(prev, value))
          }
          onDelete={(id) =>
            setExperiences((prev) =>
              prev.filter((item) => item.localId !== id),
            )
          }
        />
      </div>

      <SpecFooter />
    </div>
  );
}