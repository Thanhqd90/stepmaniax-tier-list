/**
 * Utility functions for chart and tier list operations
 */

import type { ChartRecord, Placement, Song, TierListState } from "@/types/smx";

/**
 * Convert Song[] format (with nested charts) to flat ChartRecord[] format
 */
export function songsToChartRecords(songs: Song[]): ChartRecord[] {
  const charts: ChartRecord[] = [];

  songs.forEach((song) => {
    song.charts.forEach((chart) => {
      const id = `${song.id}-${chart.chartType}-${chart.level}-${chart.isPlus ? "plus" : "base"}`;

      charts.push({
        id,
        songId: song.id,
        title: song.title,
        artist: song.artist,
        jacketUrl: song.jacketUrl,
        chartType: chart.chartType,
        isPlus: chart.isPlus,
        level: chart.level,
        modeGroup: song.modeGroup,
        bpmDisplay: song.bpmDisplay,
        tags: song.tags,
      });
    });
  });

  return charts;
}

/**
 * Generate a unique row ID
 */
export function generateRowId(): string {
  return `row-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;
}

/**
 * Get all unique difficulties and their counts
 */
export function getUniqueDifficulties(
  charts: ChartRecord[],
): { difficulty: string; count: number }[] {
  const counts = new Map<string, number>();

  charts.forEach((chart) => {
    const difficulty = chart.isPlus ? `${chart.chartType}+` : chart.chartType;
    counts.set(difficulty, (counts.get(difficulty) ?? 0) + 1);
  });

  return Array.from(counts.entries())
    .map(([difficulty, count]) => ({ difficulty, count }))
    .sort((a, b) => a.difficulty.localeCompare(b.difficulty));
}

/**
 * Get all unique levels and their counts
 */
export function getUniqueLevels(
  charts: ChartRecord[],
): { level: number; count: number }[] {
  const counts = new Map<number, number>();

  charts.forEach((chart) => {
    counts.set(chart.level, (counts.get(chart.level) ?? 0) + 1);
  });

  return Array.from(counts.entries())
    .map(([level, count]) => ({ level, count }))
    .sort((a, b) => a.level - b.level);
}

/**
 * Get all unique tags and their counts
 */
export function getUniqueTags(
  charts: ChartRecord[],
): { tag: string; count: number }[] {
  const counts = new Map<string, number>();

  charts.forEach((chart) => {
    chart.tags.forEach((tag) => {
      counts.set(tag, (counts.get(tag) ?? 0) + 1);
    });
  });

  return Array.from(counts.entries())
    .map(([tag, count]) => ({ tag, count }))
    .sort((a, b) => a.tag.localeCompare(b.tag));
}

/**
 * Find a chart by ID
 */
export function findChartById(
  charts: ChartRecord[],
  chartId: string,
): ChartRecord | undefined {
  return charts.find((chart) => chart.id === chartId);
}

/**
 * Get all placements for a specific row
 */
export function getRowPlacements(
  placements: Placement[],
  rowId: string,
): Placement[] {
  return placements.filter((p) => p.rowId === rowId);
}

/**
 * Sort placements by xValue (left to right)
 */
export function sortPlacementsByX(placements: Placement[]): Placement[] {
  return [...placements].sort((a, b) => a.xValue - b.xValue);
}

/**
 * Check if a chart is placed in any row
 */
export function isChartPlaced(
  placements: Placement[],
  chartId: string,
): boolean {
  return placements.some((p) => p.chartId === chartId);
}

/**
 * Get all placed chart IDs
 */
export function getPlacedChartIds(placements: Placement[]): Set<string> {
  return new Set(placements.map((p) => p.chartId));
}

/**
 * Generate default tier rows based on level (with decimal subdivisions)
 * For level 18: 18.9, 18.8, 18.7, ..., 18.0
 */
export function createDefaultTiers(level?: number) {
  // If no level specified, use classic S-F tiers
  if (!level) {
    const tierNames = ["S", "A", "B", "C", "D", "F"];
    const colors = [
      "#FF6B6B",
      "#FFA07A",
      "#FFD93D",
      "#6BCB77",
      "#4D96FF",
      "#8B5CF6",
    ];

    return tierNames.map((name, index) => ({
      id: generateRowId(),
      name,
      color: colors[index],
    }));
  }

  // Generate decimal-based tiers for the given level
  const colors = [
    "#FF6B6B", // 18.9
    "#FF8A7F", // 18.8
    "#FFA07A", // 18.7
    "#FFB68F", // 18.6
    "#FFCCA3", // 18.5
    "#FFE2B8", // 18.4
    "#FFF8CC", // 18.3
    "#FFD93D", // 18.2
    "#F0C940", // 18.1
    "#E5BE4D", // 18.0
  ];

  const tiers = [];
  // Generate from X.9 down to X.0
  for (let i = 9; i >= 0; i--) {
    tiers.push({
      id: generateRowId(),
      name: `${level}.${i}`,
      color: colors[9 - i], // Map to color array
    });
  }

  return tiers;
}

/**
 * Generate a tier row with default values
 */
export function createDefaultTierRow(index: number) {
  const colors = [
    "#FF6B6B",
    "#4ECDC4",
    "#45B7D1",
    "#FFA07A",
    "#98D8C8",
    "#F7DC6F",
  ];
  return {
    id: generateRowId(),
    name: `Tier ${String.fromCharCode(65 + (index % 26))}`,
    color: colors[index % colors.length],
  };
}

/**
 * Get all unique difficulty/level combinations from charts
 */
export function getDifficultyLevelCombinations(
  charts: ChartRecord[],
): Array<{ difficulty: string; level: number; count: number }> {
  const combos = new Map<string, number>();

  charts.forEach((chart) => {
    const difficulty = chart.isPlus ? `${chart.chartType}+` : chart.chartType;
    const key = `${difficulty}|${chart.level}`;
    combos.set(key, (combos.get(key) ?? 0) + 1);
  });

  return Array.from(combos.entries())
    .map(([key, count]) => {
      const [difficulty, levelStr] = key.split("|");
      return {
        difficulty,
        level: parseInt(levelStr, 10),
        count,
      };
    })
    .sort((a, b) => {
      // Sort by level first, then by difficulty
      if (a.level !== b.level) return a.level - b.level;
      return a.difficulty.localeCompare(b.difficulty);
    });
}
