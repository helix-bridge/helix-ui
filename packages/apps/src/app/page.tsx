import Link from "next/link";

export default function Home() {
  return (
    <main className="relative">
      <div className="home-page-bg absolute bottom-0 left-0 right-0 top-0 -z-10" />

      <Link href="/apps">Apps 👉</Link>
      <p>Apps Page</p>
    </main>
  );
}
