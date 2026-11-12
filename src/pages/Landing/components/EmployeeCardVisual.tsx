export default function EmployeeCardVisual() {
  return (
    <div className="relative flex h-[390px] w-[390px] items-center justify-center">
      <div className="absolute inset-0 rounded-full bg-[radial-gradient(circle,rgba(39,184,162,0.09),transparent_70%)]" />

      <div className="absolute inset-0 rounded-full border border-brand/10" />
      <div className="absolute inset-[48px] rounded-full border border-brand/10" />

      <span className="absolute top-[20%] left-[10%] h-2 w-2 rounded-full bg-brand/70 ring-[6px] ring-brand/10" />
      <span className="absolute top-[38%] right-[12%] h-2 w-2 rounded-full bg-brand/70 ring-[6px] ring-brand/10" />
      <span className="absolute bottom-[9%] left-[38%] h-2 w-2 rounded-full bg-brand/70 ring-[6px] ring-brand/10" />

      <img
        src="/employeeCard.svg"
        alt="LifeLog 사원증 일러스트"
        className="relative z-10 w-[190px]"
      />
    </div>
  );
}
