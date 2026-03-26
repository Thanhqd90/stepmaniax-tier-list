"use client";

import { useCallback, useMemo, useState } from "react";
import type { ChartRecord, FilterState } from "@/types/smx";
import {
  getUniqueDifficulties,
  getUniqueLevels,
  getUniqueTags,
} from "@/lib/utils";

interface FilterBarProps {
  charts: ChartRecord[];
  filters: FilterState;
  onFiltersChange: (filters: FilterState) => void;
}

// Grouped difficulty mappings
const DIFFICULTY_GROUPS = {
  "Easy (+)": ["easy", "easy+"],
  "Hard (+)": ["hard", "hard+"],
  "Dual (+)": ["dual", "dual+"],
  "Full (+)": ["full", "full+"],
};

const ALL_DIFFICULTIES = [
  "beginner",
  "easy",
  "easy+",
  "hard",
  "hard+",
  "wild",
  "dual",
  "dual+",
  "full",
  "full+",
  "team",
];

/**
 * Enhanced filter bar with grouped and individual difficulty filters
 */
export function FilterBar({
  charts,
  filters,
  onFiltersChange,
}: FilterBarProps) {
  const [expandDifficulties, setExpandDifficulties] = useState(true);
  const levels = useMemo(() => getUniqueLevels(charts), [charts]);
  const tags = useMemo(() => getUniqueTags(charts), [charts]);

  // Count charts by difficulty
  const difficultyStats = useMemo(() => {
    const stats: Record<string, number> = {};
    charts.forEach((chart) => {
      const key = chart.isPlus ? `${chart.chartType}+` : chart.chartType;
      stats[key] = (stats[key] ?? 0) + 1;
    });
    return stats;
  }, [charts]);

  const handleDifficultyToggle = useCallback(
    (difficulty: string) => {
      const newDifficulties = filters.selectedDifficulties.includes(difficulty)
        ? filters.selectedDifficulties.filter((d) => d !== difficulty)
        : [...filters.selectedDifficulties, difficulty];

      onFiltersChange({ ...filters, selectedDifficulties: newDifficulties });
    },
    [filters, onFiltersChange],
  );

  const handleGroupToggle = useCallback(
    (group: string) => {
      const difficulties =
        DIFFICULTY_GROUPS[group as keyof typeof DIFFICULTY_GROUPS] || [];

      // Check if all in group are selected
      const allSelected = difficulties.every((d) =>
        filters.selectedDifficulties.includes(d),
      );

      let newDifficulties: string[];
      if (allSelected) {
        // Deselect all in group
        newDifficulties = filters.selectedDifficulties.filter(
          (d) => !difficulties.includes(d),
        );
      } else {
        // Select all in group
        newDifficulties = Array.from(
          new Set([...filters.selectedDifficulties, ...difficulties]),
        );
      }

      onFiltersChange({ ...filters, selectedDifficulties: newDifficulties });
    },
    [filters, onFiltersChange],
  );

  const handleLevelToggle = useCallback(
    (level: number) => {
      const newLevels = filters.levels.includes(level)
        ? filters.levels.filter((l) => l !== level)
        : [...filters.levels, level];
      onFiltersChange({ ...filters, levels: newLevels });
    },
    [filters, onFiltersChange],
  );

  const handleTagToggle = useCallback(
    (tag: string) => {
      const newTags = filters.tags.includes(tag)
        ? filters.tags.filter((t) => t !== tag)
        : [...filters.tags, tag];
      onFiltersChange({ ...filters, tags: newTags });
    },
    [filters, onFiltersChange],
  );

  return (
    <div className="bg-white rounded-lg shadow p-4 space-y-4">
      {/* Search Input */}
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-2">
          Search
        </label>
        <input
          type="text"
          placeholder="Search by title or artist..."
          value={filters.searchQuery}
          onChange={(e) =>
            onFiltersChange({ ...filters, searchQuery: e.target.value })
          }
          className="w-full px-3 py-2 border border-gray-300 rounded-md text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
        />
      </div>

      {/* Difficulty Filter */}
      <div>
        <div
          onClick={() => setExpandDifficulties(!expandDifficulties)}
          className="block text-sm font-medium text-gray-700 mb-2 cursor-pointer hover:text-gray-900"
        >
          Difficulty {expandDifficulties ? "▼" : "▶"}
        </div>

        {expandDifficulties && (
          <div className="space-y-3">
            {/* Grouped Difficulties */}
            <div>
              <p className="text-xs text-gray-600 mb-2">Grouped Filters</p>
              <div className="flex flex-wrap gap-2">
                {Object.entries(DIFFICULTY_GROUPS).map(([group, _]) => {
                  const difficulties =
                    DIFFICULTY_GROUPS[
                      group as keyof typeof DIFFICULTY_GROUPS
                    ] || [];
                  const allSelected = difficulties.every((d) =>
                    filters.selectedDifficulties.includes(d),
                  );

                  return (
                    <button
                      key={group}
                      onClick={() => handleGroupToggle(group)}
                      className={`
                        px-3 py-1 rounded text-xs font-medium transition-colors
                        ${
                          allSelected
                            ? "bg-purple-500 text-white"
                            : "bg-gray-200 text-gray-700 hover:bg-gray-300"
                        }
                      `}
                    >
                      {group}
                    </button>
                  );
                })}
              </div>
            </div>

            {/* Individual Difficulties */}
            <div>
              <p className="text-xs text-gray-600 mb-2">Individual</p>
              <div className="flex flex-wrap gap-2">
                {ALL_DIFFICULTIES.map((difficulty) => {
                  const count = difficultyStats[difficulty] ?? 0;
                  if (count === 0) return null;

                  return (
                    <button
                      key={difficulty}
                      onClick={() => handleDifficultyToggle(difficulty)}
                      className={`
                        px-3 py-1 rounded text-xs font-medium transition-colors
                        ${
                          filters.selectedDifficulties.includes(difficulty)
                            ? "bg-blue-500 text-white"
                            : "bg-gray-200 text-gray-700 hover:bg-gray-300"
                        }
                      `}
                    >
                      {difficulty} ({count})
                    </button>
                  );
                })}
              </div>
            </div>
          </div>
        )}
      </div>

      {/* Level Filter */}
      {levels.length > 0 && (
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Level
          </label>
          <div className="flex flex-wrap gap-2">
            {levels.map(({ level, count }) => (
              <button
                key={level}
                onClick={() => handleLevelToggle(level)}
                className={`
                  px-3 py-1 rounded text-xs font-medium transition-colors
                  ${
                    filters.levels.includes(level)
                      ? "bg-blue-500 text-white"
                      : "bg-gray-200 text-gray-700 hover:bg-gray-300"
                  }
                `}
              >
                {level} ({count})
              </button>
            ))}
          </div>
        </div>
      )}

      {/* Tags Filter */}
      {tags.length > 0 && (
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Tags
          </label>
          <div className="flex flex-wrap gap-2">
            {tags.map(({ tag, count }) => (
              <button
                key={tag}
                onClick={() => handleTagToggle(tag)}
                className={`
                  px-3 py-1 rounded text-xs font-medium transition-colors
                  ${
                    filters.tags.includes(tag)
                      ? "bg-green-500 text-white"
                      : "bg-gray-200 text-gray-700 hover:bg-gray-300"
                  }
                `}
              >
                {tag} ({count})
              </button>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
