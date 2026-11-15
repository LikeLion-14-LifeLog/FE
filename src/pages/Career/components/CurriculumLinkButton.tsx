import CareerIcon from "./CareerIcon";

type CurriculumLinkButtonProps = {
  label?: string;
  onClick?: () => void;
  disabled?: boolean;
  className?: string;
};

const CurriculumLinkButton = ({
  label = "이 경로 상세 분석 커리큘럼 보기",
  onClick,
  disabled = false,
  className = "",
}: CurriculumLinkButtonProps) => {
  return (
    <button
      type="button"
      onClick={onClick}
      disabled={disabled}
      className={`flex h-12 w-[440px] cursor-pointer items-center disabled:cursor-not-allowed disabled:opacity-40 justify-center gap-3 rounded-[8px] bg-teal-600 text-[13.5px] leading-5 font-extrabold text-white ${className}`}
    >
      {label}
      <CareerIcon name="whiteArrow" />
    </button>
  );
};

export default CurriculumLinkButton;
