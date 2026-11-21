import MatchApp from "@/components/MatchApp";

export default async function Home({ searchParams }: { searchParams: Promise<{ brief?: string }> }) {
  const { brief } = await searchParams;
  return <MatchApp key={brief ?? "new"} initialBriefId={brief ?? null} />;
}
