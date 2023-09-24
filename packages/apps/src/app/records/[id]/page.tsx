import RecordDetail from "@/components/record-detail";

interface Props {
  params: {
    id: string;
  };
}

export default function Record({ params }: Props) {
  return (
    <main className="app-main">
      <div className="px-middle container mx-auto">
        <RecordDetail id={params.id} />
      </div>
    </main>
  );
}
