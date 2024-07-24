interface Props {
  step: number;
  title: string;
}

export default function StepTitle({ step, title }: Props) {
  return (
    <div className="gap-medium flex items-center">
      <div className="bg-primary inline-flex h-10 w-10 shrink-0 items-center justify-center rounded-full">
        <span className="text-xl font-bold text-white">{step}</span>
      </div>
      <h5 className="text-lg font-bold text-white">{title}</h5>
    </div>
  );
}
