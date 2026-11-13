type SectionScrollLinkProps = {
  label: string;
  target: string;
  direction?: "up" | "down";
};

export default function SectionScrollLink({
  label,
  target,
  direction = "down",
}: SectionScrollLinkProps) {
  const handleClick = () => {
    document.getElementById(target)?.scrollIntoView({
      behavior: window.matchMedia("(prefers-reduced-motion: reduce)").matches
        ? "instant"
        : "smooth",
    });
  };

  return (
    <button
      type="button"
      onClick={handleClick}
      className="group absolute bottom-5 left-1/2 flex -translate-x-1/2 cursor-pointer flex-col items-center gap-1 whitespace-nowrap text-[10px] text-text-muted transition-colors focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-brand"
    >
      {label}
      <span
        aria-hidden="true"
        className={`text-base transition-transform duration-300 motion-reduce:transition-none ${
          direction === "up"
            ? "group-hover:-translate-y-1"
            : "group-hover:translate-y-1"
        }`}
      >
        {direction === "up" ? "↑" : "↓"}
      </span>
    </button>
  );
}
