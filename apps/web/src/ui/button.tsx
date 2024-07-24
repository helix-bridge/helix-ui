import { ButtonHTMLAttributes, forwardRef } from "react";

interface Props {
  kind?: "default" | "primary";
  busy?: boolean;
  disabled?: boolean;
}

export default forwardRef<HTMLButtonElement, ButtonHTMLAttributes<HTMLButtonElement> & Props>(function Button(
  { kind, busy, disabled, className, children, ...rest },
  ref,
) {
  return (
    <button
      className={`border-primary relative border transition disabled:cursor-not-allowed ${className} ${
        kind === "primary" ? "bg-primary text-white" : "text-primary bg-transparent"
      } ${busy ? "" : "hover:opacity-80 active:translate-y-1 disabled:translate-y-0 disabled:opacity-60"}`}
      disabled={disabled || busy}
      ref={ref}
      {...rest}
    >
      {busy && (
        <div className="absolute bottom-0 left-0 right-0 top-0 z-10 flex items-center justify-center">
          <div className="h-5 w-5 animate-spin rounded-full border-[3px] border-b-white/50 border-l-white/50 border-r-white border-t-white" />
        </div>
      )}
      {children}
    </button>
  );
});
