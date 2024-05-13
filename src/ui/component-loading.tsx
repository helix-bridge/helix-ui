import CountLoading from "@/ui/count-loading";

interface Props {
  loading?: boolean;
  size?: "small" | "large";
  color?: "white" | "primary" | "gray";
  className?: string;
}

export default function ComponentLoading({ loading, color, size = "large", className }: Props) {
  return (
    loading && (
      <div className={`absolute bottom-0 left-0 right-0 top-0 z-10 flex items-center justify-center ${className}`}>
        <CountLoading size={size} color={color} />
      </div>
    )
  );
}
