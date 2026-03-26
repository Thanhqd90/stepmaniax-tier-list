"use client";

import { useEffect, useState } from "react";
import type { ChartRecord, Song } from "@/types/smx";
import { songsToChartRecords } from "@/lib/utils";
import { TierBoard } from "@/components/client/TierBoard";

export default function TierListContent({
  difficulty,
  level,
}: {
  difficulty: string;
  level: string;
}) {
  const [allCharts, setAllCharts] = useState<ChartRecord[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  // Load charts on mount
  useEffect(() => {
    const loadCharts = async () => {
      try {
        const chartsModule = await import("@/data/smx-charts.json");
        const data = chartsModule.default || chartsModule;
        const songs = (Array.isArray(data) ? data : []) as Song[];
        const charts = songsToChartRecords(songs);
        setAllCharts(charts);
      } catch (error) {
        console.error("Failed to load charts:", error);
      } finally {
        setIsLoading(false);
      }
    };

    loadCharts();
  }, []);

  if (isLoading) {
    return (
      <div className="max-w-4xl mx-auto p-6">
        <div className="bg-yellow-50 border border-yellow-200 rounded p-4">
          <h1 className="text-xl font-bold text-yellow-700 mb-2">Loading...</h1>
          <p className="text-yellow-600">
            Please wait while we load your charts.
          </p>
        </div>
      </div>
    );
  }

  // Filter charts for selected difficulty and level
  // Include all charts with matching base type (handles both base and plus variants)
  const filteredCharts = allCharts.filter((chart) => {
    const levelNum = parseInt(level, 10);
    return chart.chartType === difficulty && chart.level === levelNum;
  });

  return (
    <TierBoard
      charts={filteredCharts}
      difficulty={difficulty}
      level={parseInt(level, 10)}
    />
  );
}
