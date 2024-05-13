import TransferV2 from "../components/transfer-v2";

export default function Home() {
  return (
    <main className="app-main relative overflow-hidden">
      <div className="fixed bottom-0 left-0 right-0 top-0 z-[-1] flex items-center justify-center">
        <div className="h-[70vw] w-[70vw] rounded-full bg-primary blur-[8rem] lg:h-[65vh] lg:w-[65vh] lg:bg-primary/40" />
      </div>
      <div className="absolute bottom-0 left-0 right-0 top-0 z-[2] overflow-y-auto">
        <div className="page-container flex min-h-full items-start justify-center lg:items-center lg:!pb-10">
          <TransferV2 />
        </div>
      </div>
    </main>
  );
}
