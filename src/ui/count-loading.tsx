interface Props {
  size?: "small" | "large";
  color?: "white" | "primary" | "gray";
}

export default function CountLoading({ size = "small", color = "primary" }: Props) {
  return (
    <div
      className={`inline-flex items-center justify-center ${
        size === "small" ? "h-5 w-5 gap-[4px]" : "h-10 w-10 gap-2"
      }`}
    >
      <div
        className={`inline-block ${
          size === "small" ? "w-[2px] animate-count-loading-small" : "w-[4px] animate-count-loading-large"
        } ${color === "primary" ? "bg-primary" : color === "gray" ? "bg-white/50" : "bg-white"}`}
      />
      <div
        className={`inline-block ${
          size === "small" ? "w-[2px] animate-count-loading-small" : "w-[4px] animate-count-loading-large"
        } ${color === "primary" ? "bg-primary" : color === "gray" ? "bg-white/50" : "bg-white"}`}
        style={{ animationDelay: "120ms" }}
      />
      <div
        className={`inline-block ${
          size === "small" ? "w-[2px] animate-count-loading-small" : "w-[4px] animate-count-loading-large"
        } ${color === "primary" ? "bg-primary" : color === "gray" ? "bg-white/50" : "bg-white"}`}
        style={{ animationDelay: "240ms" }}
      />
    </div>
  );
}
