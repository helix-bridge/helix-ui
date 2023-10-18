interface Props {
  number: number;
}

export default function StepNumber({ number }: Props) {
  return (
    <div className="bg-primary inline-flex h-10 w-10 shrink-0 items-center justify-center rounded-full">
      <span className="text-xl font-bold text-white">{number}</span>
    </div>
  );
}
