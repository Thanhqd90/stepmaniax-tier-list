"use client";

import { useSearchParams, useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import type { ChartRecord, Song } from "@/types/smx";
import {
  getDifficultyLevelCombinations,
  songsToChartRecords,
} from "@/lib/utils";
import { TierBoard } from "@/components/client/TierBoard";

export default function RankContent() {
  const searchParams = useSearchParams();
  const router = useRouter();

  const [allCharts, setAllCharts] = useState<ChartRecord[]>([]);
  const [combos, setCombos] = useState<
    Array<{ difficulty: string; level: number; count: number }>
  >([]);
  const [selectedDifficulty, setSelectedDifficulty] = useState(
    searchParams.get("difficulty") || "",
  );
  const [selectedLevel, setSelectedLevel] = useState(
    parseInt(searchParams.get("level") || "1", 10),
  );

  // Load all charts on mount
  useEffect(() => {
    const loadCharts = async () => {
      try {
        const chartsModule = await import("@/data/smx-charts.json");
        const data = chartsModule.default || chartsModule;
        const songs = (Array.isArray(data) ? data : []) as Song[];
        const charts = songsToChartRecords(songs);
        setAllCharts(charts);

        // Get all unique difficulty/level combinations
        const combosData = getDifficultyLevelCombinations(charts);
        setCombos(combosData);

        // Set initial difficulty if not set
        if (!selectedDifficulty && combosData.length > 0) {
          setSelectedDifficulty(combosData[0].difficulty);
        }
      } catch (error) {
        console.error("Failed to load charts:", error);
      }
    };

    loadCharts();
  }, [selectedDifficulty]);

  // Update URL when selection changes
  const handleSelectionChange = (difficulty: string, level: number) => {
    setSelectedDifficulty(difficulty);
    setSelectedLevel(level);
    router.push(`/rank?difficulty=${difficulty}&level=${level}`);
  };

  // Get unique difficulties and levels from selected options
  const uniqueDifficulties = Array.from(
    new Set(combos.map((c) => c.difficulty)),
  );
  const availableLevels = combos
    .filter((c) => c.difficulty === selectedDifficulty)
    .map((c) => c.level)
    .sort((a, b) => a - b);

  // Filter charts for selected difficulty and level
  const filteredCharts = allCharts.filter((chart) => {
    const difficulty = chart.isPlus ? `${chart.chartType}+` : chart.chartType;
    return difficulty === selectedDifficulty && chart.level === selectedLevel;
  });

  if (combos.length === 0) {
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

  return (
    <div className="h-screen flex flex-col bg-white">
      {/* Selector Header */}
      <div className="bg-white border-b border-gray-200 p-6 flex-shrink-0">
        <div className="max-w-7xl mx-auto">
          <h1 className="text-4xl font-bold mb-6">Rank Charts</h1>

          {/* Difficulty Selector */}
          <div className="mb-6">
            <label className="block text-sm font-medium text-gray-700 mb-3">
              Difficulty
            </label>
            <div className="flex flex-wrap gap-2">
              {uniqueDifficulties.map((difficulty) => (
                <button
                  key={difficulty}
                  onClick={() => {
                    setSelectedDifficulty(difficulty);
                    // Auto-select first available level for this difficulty
                    const firstLevel = combos.find(
                      (c) => c.difficulty === difficulty,
                    )?.level;
                    if (firstLevel) {
                      handleSelectionChange(difficulty, firstLevel);
                    }
                  }}
                  className={`
                    px-4 py-2 rounded font-medium transition-colors text-white
                    ${
                      selectedDifficulty === difficulty
                        ? "bg-blue-600"
                        : "bg-gray-400 hover:bg-gray-500"
                    }
                  `}
                >
                  {difficulty}
                </button>
              ))}
            </div>
          </div>

          {/* Level Selector */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-3">
              Level
            </label>
            <div className="flex flex-wrap gap-2">
              {availableLevels.map((level) => {
                const count = combos.find(
                  (c) =>
                    c.difficulty === selectedDifficulty && c.level === level,
                )?.count;
                return (
                  <button
                    key={level}
                    onClick={() =>
                      handleSelectionChange(selectedDifficulty, level)
                    }
                    className={`
                      px-4 py-2 rounded font-medium transition-colors text-white
                      ${
                        selectedLevel === level
                          ? "bg-green-600"
                          : "bg-gray-400 hover:bg-gray-500"
                      }
                    `}
                  >
                    {level} ({count})
                  </button>
                );
              })}
            </div>
          </div>
        </div>
      </div>

      {/* Tier Board - Takes remaining space */}
      <div className="flex-1 overflow-hidden">
        <TierBoard charts={filteredCharts} />
      </div>
    </div>
  );
}
