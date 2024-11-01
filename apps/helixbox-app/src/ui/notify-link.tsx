import { PropsWithChildren } from "react";

export default function NotifyLink({ href, children }: PropsWithChildren<{ href: string }>) {
  return (
    <a target="_blank" rel="noopener" className="text-primary break-all hover:underline" href={href}>
      {children}
    </a>
  );
}
