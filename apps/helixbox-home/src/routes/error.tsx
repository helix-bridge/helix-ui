import { useRouteError } from "react-router-dom";

export default function Error() {
  const error = useRouteError() as { statusText?: string; message?: string };
  // console.error(error);

  return (
    <main className="app-main flex flex-col items-center justify-center gap-5">
      <h1 className="font-bold">Oops!</h1>
      <p>Sorry, an unexpected error has occurred.</p>
      <p>
        <i className="text-sm">{error.statusText || error.message}</i>
      </p>
    </main>
  );
}
