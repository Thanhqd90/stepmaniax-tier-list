/**
 * React hooks for tier list state and filtering
 */

"use client";

import { useCallback, useEffect, useState } from "react";
import type {
  ChartRecord,
  DifficultyName,
  FilterState,
  Placement,
  TierListState,
  TierRow,
} from "@/types/smx";

const STORAGE_KEY = "smx-tier-list-state";

export function useTierListState() {
  const [state, setState] = useState<TierListState>({
    rows: [],
    placements: [],
  });
  const [mounted, setMounted] = useState(false);

  // Load from localStorage on mount
  useEffect(() => {
    const saved = localStorage.getItem(STORAGE_KEY);
    if (saved) {
      try {
        setState(JSON.parse(saved));
      } catch (e) {
        console.warn("Failed to load tier list state from localStorage");
      }
    }
    setMounted(true);
  }, []);

  // Save to localStorage whenever state changes
  useEffect(() => {
    if (mounted) {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(state));
    }
  }, [state, mounted]);

  const addRow = useCallback((row: TierRow) => {
    setState((prev) => ({
      ...prev,
      rows: [...prev.rows, row],
    }));
  }, []);

  const removeRow = useCallback((rowId: string) => {
    setState((prev) => ({
      ...prev,
      rows: prev.rows.filter((r) => r.id !== rowId),
      placements: prev.placements.filter((p) => p.rowId !== rowId),
    }));
  }, []);

  const updateRow = useCallback((rowId: string, updates: Partial<TierRow>) => {
    setState((prev) => ({
      ...prev,
      rows: prev.rows.map((r) => (r.id === rowId ? { ...r, ...updates } : r)),
    }));
  }, []);

  const addPlacement = useCallback((placement: Placement) => {
    setState((prev) => ({
      ...prev,
      placements: [...prev.placements, placement],
    }));
  }, []);

  const removePlacement = useCallback((chartId: string) => {
    setState((prev) => ({
      ...prev,
      placements: prev.placements.filter((p) => p.chartId !== chartId),
    }));
  }, []);

  const updatePlacement = useCallback(
    (chartId: string, updates: Partial<Placement>) => {
      setState((prev) => ({
        ...prev,
        placements: prev.placements.map((p) =>
          p.chartId === chartId ? { ...p, ...updates } : p,
        ),
      }));
    },
    [],
  );

  return {
    state,
    setState,
    addRow,
    removeRow,
    updateRow,
    addPlacement,
    removePlacement,
    updatePlacement,
    mounted,
  };
}

export function useFilterState(initialFilters?: Partial<FilterState>) {
  const [filters, setFilters] = useState<FilterState>({
    selectedDifficulties: [],
    levels: [],
    searchQuery: "",
    tags: [],
    ...initialFilters,
  });

  const setDifficulties = useCallback((difficulties: string[]) => {
    setFilters((prev) => ({ ...prev, selectedDifficulties: difficulties }));
  }, []);

  const setLevels = useCallback((levels: number[]) => {
    setFilters((prev) => ({ ...prev, levels }));
  }, []);

  const setSearchQuery = useCallback((query: string) => {
    setFilters((prev) => ({ ...prev, searchQuery: query }));
  }, []);

  const setTags = useCallback((tags: string[]) => {
    setFilters((prev) => ({ ...prev, tags }));
  }, []);

  return {
    filters,
    setFilters,
    setDifficulties,
    setLevels,
    setSearchQuery,
    setTags,
  };
}

export function useFilteredCharts(
  charts: ChartRecord[],
  filters: FilterState,
): ChartRecord[] {
  return charts.filter((chart) => {
    // Search query
    if (filters.searchQuery) {
      const query = filters.searchQuery.toLowerCase();
      const matchesSearch =
        chart.title.toLowerCase().includes(query) ||
        chart.artist.toLowerCase().includes(query);
      if (!matchesSearch) return false;
    }

    // Difficulty filter
    if (filters.selectedDifficulties.length > 0) {
      const chartDifficulty = chart.isPlus
        ? `${chart.chartType}+`
        : chart.chartType;
      if (!filters.selectedDifficulties.includes(chartDifficulty)) {
        return false;
      }
    }

    // Level filter
    if (filters.levels.length > 0) {
      if (!filters.levels.includes(chart.level)) {
        return false;
      }
    }

    // Tags filter
    if (filters.tags.length > 0) {
      const hasMatchingTag = filters.tags.some((tag) =>
        chart.tags.includes(tag),
      );
      if (!hasMatchingTag) return false;
    }

    return true;
  });
}
