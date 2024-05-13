interface Props {
  step: number;
  title: string;
}

export default function StepTitle({ step, title }: Props) {
  return (
    <div className="flex items-center gap-medium">
      <div className="inline-flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-primary">
        <span className="text-xl font-bold text-white">{step}</span>
      </div>
      <h5 className="text-lg font-bold text-white">{title}</h5>
    </div>
  );
}
