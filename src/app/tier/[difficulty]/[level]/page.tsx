import { Suspense } from "react";
import type { Song } from "@/types/smx";
import TierListContent from "./tier-content";

export async function generateStaticParams(): Promise<
  Array<{ difficulty: string; level: string }>
> {
  try {
    const chartsModule = await import("@/data/smx-charts.json");
    const data = chartsModule.default || chartsModule;
    const songs = Array.isArray(data) ? data : [];

    // Get all unique difficulty/level combinations from nested charts
    const combos = new Map<string, Set<number>>();
    songs.forEach((song: any) => {
      song.charts.forEach((chart: any) => {
        const difficulty = chart.isPlus
          ? `${chart.chartType}+`
          : chart.chartType;
        if (!combos.has(difficulty)) {
          combos.set(difficulty, new Set());
        }
        combos.get(difficulty)!.add(chart.level);
      });
    });

    // Convert to params array
    const params: Array<{ difficulty: string; level: string }> = [];
    combos.forEach((levels, difficulty) => {
      levels.forEach((level) => {
        params.push({
          difficulty,
          level: level.toString(),
        });
      });
    });

    return params;
  } catch (error) {
    console.error("Failed to generate static params:", error);
    return [];
  }
}

export default async function TierListPage({
  params,
}: {
  params: Promise<{ difficulty: string; level: string }>;
}) {
  const { difficulty, level } = await params;
  return (
    <Suspense
      fallback={
        <div className="max-w-4xl mx-auto p-6">
          <div className="bg-yellow-50 border border-yellow-200 rounded p-4">
            <h1 className="text-xl font-bold text-yellow-700 mb-2">
              Loading...
            </h1>
            <p className="text-yellow-600">
              Please wait while we load your tier list.
            </p>
          </div>
        </div>
      }
    >
      <TierListContent difficulty={difficulty} level={level} />
    </Suspense>
  );
}
