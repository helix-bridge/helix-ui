import { Outlet } from "react-router-dom";

export default function Root() {
  return (
    <main className="min-h-screen flex flex-col items-center justify-center gap-5">
      <Outlet />
    </main>
  );
}
