export default function InputAlert({ text }: { text: string }) {
  return (
    <div className="absolute -bottom-[1.2rem] left-0 inline-flex w-full">
      <span className="text-app-red text-xs font-medium">{text}</span>
    </div>
  );
}
