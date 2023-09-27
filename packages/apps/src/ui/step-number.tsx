interface Props {
  number: number;
}

export default function StepNumber({ number }: Props) {
  return (
    <div className="inline-flex h-10 w-10 items-center justify-center">
      <span className="text-xl font-bold text-white">{number}</span>
    </div>
  );
}
