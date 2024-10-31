import CountLoading from "../ui/count-loading";

interface Props {
  loading?: boolean;
  size?: "small" | "large";
  color?: "white" | "primary" | "gray";
  className?: string;
  icon?: JSX.Element | boolean;
}

export default function ComponentLoading({ loading, color, size = "large", icon = true, className }: Props) {
  return (
    loading && (
      <div className={`absolute bottom-0 left-0 right-0 top-0 z-10 flex items-center justify-center ${className}`}>
        {icon === true ? <CountLoading size={size} color={color} /> : icon ?? null}
      </div>
    )
  );
}
