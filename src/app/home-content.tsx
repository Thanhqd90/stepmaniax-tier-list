"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import type { ChartRecord, Song } from "@/types/smx";
import {
  getDifficultyLevelCombinations,
  songsToChartRecords,
} from "@/lib/utils";

interface RecentTierList {
  difficulty: string;
  level: number;
  timestamp: number;
}

function formatTimeAgo(timestamp: number): string {
  const now = Date.now();
  const diff = now - timestamp;
  const minutes = Math.floor(diff / 60000);
  const hours = Math.floor(diff / 3600000);
  const days = Math.floor(diff / 86400000);

  if (minutes < 1) return "just now";
  if (minutes < 60) return `${minutes}m ago`;
  if (hours < 24) return `${hours}h ago`;
  if (days < 7) return `${days}d ago`;

  const date = new Date(timestamp);
  return date.toLocaleDateString();
}

function formatDate(timestamp: number): string {
  const date = new Date(timestamp);
  return date.toLocaleDateString(undefined, {
    month: "short",
    day: "numeric",
    year: "numeric",
  });
}

export default function HomeContent() {
  const router = useRouter();

  const [allCharts, setAllCharts] = useState<ChartRecord[]>([]);
  const [combos, setCombos] = useState<
    Array<{ difficulty: string; level: number; count: number }>
  >([]);
  const [selectedDifficulty, setSelectedDifficulty] = useState("");
  const [recentTierLists, setRecentTierLists] = useState<RecentTierList[]>([]);
  const [dataLastUpdated, setDataLastUpdated] = useState<number | null>(null);

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

        // Load recently visited
        try {
          const recent = JSON.parse(
            localStorage.getItem("tierlist-recently-visited") || "[]",
          ) as RecentTierList[];
          setRecentTierLists(recent);
        } catch {
          // Silently fail if there's an issue
        }

        // Update SMX data last updated timestamp
        const now = Date.now();
        localStorage.setItem("smx-data-last-updated", now.toString());
        setDataLastUpdated(now);
      } catch (error) {
        console.error("Failed to load charts:", error);
        // Load existing timestamp if available
        try {
          const timestamp = localStorage.getItem("smx-data-last-updated");
          if (timestamp) {
            setDataLastUpdated(parseInt(timestamp, 10));
          }
        } catch {
          // Silently fail
        }
      }
    };

    loadCharts();
  }, [selectedDifficulty]);

  // Update URL when selection changes
  const handleNavigateToTier = (difficulty: string, level: number) => {
    router.push(`/tier/${difficulty}/${level}`);
  };

  // Get unique difficulties and levels from selected options
  const uniqueDifficulties = Array.from(
    new Set(combos.map((c) => c.difficulty)),
  );

  // Group difficulties by base type (e.g., "easy" and "easy+" -> "easy")
  const groupedDifficulties = Array.from(
    new Set(
      uniqueDifficulties.map((d) => (d.endsWith("+") ? d.slice(0, -1) : d)),
    ),
  ).sort((a, b) => {
    const order = ["beginner", "easy", "hard", "wild", "dual", "full", "team"];
    return (order.indexOf(a) ?? 999) - (order.indexOf(b) ?? 999);
  });

  const availableLevels = Array.from(
    new Set(
      combos
        .filter(
          (c) =>
            c.difficulty === selectedDifficulty ||
            c.difficulty === selectedDifficulty + "+",
        )
        .map((c) => c.level),
    ),
  ).sort((a, b) => a - b);

  // Get display name for a grouped difficulty
  const getDifficultyDisplayName = (baseDifficulty: string) => {
    const hasBase = uniqueDifficulties.includes(baseDifficulty);
    const hasPlus = uniqueDifficulties.includes(baseDifficulty + "+");
    if (hasPlus) {
      return `${baseDifficulty[0].toUpperCase()}${baseDifficulty.slice(1)} (+)`;
    }
    return `${baseDifficulty[0].toUpperCase()}${baseDifficulty.slice(1)}`;
  };

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
    <div className="h-screen flex flex-col bg-gray-950">
      {/* Selector Header */}
      <div className="bg-gray-900 border-b border-gray-800 p-4 md:p-6 flex-shrink-0">
        <div className="max-w-7xl mx-auto">
          <div className="flex justify-between items-start">
            <h1 className="text-2xl md:text-4xl font-bold text-white">
              StepManiaX Tier
            </h1>
            {dataLastUpdated && (
              <div className="text-xs md:text-sm text-gray-400">
                Songs updated: {formatDate(dataLastUpdated)}
              </div>
            )}
          </div>
          <div className="mt-4 md:mt-6"></div>

          {/* Difficulty Selector */}
          <div className="mb-4 md:mb-6">
            <label className="block text-xs md:text-sm font-medium text-gray-200 mb-2 md:mb-3">
              Difficulty
            </label>
            <div className="flex flex-wrap gap-2">
              {groupedDifficulties.map((difficulty) => (
                <button
                  key={difficulty}
                  onClick={() => {
                    setSelectedDifficulty(difficulty);
                  }}
                  className={`
                    px-3 md:px-4 py-1.5 md:py-2 rounded font-medium transition-colors text-white text-sm md:text-base
                    ${
                      selectedDifficulty === difficulty
                        ? "bg-blue-600"
                        : "bg-gray-400 hover:bg-gray-500"
                    }
                  `}
                >
                  {getDifficultyDisplayName(difficulty)}
                </button>
              ))}
            </div>
          </div>

          {/* Level Selector */}
          <div>
            <label className="block text-xs md:text-sm font-medium text-gray-200 mb-2 md:mb-3">
              Level
            </label>
            <div className="flex flex-wrap gap-2">
              {availableLevels.map((level) => {
                // Sum counts from both base and plus variants
                const baseCount =
                  combos.find(
                    (c) =>
                      c.difficulty === selectedDifficulty && c.level === level,
                  )?.count || 0;
                const plusCount =
                  combos.find(
                    (c) =>
                      c.difficulty === selectedDifficulty + "+" &&
                      c.level === level,
                  )?.count || 0;
                const totalCount = baseCount + plusCount;
                return (
                  <button
                    key={level}
                    onClick={() =>
                      handleNavigateToTier(selectedDifficulty, level)
                    }
                    className={`
                      px-3 md:px-4 py-1.5 md:py-2 rounded font-medium transition-colors text-white text-sm md:text-base bg-green-500 hover:bg-green-600
                    `}
                  >
                    {level} ({totalCount})
                  </button>
                );
              })}
            </div>
          </div>

          {/* Recently Visited Tier Lists */}
          {recentTierLists.length > 0 && (
            <div className="mt-6 md:mt-8">
              <label className="block text-xs md:text-sm font-medium text-gray-200 mb-2 md:mb-3">
                Recently Visited
              </label>
              <div className="flex flex-wrap gap-2">
                {recentTierLists.map((item) => (
                  <Link
                    key={`${item.difficulty}-${item.level}`}
                    href={`/tier/${item.difficulty}/${item.level}`}
                    className="px-3 md:px-4 py-1.5 md:py-2 rounded font-medium transition-colors text-white text-sm md:text-base bg-purple-500 hover:bg-purple-600"
                  >
                    {item.difficulty.charAt(0).toUpperCase() +
                      item.difficulty.slice(1)}{" "}
                    {item.level}
                  </Link>
                ))}
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
