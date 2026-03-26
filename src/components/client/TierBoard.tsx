"use client";

import { useCallback, useState, useEffect, useRef } from "react";
import Link from "next/link";
import {
  HomeIcon,
  ArrowPathIcon,
  EyeIcon,
  EyeSlashIcon,
  ArrowDownTrayIcon,
} from "@heroicons/react/24/solid";
import type {
  ChartRecord,
  Placement,
  TierListState,
  TierRow,
} from "@/types/smx";
import { createDefaultTiers, generateRowId } from "@/lib/utils";
import { TierRowComponent } from "./TierRow";
import { ChartCard } from "./ChartCard";

interface TierBoardProps {
  charts: ChartRecord[];
  initialState?: TierListState;
  onStateChange?: (state: TierListState) => void;
  levelFilter?: number;
  difficulty?: string;
  level?: number;
}

/**
 * Main tier board component with drag-and-drop support
 */
export function TierBoard({
  charts,
  initialState = { rows: [], placements: [] },
  onStateChange,
  levelFilter,
  difficulty,
  level,
}: TierBoardProps) {
  // Initialize with default tiers if no rows exist
  const getInitialState = () => {
    // Try to load from localStorage first
    if (typeof window !== "undefined") {
      const storageKey = `tierlist-${difficulty}-${level}`;
      const saved = localStorage.getItem(storageKey);
      if (saved) {
        try {
          return JSON.parse(saved) as TierListState;
        } catch {
          // If parsing fails, fall through to default
        }
      }
    }

    if (initialState.rows.length === 0) {
      return {
        rows: createDefaultTiers(level),
        placements: initialState.placements,
      };
    }
    return initialState;
  };

  const [state, setState] = useState<TierListState>(getInitialState);
  const [draggedChart, setDraggedChart] = useState<ChartRecord | null>(null);
  const [draggedFromRowId, setDraggedFromRowId] = useState<string | null>(null);
  const [activeRowId, setActiveRowId] = useState<string | null>(null);
  const [showChartsSidebar, setShowChartsSidebar] = useState(true);
  const [isClient, setIsClient] = useState(false);
  const [showHeaderMenu, setShowHeaderMenu] = useState(false);
  const [tierListName, setTierListName] = useState<string>("");
  const [isEditingName, setIsEditingName] = useState(false);
  const tierRowsRef = useRef<HTMLDivElement>(null);

  // Mark as client-side mounted to avoid hydration issues
  useEffect(() => {
    setIsClient(true);
  }, []);

  // Load name and save recently visited on mount
  useEffect(() => {
    if (!isClient || !difficulty || level === undefined) return;

    const storageKey = `tierlist-${difficulty}-${level}`;
    const saved = localStorage.getItem(storageKey);
    if (saved) {
      try {
        const parsedState = JSON.parse(saved) as TierListState;
        setTierListName(parsedState.name || "");
      } catch {
        // If parsing fails, just use empty name
      }
    }

    // Track recently visited
    try {
      const recentKey = "tierlist-recently-visited";
      const recent = JSON.parse(
        localStorage.getItem(recentKey) || "[]",
      ) as Array<{
        difficulty: string;
        level: number;
        timestamp: number;
      }>;

      // Remove if already exists, then add to front
      const filtered = recent.filter(
        (r) => !(r.difficulty === difficulty && r.level === level),
      );
      const updated = [
        { difficulty, level, timestamp: Date.now() },
        ...filtered,
      ].slice(0, 10);
      localStorage.setItem(recentKey, JSON.stringify(updated));
    } catch {
      // Silently fail if there's an issue with recent tracking
    }
  }, [isClient, difficulty, level]);

  // Auto-save state to localStorage whenever it changes (including name)
  useEffect(() => {
    if (!isClient) return;
    const storageKey = `tierlist-${difficulty}-${level}`;
    const stateWithName = { ...state, name: tierListName };
    localStorage.setItem(storageKey, JSON.stringify(stateWithName));
  }, [state, tierListName, difficulty, level, isClient]);

  const handleStateChange = useCallback(
    (newState: TierListState) => {
      setState(newState);
      onStateChange?.(newState);
    },
    [onStateChange],
  );

  // Get placed chart IDs and unplaced charts
  const placedChartIds = new Set(state.placements.map((p) => p.chartId));
  const unplacedCharts = charts.filter((c) => !placedChartIds.has(c.id));

  // Group unplaced charts: base charts and their plus variants together
  const groupedCharts = getGroupedCharts(unplacedCharts);

  // Reset tier list
  const handleReset = () => {
    if (confirm("Are you sure you want to reset the tier list?")) {
      handleStateChange({
        rows: createDefaultTiers(level),
        placements: [],
      });
    }
  };

  // Remove row
  const handleRemoveRow = (rowId: string) => {
    handleStateChange({
      ...state,
      rows: state.rows.filter((r) => r.id !== rowId),
      placements: state.placements.filter((p) => p.rowId !== rowId),
    });
  };

  // Update row
  const handleUpdateRow = (rowId: string, updates: Partial<TierRow>) => {
    handleStateChange({
      ...state,
      rows: state.rows.map((r) => (r.id === rowId ? { ...r, ...updates } : r)),
    });
  };

  // Remove chart from row
  const handleRemoveChart = (chartId: string) => {
    handleStateChange({
      ...state,
      placements: state.placements.filter((p) => p.chartId !== chartId),
    });
  };

  // Drag start
  const handleChartDragStart = (chart: ChartRecord) => {
    setDraggedChart(chart);
  };

  // Chart click: add to active row
  const handleChartClick = (chart: ChartRecord) => {
    if (!activeRowId) return; // Only works if a row is active

    // Remove chart from any previous row
    const newPlacements = state.placements.filter(
      (p) => p.chartId !== chart.id,
    );

    // Add new placement to active row at the end
    newPlacements.push({
      chartId: chart.id,
      rowId: activeRowId,
      xValue: 9999, // Add to end
    });

    // Sort placements within each row by xValue
    const sortedPlacements = newPlacements.sort((a, b) => {
      if (a.rowId !== b.rowId) return 0;
      return a.xValue - b.xValue;
    });

    handleStateChange({
      ...state,
      placements: sortedPlacements,
    });
  };

  // Drag over row - with auto-scroll
  const handleRowDragOver = (e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    e.dataTransfer.dropEffect = "move";

    // Auto-scroll near edges of viewport
    const scrollZone = 100;
    const scrollSpeed = 10;

    if (e.clientY < scrollZone) {
      window.scrollBy(0, -scrollSpeed);
    } else if (e.clientY > window.innerHeight - scrollZone) {
      window.scrollBy(0, scrollSpeed);
    }
  };

  // Drop on row
  const handleRowDrop = (rowId: string, e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    if (!draggedChart) return;

    // Remove chart from any previous row
    const newPlacements = state.placements.filter(
      (p) => p.chartId !== draggedChart.id,
    );

    // Calculate xValue based on drop position within the row
    const rect = (e.currentTarget as HTMLDivElement).getBoundingClientRect();
    const xValue = e.clientX - rect.left;

    // Add new placement
    newPlacements.push({
      chartId: draggedChart.id,
      rowId,
      xValue,
    });

    // Sort placements within each row by xValue for proper left-to-right ordering
    const sortedPlacements = newPlacements.sort((a, b) => {
      if (a.rowId !== b.rowId) return 0; // Don't reorder across rows here
      return a.xValue - b.xValue;
    });

    handleStateChange({
      ...state,
      placements: sortedPlacements,
    });

    setDraggedChart(null);
    setDraggedFromRowId(null);
  };

  // Helper to load image from URL
  const loadImage = (url: string): Promise<HTMLImageElement> => {
    return new Promise((resolve, reject) => {
      const img = new Image();
      img.crossOrigin = "anonymous";
      img.onload = () => resolve(img);
      img.onerror = reject;
      img.src = url;
    });
  };

  // Export tier board as image using Canvas API
  const handleExportAsImage = async () => {
    try {
      const scale = 2; // High resolution scale (2x)
      const padding = 40;
      const imageItemHeight = 100; // Height per row of images
      const imageSize = 80;
      const imagesPerRow = 7; // Changed to 7 per row
      const gapSize = 10;
      const labelWidth = 120;

      // First pass: calculate total height needed
      let totalHeight = tierListName ? 90 : 60; // Title + subtitle if name exists
      for (const row of state.rows) {
        const rowPlacements = state.placements
          .filter((p) => p.rowId === row.id)
          .sort((a, b) => a.xValue - b.xValue);
        const rowCharts = rowPlacements
          .map((p) => charts.find((c) => c.id === p.chartId))
          .filter(Boolean) as ChartRecord[];

        // Calculate how many rows of images we need for this tier
        const imageRows = Math.max(
          1,
          Math.ceil(rowCharts.length / imagesPerRow),
        );
        totalHeight += imageRows * imageItemHeight + 10;
      }

      const contentWidth =
        labelWidth +
        (imagesPerRow * imageSize + (imagesPerRow - 1) * gapSize) +
        padding * 2;
      const contentHeight = totalHeight + padding * 2;

      const canvas = document.createElement("canvas");
      canvas.width = contentWidth * scale;
      canvas.height = contentHeight * scale;

      const ctx = canvas.getContext("2d");
      if (!ctx) throw new Error("Could not get canvas context");

      // Scale for high resolution
      ctx.scale(scale, scale);

      // Draw background
      ctx.fillStyle = "#111827";
      ctx.fillRect(0, 0, contentWidth, contentHeight);

      // Draw title
      ctx.fillStyle = "#ffffff";
      ctx.font = "bold 28px system-ui";
      ctx.textAlign = "left";
      const titleText = `${difficulty?.charAt(0).toUpperCase()}${difficulty?.slice(1)} Level ${level}`;
      ctx.fillText(titleText, padding, padding + 30);

      // Draw tier list name if set
      if (tierListName) {
        ctx.fillStyle = "#9ca3af";
        ctx.font = "16px system-ui";
        ctx.fillText(`"${tierListName}"`, padding, padding + 55);
      }

      // Draw each tier row
      let yOffset = padding + (tierListName ? 90 : 60);

      for (const row of state.rows) {
        // Get charts in this row
        const rowPlacements = state.placements
          .filter((p) => p.rowId === row.id)
          .sort((a, b) => a.xValue - b.xValue);
        const rowCharts = rowPlacements
          .map((p) => charts.find((c) => c.id === p.chartId))
          .filter(Boolean) as ChartRecord[];

        // Calculate how many rows of images we need
        const imageRows = Math.max(
          1,
          Math.ceil(rowCharts.length / imagesPerRow),
        );
        const totalRowHeight = imageRows * imageItemHeight;

        // Draw row background
        ctx.fillStyle = row.color + "20"; // Add transparency
        ctx.strokeStyle = row.color;
        ctx.lineWidth = 2;
        ctx.fillRect(
          padding,
          yOffset,
          contentWidth - padding * 2,
          totalRowHeight,
        );
        ctx.strokeRect(
          padding,
          yOffset,
          contentWidth - padding * 2,
          totalRowHeight,
        );

        // Draw row label (centered vertically in the entire section)
        ctx.fillStyle = row.color;
        ctx.font = "bold 18px system-ui";
        ctx.textAlign = "center";
        ctx.fillText(
          row.name,
          padding + labelWidth / 2,
          yOffset + totalRowHeight / 2 + 8,
        );

        // Draw jacket images (wrapped into multiple rows)
        let imageIndex = 0;
        for (let imgRow = 0; imgRow < imageRows; imgRow++) {
          let imageXOffset = padding + labelWidth + 15;
          const imgRowYOffset =
            yOffset +
            imgRow * imageItemHeight +
            (imageItemHeight - imageSize) / 2;

          for (let col = 0; col < imagesPerRow; col++) {
            if (imageIndex >= rowCharts.length) break;

            const chart = rowCharts[imageIndex];
            try {
              const img = await loadImage(chart.jacketUrl);
              ctx.drawImage(
                img,
                imageXOffset,
                imgRowYOffset,
                imageSize,
                imageSize,
              );

              // Draw border
              ctx.strokeStyle = "#ffffff";
              ctx.lineWidth = 1;
              ctx.strokeRect(imageXOffset, imgRowYOffset, imageSize, imageSize);
            } catch (error) {
              // Skip failed image loads - draw placeholder
              ctx.fillStyle = "#333333";
              ctx.fillRect(imageXOffset, imgRowYOffset, imageSize, imageSize);
              ctx.strokeStyle = "#666666";
              ctx.lineWidth = 1;
              ctx.strokeRect(imageXOffset, imgRowYOffset, imageSize, imageSize);
            }

            imageXOffset += imageSize + gapSize;
            imageIndex++;
          }
        }

        // If no charts, draw "Empty" text
        if (rowCharts.length === 0) {
          ctx.fillStyle = "#666666";
          ctx.font = "14px system-ui";
          ctx.textAlign = "left";
          ctx.fillText(
            "(empty)",
            padding + labelWidth + 15,
            yOffset + imageItemHeight / 2 + 5,
          );
        }

        yOffset += totalRowHeight + 10;
      }

      // Download canvas as PNG
      canvas.toBlob((blob) => {
        if (!blob) throw new Error("Could not create blob");
        const url = URL.createObjectURL(blob);
        const link = document.createElement("a");
        link.href = url;
        link.download = `tierlist-${difficulty}-${level}-${Date.now()}.png`;
        link.click();
        URL.revokeObjectURL(url);
      }, "image/png");
    } catch (error) {
      console.error("Failed to export image:", error);
      alert("Failed to export tier list as image. Please try again.");
    }
  };

  // Group charts by base difficulty, with plus variants together
  function getGroupedCharts(
    chartsToGroup: ChartRecord[],
  ): Array<{ baseType: string; charts: ChartRecord[] }> {
    const grouped: Record<string, ChartRecord[]> = {};

    chartsToGroup.forEach((chart) => {
      const baseType = chart.chartType; // Use chartType as base
      if (!grouped[baseType]) {
        grouped[baseType] = [];
      }
      grouped[baseType].push(chart);
    });

    // Sort by difficulty order and return
    const difficultyOrder = [
      "beginner",
      "easy",
      "hard",
      "wild",
      "dual",
      "full",
      "team",
    ];
    const sorted = Object.entries(grouped).sort((a, b) => {
      const aIdx = difficultyOrder.indexOf(a[0]);
      const bIdx = difficultyOrder.indexOf(b[0]);
      return (aIdx === -1 ? 999 : aIdx) - (bIdx === -1 ? 999 : bIdx);
    });

    return sorted.map(([baseType, charts]) => ({
      baseType,
      charts: charts.sort((a, b) => (a.isPlus ? 1 : -1)), // Base first, then plus
    }));
  }

  return (
    <div className="h-screen bg-gray-950 flex flex-col">
      {/* Header - Responsive */}
      <div className="bg-gray-900 border-b border-gray-800 flex-shrink-0">
        <div className="flex justify-between items-start px-4 md:px-6 py-3 md:py-4">
          {/* Title - Clickable to go home */}
          <div className="flex-1">
            <Link
              href="/"
              className="hover:opacity-80 transition-opacity block"
            >
              {difficulty && level !== undefined ? (
                <div>
                  <h1 className="text-xl md:text-3xl font-bold text-white">
                    {difficulty.charAt(0).toUpperCase() + difficulty.slice(1)}{" "}
                    {level}
                  </h1>
                  <p className="text-xs md:text-lg text-gray-400 mt-0.5 md:mt-1 font-medium">
                    {charts.length} Charts
                  </p>
                </div>
              ) : (
                <div>
                  <h1 className="text-xl md:text-3xl font-bold text-white">
                    SMX Tier List
                  </h1>
                  {levelFilter !== undefined && (
                    <p className="text-xs md:text-lg text-gray-400 mt-0.5 md:mt-1 font-medium">
                      Level {levelFilter}
                    </p>
                  )}
                </div>
              )}
            </Link>

            {/* Tier list name editor */}
            {difficulty && level !== undefined && (
              <div className="mt-2 flex items-center gap-2">
                {isEditingName ? (
                  <div className="flex gap-2 items-center flex-1">
                    <input
                      autoFocus
                      type="text"
                      value={tierListName}
                      onChange={(e) => setTierListName(e.target.value)}
                      onKeyDown={(e) => {
                        if (e.key === "Enter") setIsEditingName(false);
                        if (e.key === "Escape") setIsEditingName(false);
                      }}
                      onBlur={() => setIsEditingName(false)}
                      placeholder="Tier list name (optional)"
                      className="px-2 py-1 bg-gray-700 text-white text-sm rounded border border-gray-600 focus:border-blue-500 focus:outline-none max-w-xs"
                    />
                  </div>
                ) : (
                  <button
                    onClick={() => setIsEditingName(true)}
                    className="text-sm text-gray-400 hover:text-gray-200 transition-colors"
                  >
                    {tierListName ? (
                      <span className="text-gray-300">{tierListName}</span>
                    ) : (
                      <span className="text-gray-500 italic">+ add name</span>
                    )}
                  </button>
                )}
              </div>
            )}
          </div>

          {/* Desktop buttons - Hidden on mobile */}
          <div className="hidden md:flex gap-2">
            <Link
              href="/"
              className="px-4 py-2 bg-blue-500 text-white rounded hover:bg-blue-600 font-medium text-sm hover:scale-105 transition-transform flex items-center gap-2"
              title="Go to home"
            >
              <HomeIcon className="w-4 h-4" />
              Home
            </Link>
            <button
              onClick={handleReset}
              className="px-4 py-2 bg-red-500 text-white rounded hover:bg-red-600 font-medium text-sm hover:scale-105 transition-transform flex items-center gap-2"
              title="Reset tier list"
            >
              <ArrowPathIcon className="w-4 h-4" />
              Reset
            </button>
            <button
              onClick={() => setShowChartsSidebar(!showChartsSidebar)}
              className="px-4 py-2 bg-purple-500 text-white rounded hover:bg-purple-600 font-medium text-sm hover:scale-105 transition-transform flex items-center gap-2"
              title={showChartsSidebar ? "Hide charts" : "Show charts"}
            >
              {showChartsSidebar ? (
                <EyeSlashIcon className="w-4 h-4" />
              ) : (
                <EyeIcon className="w-4 h-4" />
              )}
              {showChartsSidebar ? "Hide" : "Show"} Charts
            </button>
            <button
              onClick={handleExportAsImage}
              className="px-4 py-2 bg-orange-500 text-white rounded hover:bg-orange-600 font-medium text-sm hover:scale-105 transition-transform flex items-center gap-2"
              title="Export as image"
            >
              <ArrowDownTrayIcon className="w-4 h-4" />
              Export
            </button>
          </div>

          {/* Mobile menu button */}
          <button
            onClick={() => setShowHeaderMenu(!showHeaderMenu)}
            className="md:hidden flex flex-col gap-1 p-2 hover:bg-gray-800 rounded"
            aria-label="Menu"
          >
            <div className="w-6 h-1 bg-white rounded"></div>
            <div className="w-6 h-1 bg-white rounded"></div>
            <div className="w-6 h-1 bg-white rounded"></div>
          </button>
        </div>

        {/* Mobile menu - Shown when toggled */}
        {showHeaderMenu && (
          <div className="md:hidden border-t border-gray-700 bg-gray-800 p-3 space-y-2">
            <Link
              href="/"
              className="block px-4 py-2 bg-blue-500 text-white rounded hover:bg-blue-600 font-medium text-sm text-center flex items-center justify-center gap-2"
            >
              <HomeIcon className="w-4 h-4" />
              Home
            </Link>
            <button
              onClick={() => {
                handleReset();
                setShowHeaderMenu(false);
              }}
              className="w-full px-4 py-2 bg-red-500 text-white rounded hover:bg-red-600 font-medium text-sm flex items-center justify-center gap-2"
            >
              <ArrowPathIcon className="w-4 h-4" />
              Reset
            </button>
            <button
              onClick={() => {
                setShowChartsSidebar(!showChartsSidebar);
                setShowHeaderMenu(false);
              }}
              className="w-full px-4 py-2 bg-purple-500 text-white rounded hover:bg-purple-600 font-medium text-sm flex items-center justify-center gap-2"
            >
              {showChartsSidebar ? (
                <EyeSlashIcon className="w-4 h-4" />
              ) : (
                <EyeIcon className="w-4 h-4" />
              )}
              {showChartsSidebar ? "Hide" : "Show"} Charts
            </button>
            <button
              onClick={() => {
                handleExportAsImage();
                setShowHeaderMenu(false);
              }}
              className="w-full px-4 py-2 bg-orange-500 text-white rounded hover:bg-orange-600 font-medium text-sm flex items-center justify-center gap-2"
            >
              <ArrowDownTrayIcon className="w-4 h-4" />
              Export as Image
            </button>
          </div>
        )}
      </div>

      {/* Main content area - Responsive layout */}
      <div className="flex-1 flex flex-col lg:flex-row overflow-hidden">
        {/* Left/Top: scrollable tier rows */}
        <div className="flex-1 overflow-y-auto bg-gray-900 lg:border-r lg:border-gray-700">
          <div
            ref={tierRowsRef}
            className="max-w-5xl mx-auto p-3 md:p-6 space-y-3 md:space-y-6"
          >
            {/* Tier Rows */}
            <div className="space-y-2 md:space-y-4">
              {state.rows.length === 0 ? (
                <div className="flex justify-center items-center h-32 bg-gray-800 rounded border-2 border-dashed border-gray-700">
                  <p className="text-gray-400 text-lg font-medium">
                    No tiers yet. Create one to get started!
                  </p>
                </div>
              ) : (
                state.rows.map((row) => (
                  <div
                    key={row.id}
                    onDragOver={handleRowDragOver}
                    onDrop={(e) => handleRowDrop(row.id, e)}
                  >
                    <TierRowComponent
                      row={row}
                      charts={charts}
                      placements={state.placements}
                      onRemoveChart={handleRemoveChart}
                      onReorderCharts={() => {}}
                      onDeleteRow={handleRemoveRow}
                      onUpdateRow={handleUpdateRow}
                      onChartDragStart={handleChartDragStart}
                      isActive={activeRowId === row.id}
                      onActivate={() => setActiveRowId(row.id)}
                    />
                  </div>
                ))
              )}
            </div>
          </div>
        </div>

        {/* Right/Bottom: collapsible charts sidebar */}
        {showChartsSidebar && (
          <div className="w-full lg:w-80 h-48 md:h-56 lg:h-full bg-gray-800 lg:border-l-2 border-t-2 lg:border-t-0 border-gray-700 flex flex-col flex-shrink-0 overflow-hidden">
            <div className="p-2 md:p-4 border-b border-gray-700 flex-shrink-0">
              <h2 className="text-sm md:text-lg font-bold text-white">
                Available Charts
              </h2>
              <p className="text-xs text-gray-400 mt-0.5">
                {unplacedCharts.length} unplaced
              </p>
            </div>
            <div className="flex-1 overflow-y-auto p-2 md:p-4">
              {unplacedCharts.length === 0 ? (
                <p className="text-gray-500 text-center py-4 text-xs">
                  All charts are placed in tiers!
                </p>
              ) : (
                <div className="grid grid-cols-5 md:grid-cols-2 gap-1 md:gap-3">
                  {unplacedCharts.map((chart) => (
                    <div
                      key={chart.id}
                      onDragStart={() => handleChartDragStart(chart)}
                      onClick={() => handleChartClick(chart)}
                      className="w-full aspect-square"
                    >
                      <ChartCard
                        chart={chart}
                        isDragging={draggedChart?.id === chart.id}
                        compact={true}
                      />
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
