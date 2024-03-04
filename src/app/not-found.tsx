import Link from "next/link";

export default function NotFound() {
  return (
    <main className="app-main flex items-center justify-center">
      <div className="flex w-fit flex-col items-start gap-medium">
        <h2 className="text-base font-medium text-white">Not Found !</h2>
        <p className="text-sm font-normal text-white">Could not find requested resource</p>
        <Link href="/" className="text-sm font-normal text-primary hover:underline">
          Return Home
        </Link>
      </div>
    </main>
  );
}
