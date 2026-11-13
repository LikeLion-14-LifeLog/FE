import BasicInfoSection from "./components/BasicInfoSection";
import EducationSection from "./components/EducationSection";
import QualificationSection from "./components/QualificationSection";
import ExperienceSection from "./components/ExperienceSection";
import SpecFooter from "./components/SpecFooter";

export default function SpecPage() {
  return (
    <div className="w-full pb-28">
      <div className="mb-6 border-t border-border-strong" />

      <div className="grid gap-8 lg:grid-cols-2">
        <div className="space-y-8 lg:border-r lg:border-border lg:pr-8">
          <BasicInfoSection />
          <EducationSection />
          <QualificationSection />
        </div>

        <ExperienceSection />
      </div>

      <SpecFooter />
    </div>
  );
}
