export default function Transfer() {
  return (
    <main className="app-main relative overflow-hidden">
      <div className="fixed bottom-0 left-0 right-0 top-0 z-[-1] flex items-center justify-center">
        <div className="bg-primary lg:bg-primary/40 h-[70vw] w-[70vw] rounded-full blur-[8rem] lg:h-[65vh] lg:w-[65vh]" />
      </div>
      <div className="absolute bottom-0 left-0 right-0 top-0 z-[2] overflow-y-auto">
        <div className="page-container flex min-h-full items-center justify-center">
          <section className="rounded-large border-primary/30 bg-background/80 px-large py-large w-full max-w-2xl border text-center shadow-2xl backdrop-blur-xl lg:px-16 lg:py-14">
            <div className="bg-primary/15 text-primary mb-large inline-flex rounded-full px-4 py-2 text-xs font-bold uppercase tracking-[0.2em]">
              Service notice
            </div>

            <h1 className="mb-medium text-3xl font-bold text-white lg:text-5xl">Helixbox Bridge has been sunset</h1>

            <p className="mx-auto max-w-xl text-base leading-7 text-white/70 lg:text-lg">
              Helixbox Bridge is no longer available and is no longer maintained. Token transfers are no longer
              supported on this app.
            </p>
            <p className="mt-medium text-base leading-7 text-white/70 lg:text-lg">
              To bridge your tokens, please use Darwinia Bridge.
            </p>

            <a
              href="https://bridge.darwinia.network"
              target="_blank"
              rel="noopener noreferrer"
              className="bg-primary mt-large inline-flex h-12 items-center justify-center rounded-full px-8 text-sm font-bold text-black transition hover:bg-white active:translate-y-1"
            >
              Go to Darwinia Bridge
            </a>
          </section>
        </div>
      </div>
    </main>
  );
}
