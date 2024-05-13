import { PropsWithChildren } from "react";

export default function NotifyLink({ href, children }: PropsWithChildren<{ href: string }>) {
  return (
    <a target="_blank" rel="noopener" className="break-all text-primary hover:underline" href={href}>
      {children}
    </a>
  );
}
