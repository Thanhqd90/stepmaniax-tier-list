"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import {
  QuestionMarkCircleIcon,
  TrashIcon,
  StarIcon,
} from "@heroicons/react/24/solid";
import type { ChartRecord, Song } from "@/types/smx";
import {
  getDifficultyLevelCombinations,
  songsToChartRecords,
} from "@/lib/utils";
import { HelpModal } from "@/components/client/HelpModal";

interface RecentTierList {
  difficulty: string;
  level: number;
  timestamp: number;
}

interface FavoriteTierList {
  difficulty: string;
  level: number;
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

// Map difficulties to their in-game colors (close Tailwind equivalents)
function getDifficultyColor(difficulty: string): { bg: string; hover: string } {
  const baseColor = difficulty.endsWith("+")
    ? difficulty.slice(0, -1)
    : difficulty;
  const colorMap: Record<string, { bg: string; hover: string }> = {
    beginner: { bg: "bg-green-500", hover: "hover:bg-green-600" },
    easy: { bg: "bg-amber-500", hover: "hover:bg-amber-600" },
    hard: { bg: "bg-red-700", hover: "hover:bg-red-800" },
    wild: { bg: "bg-purple-700", hover: "hover:bg-purple-800" },
    dual: { bg: "bg-sky-700", hover: "hover:bg-sky-800" },
    full: { bg: "bg-emerald-500", hover: "hover:bg-emerald-600" },
    team: { bg: "bg-pink-600", hover: "hover:bg-pink-700" },
  };
  return (
    colorMap[baseColor] || { bg: "bg-gray-600", hover: "hover:bg-gray-700" }
  );
}

export default function HomeContent() {
  const router = useRouter();

  const [allCharts, setAllCharts] = useState<ChartRecord[]>([]);
  const [combos, setCombos] = useState<
    Array<{ difficulty: string; level: number; count: number }>
  >([]);
  const [selectedDifficulty, setSelectedDifficulty] = useState("");
  const [recentTierLists, setRecentTierLists] = useState<RecentTierList[]>([]);
  const [favoriteTierLists, setFavoriteTierLists] = useState<
    FavoriteTierList[]
  >([]);
  const [dataLastUpdated, setDataLastUpdated] = useState<number | null>(null);
  const [showHelpModal, setShowHelpModal] = useState(false);

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

        // Load favorites
        try {
          const favorites = JSON.parse(
            localStorage.getItem("tierlist-favorites") || "[]",
          ) as FavoriteTierList[];
          setFavoriteTierLists(favorites);
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

  // Show help modal on first visit
  useEffect(() => {
    const hasSeenHelp = localStorage.getItem("help-modal-seen");
    if (!hasSeenHelp) {
      setShowHelpModal(true);
      localStorage.setItem("help-modal-seen", "true");
    }
  }, []);

  // Update URL when selection changes
  const handleNavigateToTier = (difficulty: string, level: number) => {
    router.push(`/tier/${difficulty}/${level}`);
  };

  // Clear recently visited tier lists
  const handleClearRecent = () => {
    if (confirm("Clear all recently visited tier lists?")) {
      localStorage.removeItem("tierlist-recently-visited");
      setRecentTierLists([]);
    }
  };

  // Toggle favorite for a tier list
  const handleToggleFavorite = (difficulty: string, level: number) => {
    const isFavorited = favoriteTierLists.some(
      (f) => f.difficulty === difficulty && f.level === level,
    );

    let updated: FavoriteTierList[];
    if (isFavorited) {
      updated = favoriteTierLists.filter(
        (f) => !(f.difficulty === difficulty && f.level === level),
      );
    } else {
      updated = [...favoriteTierLists, { difficulty, level }];
    }

    setFavoriteTierLists(updated);
    localStorage.setItem("tierlist-favorites", JSON.stringify(updated));
  };

  // Check if a tier list is favorited
  const isFavorited = (difficulty: string, level: number): boolean => {
    return favoriteTierLists.some(
      (f) => f.difficulty === difficulty && f.level === level,
    );
  };

  // Clear all favorites
  const handleClearFavorites = () => {
    if (confirm("Clear all favorite tier lists?")) {
      localStorage.removeItem("tierlist-favorites");
      setFavoriteTierLists([]);
    }
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
    <div className="min-h-screen flex flex-col bg-gray-950">
      {/* Selector Header */}
      <div className="bg-gray-900 border-b border-gray-800 p-4 md:p-6 flex-shrink-0">
        <div className="flex justify-between items-start gap-4">
          <h1 className="text-2xl md:text-4xl font-bold text-white">
            StepManiaX Tier List Maker
          </h1>
          <div className="flex flex-col items-end gap-2">
            <button
              onClick={() => setShowHelpModal(true)}
              className="px-4 py-2 bg-yellow-600 text-white rounded hover:bg-yellow-700 font-medium text-sm hover:scale-105 transition-transform flex items-center gap-2 cursor-pointer"
              title="Show help and instructions"
            >
              <QuestionMarkCircleIcon className="w-4 h-4" />
              Help
            </button>
            {dataLastUpdated && (
              <div className="text-xs md:text-sm text-gray-400">
                Songs updated: {formatDate(dataLastUpdated)}
              </div>
            )}
          </div>
        </div>
        <div className="mt-4 md:mt-6"></div>

        {/* Difficulty Selector */}
        <div className="mb-4 md:mb-6">
          <label className="block text-xs md:text-sm font-medium text-gray-200 mb-2 md:mb-3">
            Difficulty
          </label>
          <div className="flex flex-wrap gap-2">
            {groupedDifficulties.map((difficulty) => {
              const { bg, hover } = getDifficultyColor(difficulty);
              return (
                <button
                  key={difficulty}
                  onClick={() => {
                    setSelectedDifficulty(difficulty);
                  }}
                  className={`
                      px-3 md:px-4 py-1.5 md:py-2 rounded font-medium transition-colors text-sm md:text-base cursor-pointer
                      ${
                        selectedDifficulty === difficulty
                          ? `${bg} ${hover} ${difficulty === "easy" ? "text-white" : "text-white"}`
                          : "bg-gray-600 hover:bg-gray-700 text-white"
                      }
                    `}
                >
                  {getDifficultyDisplayName(difficulty)}
                </button>
              );
            })}
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
              const { bg, hover } = getDifficultyColor(selectedDifficulty);
              return (
                <button
                  key={level}
                  onClick={() =>
                    handleNavigateToTier(selectedDifficulty, level)
                  }
                  className={`
                      px-3 md:px-4 py-1.5 md:py-2 rounded font-medium transition-colors text-sm md:text-base ${bg} ${hover} text-white cursor-pointer
                    `}
                >
                  {level} ({totalCount})
                </button>
              );
            })}
          </div>
        </div>

        {/* Favorites Tier Lists */}
        {favoriteTierLists.length > 0 && (
          <div className="mt-6 md:mt-8">
            <div className="flex justify-between items-center mb-2 md:mb-3">
              <label className="block text-xs md:text-sm font-medium text-gray-200">
                ★ Favorites
              </label>
              <button
                onClick={handleClearFavorites}
                className="px-2 py-1 text-xs md:text-sm text-red-400 hover:text-red-300 hover:bg-red-950/30 rounded transition-colors flex items-center gap-1 cursor-pointer"
                title="Clear all favorites"
              >
                <TrashIcon className="w-3 h-3 md:w-4 md:h-4" />
                Clear
              </button>
            </div>
            <div className="flex flex-wrap gap-2">
              {favoriteTierLists.map((item) => {
                const { bg, hover } = getDifficultyColor(item.difficulty);
                return (
                  <div
                    key={`${item.difficulty}-${item.level}`}
                    className="relative group"
                  >
                    <Link
                      href={`/tier/${item.difficulty}/${item.level}`}
                      className={`px-3 md:px-4 py-1.5 md:py-2 rounded font-medium transition-colors text-sm md:text-base ${bg} ${hover} text-white cursor-pointer`}
                    >
                      {item.difficulty.charAt(0).toUpperCase() +
                        item.difficulty.slice(1)}{" "}
                      {item.level}
                    </Link>
                    <button
                      onClick={() =>
                        handleToggleFavorite(item.difficulty, item.level)
                      }
                      className="absolute -top-2 -right-2 opacity-0 group-hover:opacity-100 transition-opacity bg-red-600 hover:bg-red-700 text-white rounded-full w-5 h-5 flex items-center justify-center text-xs font-bold cursor-pointer"
                      title="Remove from favorites"
                    >
                      ✕
                    </button>
                  </div>
                );
              })}
            </div>
          </div>
        )}

        {/* Recently Visited Tier Lists */}
        {recentTierLists.length > 0 && (
          <div className="mt-6 md:mt-8">
            <div className="flex justify-between items-center mb-2 md:mb-3">
              <label className="block text-xs md:text-sm font-medium text-gray-200">
                Recently Visited
              </label>
              <button
                onClick={handleClearRecent}
                className="px-2 py-1 text-xs md:text-sm text-red-400 hover:text-red-300 hover:bg-red-950/30 rounded transition-colors flex items-center gap-1 cursor-pointer"
                title="Clear recently visited"
              >
                <TrashIcon className="w-3 h-3 md:w-4 md:h-4" />
                Clear
              </button>
            </div>
            <div className="flex flex-wrap gap-2">
              {recentTierLists.map((item) => {
                const { bg, hover } = getDifficultyColor(item.difficulty);
                return (
                  <Link
                    key={`${item.difficulty}-${item.level}`}
                    href={`/tier/${item.difficulty}/${item.level}`}
                    className={`px-3 md:px-4 py-1.5 md:py-2 rounded font-medium transition-colors text-sm md:text-base ${bg} ${hover} text-white cursor-pointer`}
                  >
                    {item.difficulty.charAt(0).toUpperCase() +
                      item.difficulty.slice(1)}{" "}
                    {item.level}
                  </Link>
                );
              })}
            </div>
          </div>
        )}
      </div>

      {/* Help Modal */}
      <HelpModal
        isOpen={showHelpModal}
        onClose={() => setShowHelpModal(false)}
      />
    </div>
  );
}
