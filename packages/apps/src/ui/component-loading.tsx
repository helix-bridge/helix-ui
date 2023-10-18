import CountLoading from "@/ui/count-loading";

interface Props {
  loading: boolean;
  className?: string;
}

export default function ComponentLoading({ loading, className }: Props) {
  return (
    loading && (
      <div
        className={`absolute bottom-0 left-0 right-0 top-0 z-10 flex items-center justify-center bg-black/30 ${className}`}
      >
        <CountLoading size="large" />
      </div>
    )
  );
}
