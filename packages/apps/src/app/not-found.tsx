import Link from "next/link";

export default function NotFound() {
  return (
    <main className="app-main flex items-center justify-center">
      <div className="gap-middle flex w-fit flex-col items-start">
        <h2 className="text-base font-medium text-white">Not Found !</h2>
        <p className="text-sm font-normal text-white">Could not find requested resource</p>
        <Link href="/" className="text-primary text-sm font-normal hover:underline">
          Return Home
        </Link>
      </div>
    </main>
  );
}
