import type { ChartRecord } from "@/types/smx";
import TierBoardServer from "@/components/server/TierBoardServer";

interface LevelPageProps {
  params: Promise<{ level: string }>;
}

export async function generateStaticParams() {
  return Array.from({ length: 28 }, (_, i) => ({
    level: String(i + 1),
  }));
}

export async function generateMetadata({ params }: LevelPageProps) {
  const { level } = await params;
  return {
    title: `Level ${level} Tier List - StepManiaX`,
    description: `Create a tier list for StepManiaX level ${level} charts`,
  };
}

export default async function LevelPage({ params }: LevelPageProps) {
  const { level } = await params;
  const levelNum = parseInt(level, 10);

  if (isNaN(levelNum) || levelNum < 1 || levelNum > 28) {
    return (
      <div className="max-w-4xl mx-auto p-6">
        <div className="bg-red-50 border border-red-200 rounded p-4">
          <h1 className="text-xl font-bold text-red-700 mb-2">Invalid Level</h1>
          <p className="text-red-600">
            Level must be between 1 and 28. You requested level {level}.
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <main className="py-8">
        <TierBoardServer levelFilter={levelNum} />
      </main>
    </div>
  );
}
