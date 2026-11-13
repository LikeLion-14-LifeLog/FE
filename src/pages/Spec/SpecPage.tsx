import { useEffect, useState } from "react";
import { getSpecFormOptions } from "@/apis/spec";
import type { BasicInfo, SpecFormOptions } from "@/types/spec/profile";
import type { Education } from "@/types/spec/education";
import BasicInfoSection from "./components/BasicInfoSection";
import EducationSection from "./components/EducationSection";
import QualificationSection from "./components/QualificationSection";
import ExperienceSection from "./components/ExperienceSection";
import SpecFooter from "./components/SpecFooter";

export default function SpecPage() {
  const [basicInfo, setBasicInfo] = useState<BasicInfo>({
    birthYear: "",
    residenceRegion: "",
    jobId: null,
    jobName: "",
  });
  const [educations, setEducations] = useState<Education[]>([]);
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

  const saveEducation = (education: Education) => {
    setEducations((prev) =>
      prev.some((item) => item.localId === education.localId)
        ? prev.map((item) =>
            item.localId === education.localId ? education : item,
          )
        : [...prev, education],
    );
  };

  const deleteEducation = (localId: number) => {
    setEducations((prev) =>
      prev.filter((item) => item.localId !== localId),
    );
  };

  if (optionsError) {
    return <p role="alert">선택 항목을 불러오지 못했습니다.</p>;
  }

  if (!options) {
    return <p role="status">선택 항목을 불러오는 중입니다.</p>;
  }

  // TODO: GET /api/spec-profile로 기존 스펙 조회 및 서버 PK 유지
  // TODO: PUT 저장 시 자격증·어학·경험을 포함한 전체 목록 전달
  // TODO: 전체 프로필 저장 검증은 검색·저장 기능 구현 시 추가
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
            onSave={saveEducation}
            onDelete={deleteEducation}
            options={options}
          />
          <QualificationSection />
        </div>

        <ExperienceSection />
      </div>

      <SpecFooter />
    </div>
  );
}