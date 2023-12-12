import { PropsWithChildren } from "react";

export default function PageWrap({ children }: PropsWithChildren<unknown>) {
  return (
    <main className="app-main">
      <div className="page-container">{children}</div>
    </main>
  );
}
