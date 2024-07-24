import { InputHTMLAttributes, forwardRef } from "react";

interface Props {}

export default forwardRef<HTMLInputElement, InputHTMLAttributes<HTMLInputElement> & Props>(function Input(
  { className, ...rest },
  ref,
) {
  return (
    <input className={`focus-visible:outline-none disabled:cursor-not-allowed ${className}`} ref={ref} {...rest} />
  );
});
