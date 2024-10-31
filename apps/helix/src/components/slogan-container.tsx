export default function SloganContainer({ children, className }: { children: React.ReactNode; className?: string }) {
  return (
    <div className={`relative flex flex-col items-center ${className}`}>
      <div className="absolute left-0 top-0 h-full w-full rounded-[50%] bg-[#008CFF]/30 blur-[100px]" />
      {children}
    </div>
  );
}
