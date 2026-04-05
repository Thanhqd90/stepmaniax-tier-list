"use client";

import { useCallback, useState, useEffect, useRef } from "react";
import Link from "next/link";
import {
  HomeIcon,
  ArrowPathIcon,
  EyeIcon,
  EyeSlashIcon,
  ArrowDownTrayIcon,
  QuestionMarkCircleIcon,
  SparklesIcon,
  StarIcon,
  PlusIcon,
  ArrowUpTrayIcon,
  EllipsisVerticalIcon,
  TrashIcon,
} from "@heroicons/react/24/solid";
import type {
  ChartRecord,
  Placement,
  TierListState,
  TierRow,
  TierListVariant,
} from "@/types/smx";
import {
  createDefaultTiers,
  generateRowId,
  exportTierListAsJSON,
  importTierListFromJSON,
  loadTierListVariants,
  saveTierListVariants,
  getLastViewedVariantId,
  saveLastViewedVariantId,
  createCustomTierListVariant,
  createCategoryTierListVariant,
  createDecimalTierListVariant,
} from "@/lib/utils";
import { TierRowComponent } from "./TierRow";
import { ChartCard } from "./ChartCard";
import { HelpModal } from "./HelpModal";

const MINIMUM_CHARTS_TO_EXPORT = 5;
const MAX_ROWS = 12;

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
  // Manage multiple tier list variants
  const [variants, setVariants] = useState<TierListVariant[]>([]);
  const [currentVariantId, setCurrentVariantId] = useState<string>("decimal");
  const [isClient, setIsClient] = useState(false);
  const [showCreateDialog, setShowCreateDialog] = useState(false);
  const [customTierListName, setCustomTierListName] = useState("");

  // Get current variant
  const currentVariant = variants.find((v) => v.id === currentVariantId);
  const state: TierListState = currentVariant
    ? { rows: currentVariant.rows, placements: currentVariant.placements }
    : { rows: [], placements: [] };

  // State for UI interactions
  const [draggedChart, setDraggedChart] = useState<ChartRecord | null>(null);
  const [draggedFromRowId, setDraggedFromRowId] = useState<string | null>(null);
  const [draggedRowId, setDraggedRowId] = useState<string | null>(null);
  const [dragOverRowId, setDragOverRowId] = useState<string | null>(null);
  const [dragOverRowIdForChart, setDragOverRowIdForChart] = useState<
    string | null
  >(null);
  const [dropPosition, setDropPosition] = useState<"above" | "below" | null>(
    null,
  );
  const [dragOverEmptySpace, setDragOverEmptySpace] = useState(false);
  const [activeRowId, setActiveRowId] = useState<string | null>(null);
  const [showChartsSidebar, setShowChartsSidebar] = useState(true);
  const [showHeaderMenu, setShowHeaderMenu] = useState(false);
  const [tierListName, setTierListName] = useState<string>("");
  const [isEditingName, setIsEditingName] = useState(false);
  const [selectedChartId, setSelectedChartId] = useState<string | null>(null);
  const [selectedChartRowId, setSelectedChartRowId] = useState<string | null>(
    null,
  );
  const [showHelpModal, setShowHelpModal] = useState(false);
  const [isExporting, setIsExporting] = useState(false);
  const [lastExportTime, setLastExportTime] = useState(0);
  const [exportCount, setExportCount] = useState(0);
  const [showExportWarning, setShowExportWarning] = useState(false);
  const [isFavorited, setIsFavorited] = useState(false);
  const [showMoreMenu, setShowMoreMenu] = useState(false);
  const tierRowsRef = useRef<HTMLDivElement>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const moreMenuRef = useRef<HTMLDivElement>(null);

  // Initialize on mount - load all variants for this level
  useEffect(() => {
    if (!difficulty || level === undefined) return;
    setIsClient(true);

    const loaded = loadTierListVariants(difficulty, level);
    setVariants(loaded);

    // Restore last viewed variant
    const lastViewedId = getLastViewedVariantId(difficulty, level);
    if (lastViewedId && loaded.some((v) => v.id === lastViewedId)) {
      setCurrentVariantId(lastViewedId);
    } else {
      setCurrentVariantId("decimal");
    }
  }, [difficulty, level]);

  // Update tier list name when current variant changes
  useEffect(() => {
    if (currentVariant) {
      setTierListName(currentVariant.customLabel || "");
    }
  }, [currentVariantId]);

  // Save variants to localStorage whenever they change
  useEffect(() => {
    if (
      !isClient ||
      !difficulty ||
      level === undefined ||
      variants.length === 0
    )
      return;
    saveTierListVariants(difficulty, level, variants);
  }, [variants, difficulty, level, isClient]);

  // Handle state changes for the current variant
  const handleStateChange = (newState: TierListState) => {
    if (!currentVariant) return;

    const updated = variants.map((v) =>
      v.id === currentVariantId ? { ...v, ...newState } : v,
    );
    setVariants(updated);
    onStateChange?.(newState);
  };

  // Switch to a different tier list variant
  const handleSwitchVariant = (variantId: string) => {
    if (difficulty && level !== undefined) {
      saveLastViewedVariantId(difficulty, level, variantId);
    }
    setCurrentVariantId(variantId);
  };

  // Create a new custom tier list
  const handleCreateCustom = () => {
    if (!customTierListName.trim()) return;

    const newVariant = createCustomTierListVariant(customTierListName);
    const updated = [...variants, newVariant];
    setVariants(updated);
    setCurrentVariantId(newVariant.id);
    setCustomTierListName("");
    setShowCreateDialog(false);
  };

  // Count custom tier lists
  const customTierListCount = variants.filter(
    (v) => v.type === "custom",
  ).length;
  const canCreateCustom = customTierListCount < 1;

  // Delete a tier list variant (only custom ones)
  const handleDeleteVariant = (variantId: string) => {
    if (variantId === "decimal" || variantId === "category") return; // Protect defaults

    const filtered = variants.filter((v) => v.id !== variantId);
    setVariants(filtered);

    // Switch to decimal if deleting current
    if (variantId === currentVariantId) {
      handleSwitchVariant("decimal");
    }
  };

  // Update a row (name or color)
  const handleUpdateRow = (rowId: string, updates: Partial<TierRow>) => {
    if (!currentVariant) return;

    handleStateChange({
      ...state,
      rows: state.rows.map((r) => (r.id === rowId ? { ...r, ...updates } : r)),
    });
  };

  // Add a new row
  const handleAddRow = (position: "above" | "below", targetRowId?: string) => {
    // Check if we can add more rows
    if (state.rows.length >= MAX_ROWS) {
      alert(`Maximum ${MAX_ROWS} rows reached. You cannot add more rows.`);
      return;
    }

    if (!currentVariant) return;

    const newRow: TierRow = {
      id: generateRowId(),
      name: "New Tier",
      color: "#CCCCCC",
    };

    if (!targetRowId) {
      // Add to end
      handleStateChange({ ...state, rows: [...state.rows, newRow] });
    } else {
      const targetIndex = state.rows.findIndex((r) => r.id === targetRowId);
      if (targetIndex === -1) return;

      const newRows = [...state.rows];
      const insertIndex = position === "above" ? targetIndex : targetIndex + 1;
      newRows.splice(insertIndex, 0, newRow);
      handleStateChange({ ...state, rows: newRows });
    }
  };

  // Move row up
  const handleMoveRowUp = (rowId: string) => {
    const rowIndex = state.rows.findIndex((r) => r.id === rowId);
    if (rowIndex <= 0) return;

    const newRows = [...state.rows];
    [newRows[rowIndex], newRows[rowIndex - 1]] = [
      newRows[rowIndex - 1],
      newRows[rowIndex],
    ];
    handleStateChange({ ...state, rows: newRows });
  };

  // Move row down
  const handleMoveRowDown = (rowId: string) => {
    const rowIndex = state.rows.findIndex((r) => r.id === rowId);
    if (rowIndex >= state.rows.length - 1) return;

    const newRows = [...state.rows];
    [newRows[rowIndex], newRows[rowIndex + 1]] = [
      newRows[rowIndex + 1],
      newRows[rowIndex],
    ];
    handleStateChange({ ...state, rows: newRows });
  };

  // Reorder rows
  const handleReorderRows = (reorderedRows: TierRow[]) => {
    handleStateChange({ ...state, rows: reorderedRows });
  };

  // Row drag-and-drop handlers
  const handleRowDragStart = (rowId: string) => {
    setDraggedRowId(rowId);
    setDraggedChart(null);
    setDragOverRowIdForChart(null);
    setDragOverEmptySpace(false);
  };

  const handleRowDragOver = (
    rowId: string,
    e: React.DragEvent<HTMLDivElement>,
  ) => {
    e.preventDefault();

    // Only set row drop position if dragging a row, not a chart
    if (draggedRowId) {
      setDragOverRowId(rowId);

      // Determine if dropping above or below based on vertical position
      const rect = e.currentTarget.getBoundingClientRect();
      const midpoint = rect.top + rect.height / 2;
      const position = e.clientY < midpoint ? "above" : "below";
      setDropPosition(position);
    }
  };

  const handleRowDragLeave = () => {
    setDragOverRowId(null);
    setDropPosition(null);
  };

  const handleRowDrop = (targetRowId: string) => {
    if (!draggedRowId || draggedRowId === targetRowId) {
      setDraggedRowId(null);
      setDragOverRowId(null);
      setDropPosition(null);
      return;
    }

    const draggedIndex = state.rows.findIndex((r) => r.id === draggedRowId);
    const targetIndex = state.rows.findIndex((r) => r.id === targetRowId);

    if (draggedIndex === -1 || targetIndex === -1) {
      setDraggedRowId(null);
      setDragOverRowId(null);
      setDropPosition(null);
      return;
    }

    const newRows = [...state.rows];
    const [draggedRow] = newRows.splice(draggedIndex, 1);

    // Calculate the correct insert position after removal
    // If dragged from above target, target index shifts down by 1
    let insertIndex = targetIndex;
    if (draggedIndex < targetIndex) {
      insertIndex = targetIndex - 1;
    }

    // Adjust for above/below
    if (dropPosition === "below") {
      insertIndex += 1;
    }

    newRows.splice(insertIndex, 0, draggedRow);

    handleStateChange({ ...state, rows: newRows });
    setDraggedRowId(null);
    setDragOverRowId(null);
    setDropPosition(null);
  };

  // Track recently visited on mount
  useEffect(() => {
    if (!isClient || !difficulty || level === undefined) return;

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

  // Handle tier list name edit completion
  const handleFinishEditingName = () => {
    if (currentVariant && tierListName !== (currentVariant.customLabel || "")) {
      const updated = variants.map((v) =>
        v.id === currentVariantId
          ? { ...v, customLabel: tierListName || undefined }
          : v,
      );
      setVariants(updated);
    }
    setIsEditingName(false);
  };

  // Reset export count when switching tiers (per-level session tracking)
  useEffect(() => {
    setExportCount(0);
    setLastExportTime(0);
  }, [difficulty, level]);

  // Check if current tier is favorited
  useEffect(() => {
    if (!isClient || !difficulty || level === undefined) return;

    try {
      const favorites = JSON.parse(
        localStorage.getItem("tierlist-favorites") || "[]",
      ) as Array<{ difficulty: string; level: number }>;
      const isFav = favorites.some(
        (f) => f.difficulty === difficulty && f.level === level,
      );
      setIsFavorited(isFav);
    } catch {
      setIsFavorited(false);
    }
  }, [isClient, difficulty, level]);

  // Close menus when clicking outside
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (
        moreMenuRef.current &&
        !moreMenuRef.current.contains(event.target as Node)
      ) {
        setShowMoreMenu(false);
      }
    };

    if (showMoreMenu) {
      document.addEventListener("mousedown", handleClickOutside);
      return () =>
        document.removeEventListener("mousedown", handleClickOutside);
    }
  }, [showMoreMenu]);

  // Handle chart click to select/move between rows
  const handleChartClickInRow = (chart: ChartRecord, rowId: string) => {
    if (selectedChartId === chart.id && selectedChartRowId === rowId) {
      // Deselect if clicking same chart
      setSelectedChartId(null);
      setSelectedChartRowId(null);
    } else if (selectedChartId && selectedChartRowId === rowId) {
      // Swap positions if clicking another chart in the same row
      const selectedPlacement = state.placements.find(
        (p) => p.chartId === selectedChartId,
      );
      const clickedPlacement = state.placements.find(
        (p) => p.chartId === chart.id,
      );

      if (selectedPlacement && clickedPlacement) {
        const newPlacements = state.placements.map((p) => {
          if (p.chartId === selectedChartId) {
            return { ...p, xValue: clickedPlacement.xValue };
          } else if (p.chartId === chart.id) {
            return { ...p, xValue: selectedPlacement.xValue };
          }
          return p;
        });
        handleStateChange({ ...state, placements: newPlacements });
        setSelectedChartId(null);
        setSelectedChartRowId(null);
        setActiveRowId(rowId);
      }
    } else if (selectedChartId) {
      // Move selected chart to this row
      const newPlacements = state.placements
        .filter((p) => p.chartId !== selectedChartId)
        .concat({
          chartId: selectedChartId,
          rowId: rowId,
          xValue: state.placements.filter((p) => p.rowId === rowId).length,
        });
      handleStateChange({ ...state, placements: newPlacements });
      setSelectedChartId(null);
      setSelectedChartRowId(null);
      setActiveRowId(rowId);
    } else {
      // Select this chart
      setSelectedChartId(chart.id);
      setSelectedChartRowId(rowId);
    }
  };

  // Handle moving selected chart to a row when clicking empty space
  const handleMoveChartToRow = (rowId: string) => {
    if (selectedChartId) {
      // If same row, move to end; if different row, add to end
      const newPlacements = state.placements
        .filter((p) => p.chartId !== selectedChartId)
        .concat({
          chartId: selectedChartId,
          rowId: rowId,
          xValue:
            state.placements.filter((p) => p.rowId === rowId).length -
            (selectedChartRowId === rowId ? 1 : 0),
        });
      handleStateChange({ ...state, placements: newPlacements });
      setSelectedChartId(null);
      setSelectedChartRowId(null);
      setActiveRowId(rowId);
    }
  };

  // Handle deselecting a chart
  const handleDeselectChart = () => {
    setSelectedChartId(null);
    setSelectedChartRowId(null);
  };

  // Handle deactivating a row
  const handleDeactivateRow = () => {
    setActiveRowId(null);
  };

  // Get placed chart IDs and unplaced charts
  const placedChartIds = new Set(state.placements.map((p) => p.chartId));
  const unplacedCharts = charts.filter((c) => !placedChartIds.has(c.id));

  // Group unplaced charts: base charts and their plus variants together
  const groupedCharts = getGroupedCharts(unplacedCharts);

  // Reset tier list based on current variant type
  const handleReset = () => {
    if (confirm("Are you sure you want to reset this tier list?")) {
      let newRows: TierRow[] = [];
      let newPlacements: Placement[] = [];

      if (currentVariant?.type === "decimal") {
        newRows = createDefaultTiers(level);
      } else if (currentVariant?.type === "category") {
        // Get category rows from fresh variant
        const freshCategory = createCategoryTierListVariant();
        newRows = freshCategory.rows;
      } else if (currentVariant?.type === "custom") {
        // Reset custom to one empty row
        newRows = [
          {
            id: generateRowId(),
            name: "Tier 1",
            color: "#CCCCCC",
          },
        ];
      }

      // Update the current variant with reset rows
      const updated = variants.map((v) =>
        v.id === currentVariantId
          ? { ...v, rows: newRows, placements: newPlacements }
          : v,
      );
      setVariants(updated);
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

  // Remove chart from row
  const handleRemoveChart = (chartId: string) => {
    handleStateChange({
      ...state,
      placements: state.placements.filter((p) => p.chartId !== chartId),
    });
  };

  // Randomly add all unplaced charts to rows
  const handleRandomAddCharts = () => {
    if (unplacedCharts.length === 0 || state.rows.length === 0) {
      alert("Need both unplaced charts and at least one tier to add randomly.");
      return;
    }

    const newPlacements = [...state.placements];

    unplacedCharts.forEach((chart) => {
      // Pick a random row
      const randomRow =
        state.rows[Math.floor(Math.random() * state.rows.length)];

      // Get current charts in this row to calculate xValue
      const rowChartCount = newPlacements.filter(
        (p) => p.rowId === randomRow.id,
      ).length;

      // Add with random-ish xValue (based on position in row)
      newPlacements.push({
        chartId: chart.id,
        rowId: randomRow.id,
        xValue: rowChartCount * 100 + Math.random() * 50, // Spread them out
      });
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

  // Toggle favorite status for this tier
  const handleToggleFavorite = () => {
    if (!difficulty || level === undefined) return;

    try {
      const favorites = JSON.parse(
        localStorage.getItem("tierlist-favorites") || "[]",
      ) as Array<{ difficulty: string; level: number }>;

      let updated: Array<{ difficulty: string; level: number }>;
      if (isFavorited) {
        updated = favorites.filter(
          (f) => !(f.difficulty === difficulty && f.level === level),
        );
      } else {
        updated = [...favorites, { difficulty, level }];
      }

      localStorage.setItem("tierlist-favorites", JSON.stringify(updated));
      setIsFavorited(!isFavorited);
    } catch (error) {
      console.error("Failed to toggle favorite:", error);
    }
  };

  // Drag start
  const handleChartDragStart = (chart: ChartRecord) => {
    console.log("Chart drag start:", chart.id);
    setDraggedChart(chart);
    setDropPosition(null);
    setDragOverRowId(null);
    setDragOverRowIdForChart(null);
    setDraggedRowId(null);
    setDragOverEmptySpace(false);
  };

  // Chart click: select it or add to active row
  const handleChartClick = (chart: ChartRecord) => {
    if (!activeRowId) {
      // No active row: just select the chart
      setSelectedChartId(chart.id);
      setSelectedChartRowId(null);
      return;
    }

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

  // Drag over row - with auto-scroll (for charts)
  const handleChartDragOverRow = (
    rowId: string,
    e: React.DragEvent<HTMLDivElement>,
  ) => {
    e.preventDefault();
    e.dataTransfer.dropEffect = "move";

    // Set that we're dragging a chart over this row
    if (draggedChart && !draggedRowId) {
      console.log(
        "Chart drag over row:",
        rowId,
        "draggedChart:",
        draggedChart.id,
      );
      setDragOverRowIdForChart(rowId);
      setDragOverEmptySpace(true);
      setDropPosition(null); // Explicitly clear dropPosition for chart drag
    }

    // Auto-scroll near edges of viewport
    const scrollZone = 100;
    const scrollSpeed = 10;

    if (e.clientY < scrollZone) {
      window.scrollBy(0, -scrollSpeed);
    } else if (e.clientY > window.innerHeight - scrollZone) {
      window.scrollBy(0, scrollSpeed);
    }
  };

  // Drop on row (for charts)
  const handleChartDropOnRow = (
    rowId: string,
    e: React.DragEvent<HTMLDivElement>,
  ) => {
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
    setDragOverEmptySpace(false);
    setDragOverRowIdForChart(null);
    setDropPosition(null);
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
    // Throttle: prevent exports within 2 seconds
    const now = Date.now();
    if (now - lastExportTime < 2000) {
      return; // Silently ignore rapid clicks
    }

    // Check if user has exported more than 3 times in this session
    if (exportCount >= 3) {
      const confirmed = window.confirm(
        `You've exported ${exportCount} times this session. Continue anyway?`,
      );
      if (!confirmed) return;
    }

    // Disable button and show loading state
    setIsExporting(true);
    setLastExportTime(now);
    setExportCount((prev) => prev + 1);

    try {
      const scale = 2; // High resolution scale (2x)
      const padding = 125;
      const imageItemHeight = 100; // Height per row of images
      const imageSize = 64;
      const imagesPerRow = 6; // 6 charts per row
      const gapSize = 10;
      const labelWidth = 110;

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
        padding +
        labelWidth +
        40 +
        (imagesPerRow * imageSize + (imagesPerRow - 1) * gapSize) +
        padding;
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
        try {
          if (!blob) throw new Error("Could not create blob");
          const url = URL.createObjectURL(blob);
          const link = document.createElement("a");
          link.href = url;
          link.download = `tierlist-${difficulty}-${level}-${Date.now()}.png`;
          link.click();
          URL.revokeObjectURL(url);
        } finally {
          setIsExporting(false);
        }
      }, "image/png");
    } catch (error) {
      console.error("Failed to export image:", error);
      alert("Failed to export tier list as image. Please try again.");
      setIsExporting(false);
    }
  };

  // Export tier list as JSON
  const handleExportJSON = () => {
    try {
      const filename = tierListName
        ? `tierlist-${tierListName.replace(/\s+/g, "-").toLowerCase()}.json`
        : `tierlist-${difficulty}-${level}.json`;
      exportTierListAsJSON(state, filename);
    } catch (error) {
      console.error("Failed to export JSON:", error);
      alert("Failed to export tier list. Please try again.");
    }
  };

  // Import tier list from JSON
  const handleImportJSON = async (
    event: React.ChangeEvent<HTMLInputElement>,
  ) => {
    const file = event.target.files?.[0];
    if (!file) return;

    try {
      const importedState = await importTierListFromJSON(file);

      // Confirm before overwriting
      const confirmed = window.confirm(
        "This will replace your current tier list. Continue?",
      );

      if (confirmed) {
        handleStateChange(importedState);
        // Update name if imported state has one
        if (importedState.name) {
          setTierListName(importedState.name);
        }
        alert("Tier list imported successfully!");
      }
    } catch (error) {
      console.error("Failed to import JSON:", error);
      alert(
        `Failed to import tier list: ${error instanceof Error ? error.message : "Unknown error"}`,
      );
    } finally {
      // Reset file input
      if (fileInputRef.current) {
        fileInputRef.current.value = "";
      }
    }
  };

  // Trigger file input for import
  const handleImportClick = () => {
    fileInputRef.current?.click();
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
    <div className="min-h-screen bg-gray-950 flex flex-col">
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
                    SMX Tier List Maker
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
                <span className="text-xs text-gray-500">Custom name:</span>
                {isEditingName ? (
                  <div className="flex gap-2 items-center flex-1">
                    <input
                      autoFocus
                      type="text"
                      value={tierListName}
                      onChange={(e) => setTierListName(e.target.value)}
                      onKeyDown={(e) => {
                        if (e.key === "Enter") handleFinishEditingName();
                        if (e.key === "Escape") {
                          setTierListName(currentVariant?.customLabel || "");
                          setIsEditingName(false);
                        }
                      }}
                      onBlur={() => handleFinishEditingName()}
                      placeholder="e.g., 'By username' or 'Practice run'"
                      className="px-2 py-1 bg-gray-700 text-white text-sm rounded border border-gray-600 focus:border-blue-500 focus:outline-none max-w-xs"
                    />
                  </div>
                ) : (
                  <button
                    onClick={() => setIsEditingName(true)}
                    className="text-sm text-gray-400 hover:text-gray-200 transition-colors"
                    title="Click to name this tier list"
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

            {/* Tier List Variant Selector */}
            {difficulty && level !== undefined && variants.length > 0 && (
              <div className="mt-2 flex items-center gap-2 flex-wrap">
                <span className="text-xs text-gray-500">Tier List:</span>
                <div className="flex items-center gap-1">
                  <select
                    value={currentVariantId}
                    onChange={(e) => handleSwitchVariant(e.target.value)}
                    className="px-2 py-1 bg-gray-700 text-white text-sm rounded border border-gray-600 focus:border-blue-500 focus:outline-none"
                  >
                    {variants.map((v) => {
                      const label = v.customLabel
                        ? `${v.displayName} - ${v.customLabel}`
                        : v.displayName;
                      const displayLabel =
                        v.type === "custom" ? `${label} (custom)` : label;
                      return (
                        <option key={v.id} value={v.id}>
                          {displayLabel}
                        </option>
                      );
                    })}
                  </select>
                  {/* Delete button for custom tier lists */}
                  {currentVariant?.type === "custom" && (
                    <button
                      onClick={() => {
                        if (
                          window.confirm(
                            `Delete "${currentVariant.customLabel ? `${currentVariant.displayName} - ${currentVariant.customLabel}` : currentVariant.displayName}"?`,
                          )
                        ) {
                          handleDeleteVariant(currentVariantId);
                        }
                      }}
                      className="px-2 py-1 text-xs bg-red-700 text-red-100 hover:bg-red-600 rounded border border-red-600 hover:border-red-500 transition-colors flex items-center gap-1"
                      title="Delete this custom tier list"
                    >
                      <TrashIcon className="w-3 h-3" />
                      Delete
                    </button>
                  )}
                </div>
                {/* Create custom button */}
                {canCreateCustom && (
                  <button
                    onClick={() => setShowCreateDialog(true)}
                    className="px-2 py-1 text-xs bg-gray-700 text-gray-300 hover:text-white rounded border border-gray-600 hover:border-gray-500 transition-colors flex items-center gap-1"
                    title="Create custom tier list"
                  >
                    <PlusIcon className="w-3 h-3" />
                    Custom
                  </button>
                )}
              </div>
            )}
          </div>

          {/* Desktop buttons - Hidden on mobile */}
          <div className="hidden md:flex gap-2">
            <Link
              href="/"
              className="px-4 py-2 bg-blue-500 text-white rounded hover:bg-blue-600 font-medium text-sm hover:scale-105 transition-transform flex items-center gap-2 cursor-pointer"
              title="Go to home"
            >
              <HomeIcon className="w-4 h-4" />
              Home
            </Link>
            <button
              onClick={handleReset}
              className="px-4 py-2 bg-red-500 text-white rounded hover:bg-red-600 font-medium text-sm hover:scale-105 transition-transform flex items-center gap-2 cursor-pointer"
              title="Reset tier list"
            >
              <ArrowPathIcon className="w-4 h-4" />
              Reset
            </button>
            <button
              onClick={() => setShowChartsSidebar(!showChartsSidebar)}
              className="px-4 py-2 bg-purple-500 text-white rounded hover:bg-purple-600 font-medium text-sm hover:scale-105 transition-transform flex items-center gap-2 cursor-pointer"
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
              disabled={
                isExporting ||
                state.placements.length < MINIMUM_CHARTS_TO_EXPORT
              }
              className={`px-4 py-2 bg-orange-500 text-white rounded font-medium text-sm flex items-center gap-2 transition-all ${
                isExporting ||
                state.placements.length < MINIMUM_CHARTS_TO_EXPORT
                  ? "opacity-60 cursor-not-allowed"
                  : "hover:bg-orange-600 hover:scale-105 cursor-pointer"
              }`}
              title={
                state.placements.length < MINIMUM_CHARTS_TO_EXPORT
                  ? `Need at least ${MINIMUM_CHARTS_TO_EXPORT} charts to export`
                  : isExporting
                    ? "Exporting..."
                    : "Export as image"
              }
            >
              <ArrowDownTrayIcon className="w-4 h-4" />
              {isExporting ? "Exporting..." : "Export Image"}
            </button>

            {/* More menu dropdown */}
            <div ref={moreMenuRef} className="relative">
              <button
                onClick={() => setShowMoreMenu(!showMoreMenu)}
                className="px-4 py-2 bg-gray-700 text-white rounded hover:bg-gray-600 font-medium text-sm hover:scale-105 transition-transform flex items-center gap-2 cursor-pointer"
                title="More options"
              >
                <EllipsisVerticalIcon className="w-4 h-4" />
              </button>

              {/* Dropdown menu */}
              {showMoreMenu && (
                <div className="absolute right-0 top-full mt-1 bg-gray-800 border border-gray-700 rounded shadow-lg z-50 min-w-max">
                  <button
                    onClick={() => {
                      handleToggleFavorite();
                      setShowMoreMenu(false);
                    }}
                    className={`w-full px-4 py-2 text-left font-medium text-sm flex items-center gap-2 transition-colors ${
                      isFavorited
                        ? "bg-yellow-600 hover:bg-yellow-700 text-gray-900"
                        : "text-white hover:bg-gray-700"
                    }`}
                  >
                    <StarIcon className="w-4 h-4" />
                    {isFavorited ? "Remove Favorite" : "Add Favorite"}
                  </button>
                  <button
                    onClick={() => {
                      handleExportJSON();
                      setShowMoreMenu(false);
                    }}
                    className="w-full px-4 py-2 text-left text-white font-medium text-sm flex items-center gap-2 hover:bg-gray-700 transition-colors"
                  >
                    <ArrowDownTrayIcon className="w-4 h-4" />
                    Export Tier List
                  </button>
                  <button
                    onClick={() => {
                      handleImportClick();
                      setShowMoreMenu(false);
                    }}
                    className="w-full px-4 py-2 text-left text-white font-medium text-sm flex items-center gap-2 hover:bg-gray-700 transition-colors"
                  >
                    <ArrowUpTrayIcon className="w-4 h-4" />
                    Import Tier List
                  </button>
                  <button
                    onClick={() => {
                      setShowHelpModal(true);
                      setShowMoreMenu(false);
                    }}
                    className="w-full px-4 py-2 text-left text-white font-medium text-sm flex items-center gap-2 hover:bg-gray-700 transition-colors"
                  >
                    <QuestionMarkCircleIcon className="w-4 h-4" />
                    Help
                  </button>
                </div>
              )}
            </div>

            {/* Hidden file input for JSON import */}
            <input
              ref={fileInputRef}
              type="file"
              accept=".json"
              onChange={handleImportJSON}
              className="hidden"
              aria-label="Import tier list JSON file"
            />
          </div>

          {/* Mobile menu button */}
          <button
            onClick={() => setShowHeaderMenu(!showHeaderMenu)}
            className="md:hidden flex flex-col gap-1 p-2 hover:bg-gray-800 rounded cursor-pointer"
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
              className="block px-4 py-2 bg-blue-500 text-white rounded hover:bg-blue-600 font-medium text-sm text-center flex items-center justify-center gap-2 cursor-pointer"
            >
              <HomeIcon className="w-4 h-4" />
              Home
            </Link>
            <button
              onClick={() => {
                handleReset();
                setShowHeaderMenu(false);
              }}
              className="w-full px-4 py-2 bg-red-500 text-white rounded hover:bg-red-600 font-medium text-sm flex items-center justify-center gap-2 cursor-pointer"
            >
              <ArrowPathIcon className="w-4 h-4" />
              Reset
            </button>
            <button
              onClick={() => {
                setShowChartsSidebar(!showChartsSidebar);
                setShowHeaderMenu(false);
              }}
              className="w-full px-4 py-2 bg-purple-500 text-white rounded hover:bg-purple-600 font-medium text-sm flex items-center justify-center gap-2 cursor-pointer"
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
              disabled={
                isExporting ||
                state.placements.length < MINIMUM_CHARTS_TO_EXPORT
              }
              className={`w-full px-4 py-2 bg-orange-500 text-white rounded font-medium text-sm flex items-center justify-center gap-2 transition-all ${
                isExporting ||
                state.placements.length < MINIMUM_CHARTS_TO_EXPORT
                  ? "opacity-60 cursor-not-allowed"
                  : "hover:bg-orange-600 cursor-pointer"
              }`}
              title={
                state.placements.length < MINIMUM_CHARTS_TO_EXPORT
                  ? `Need at least ${MINIMUM_CHARTS_TO_EXPORT} charts to export`
                  : isExporting
                    ? "Exporting..."
                    : "Export as image"
              }
            >
              {isExporting ? "Exporting..." : "Export as Image"}
            </button>

            {/* Mobile More Menu */}
            <div ref={moreMenuRef} className="border-t border-gray-700 pt-2">
              <button
                onClick={() => setShowMoreMenu(!showMoreMenu)}
                className="w-full px-4 py-2 bg-gray-700 text-white rounded hover:bg-gray-600 font-medium text-sm flex items-center justify-center gap-2 cursor-pointer"
              >
                <EllipsisVerticalIcon className="w-4 h-4" />
                More Options
              </button>

              {showMoreMenu && (
                <div
                  className="mt-2 space-y-1"
                  onClick={(e) => e.stopPropagation()}
                >
                  <button
                    onClick={() => {
                      handleToggleFavorite();
                      setShowMoreMenu(false);
                    }}
                    className={`w-full px-4 py-2 rounded font-medium text-sm flex items-center justify-center gap-2 ${
                      isFavorited
                        ? "bg-yellow-600 hover:bg-yellow-700 text-gray-900"
                        : "bg-gray-600 hover:bg-gray-700 text-white"
                    }`}
                  >
                    <StarIcon className="w-4 h-4" />
                    {isFavorited ? "Remove Favorite" : "Add Favorite"}
                  </button>
                  <button
                    onClick={() => {
                      handleExportJSON();
                      setShowMoreMenu(false);
                    }}
                    className="w-full px-4 py-2 bg-green-600 text-white rounded hover:bg-green-700 font-medium text-sm flex items-center justify-center gap-2"
                  >
                    <ArrowDownTrayIcon className="w-4 h-4" />
                    Export Tier List
                  </button>
                  <button
                    onClick={() => {
                      handleImportClick();
                      setShowMoreMenu(false);
                    }}
                    className="w-full px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700 font-medium text-sm flex items-center justify-center gap-2"
                  >
                    <ArrowUpTrayIcon className="w-4 h-4" />
                    Import Tier List
                  </button>
                  <button
                    onClick={() => {
                      setShowHelpModal(true);
                      setShowMoreMenu(false);
                    }}
                    className="w-full px-4 py-2 bg-yellow-600 text-white rounded hover:bg-yellow-700 font-medium text-sm flex items-center justify-center gap-2"
                  >
                    <QuestionMarkCircleIcon className="w-4 h-4" />
                    Help
                  </button>
                  <button
                    onClick={() => {
                      setShowHelpModal(true);
                      setShowMoreMenu(false);
                    }}
                    className="w-full px-4 py-2 bg-yellow-600 text-white rounded hover:bg-yellow-700 font-medium text-sm flex items-center justify-center gap-2"
                  >
                    <QuestionMarkCircleIcon className="w-4 h-4" />
                    Help
                  </button>
                </div>
              )}
            </div>
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
            onClick={(e) => {
              // Only deselect if clicking directly on this container (empty space)
              if (e.target === e.currentTarget) {
                if (selectedChartId) {
                  handleDeselectChart();
                }
                if (activeRowId) {
                  handleDeactivateRow();
                }
              }
            }}
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
                  <div key={row.id}>
                    <TierRowComponent
                      row={row}
                      charts={charts}
                      placements={state.placements}
                      onRemoveChart={handleRemoveChart}
                      onReorderCharts={() => {}}
                      onDeleteRow={handleRemoveRow}
                      onUpdateRow={handleUpdateRow}
                      onAddRowAbove={() => handleAddRow("above", row.id)}
                      onAddRowBelow={() => handleAddRow("below", row.id)}
                      onMoveRowUp={() => handleMoveRowUp(row.id)}
                      onMoveRowDown={() => handleMoveRowDown(row.id)}
                      onChartDragStart={handleChartDragStart}
                      onChartClick={handleChartClickInRow}
                      onMoveChartToRow={handleMoveChartToRow}
                      selectedChartId={selectedChartId}
                      selectedChartRowId={selectedChartRowId}
                      isActive={activeRowId === row.id}
                      onActivate={() => setActiveRowId(row.id)}
                      onDeactivate={handleDeactivateRow}
                      onDeselect={handleDeselectChart}
                      totalRows={state.rows.length}
                      maxRows={MAX_ROWS}
                      isDraggingRow={draggedRowId === row.id}
                      isDragOverRow={
                        dragOverRowIdForChart === row.id ||
                        (dragOverRowId === row.id && draggedRowId !== null)
                      }
                      dropPosition={
                        dragOverRowId === row.id ? dropPosition : null
                      }
                      onRowDragStart={handleRowDragStart}
                      onRowDragOver={handleRowDragOver}
                      onRowDragLeave={handleRowDragLeave}
                      onRowDrop={handleRowDrop}
                      onChartDragOverRow={(e) =>
                        handleChartDragOverRow(row.id, e)
                      }
                      onChartDragLeaveRow={() => {
                        setDragOverEmptySpace(false);
                        setDragOverRowId(null);
                        setDragOverRowIdForChart(null);
                        setDropPosition(null);
                      }}
                      onChartDropOnRow={(e) => handleChartDropOnRow(row.id, e)}
                    />
                  </div>
                ))
              )}
            </div>
          </div>
        </div>

        {/* Right/Bottom: collapsible charts sidebar */}
        {showChartsSidebar && unplacedCharts.length > 0 && (
          <div className="fixed lg:relative bottom-0 lg:bottom-auto lg:right-auto lg:top-auto w-full lg:w-80 h-48 md:h-56 lg:h-full bg-gray-800 lg:border-l-2 border-t-2 lg:border-t-0 border-gray-700 flex flex-col flex-shrink-0 overflow-hidden z-40">
            <div className="p-2 md:p-4 border-b border-gray-700 flex-shrink-0">
              <div className="flex justify-between items-start gap-2 mb-2">
                <div>
                  <h2 className="text-sm md:text-lg font-bold text-white">
                    Available Charts
                  </h2>
                  <p className="text-xs text-gray-400 mt-0.5">
                    {unplacedCharts.length} unplaced
                  </p>
                </div>
                {unplacedCharts.length > 0 && state.rows.length > 0 && (
                  <button
                    onClick={handleRandomAddCharts}
                    className="px-2 py-1 bg-green-600 text-white rounded hover:bg-green-700 transition-colors flex items-center gap-1 flex-shrink-0 text-xs md:text-sm font-medium"
                    title="Add all unplaced charts to random tiers"
                  >
                    <PlusIcon className="w-3 h-3 md:w-4 md:h-4" />
                    Add All
                  </button>
                )}
              </div>
            </div>
            <div className="flex-1 overflow-y-auto p-2 md:p-4">
              {unplacedCharts.length === 0 ? (
                <p className="text-gray-500 text-center py-4 text-xs">
                  All charts are placed in tiers!
                </p>
              ) : (
                <div
                  className="grid grid-cols-4 md:grid-cols-3 gap-1 md:gap-2"
                  onClick={(e) => {
                    // Only deselect if clicking directly on grid (empty space)
                    if (e.target === e.currentTarget && selectedChartId) {
                      setSelectedChartId(null);
                      setSelectedChartRowId(null);
                    }
                  }}
                >
                  {unplacedCharts.map((chart) => (
                    <div
                      key={chart.id}
                      draggable="true"
                      onDragStart={(e) => {
                        e.dataTransfer.effectAllowed = "move";
                        e.dataTransfer.setData("chartId", chart.id);
                        handleChartDragStart(chart);
                      }}
                      onClick={() => handleChartClick(chart)}
                      className={`w-20 h-20 cursor-pointer transition-all ${
                        selectedChartId === chart.id
                          ? "ring-2 ring-yellow-400"
                          : ""
                      }`}
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

      {/* Help Modal */}
      <HelpModal
        isOpen={showHelpModal}
        onClose={() => setShowHelpModal(false)}
      />

      {/* Create Custom Tier List Modal */}
      {showCreateDialog && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
          <div className="bg-gray-900 rounded-lg p-6 max-w-sm w-full mx-4 border border-gray-700">
            <h2 className="text-xl font-bold text-white mb-2">
              Create Custom Tier List
            </h2>
            <p className="text-xs text-gray-400 mb-4">
              You can create one custom tier list per difficulty level
            </p>
            <input
              autoFocus
              type="text"
              value={customTierListName}
              onChange={(e) => setCustomTierListName(e.target.value)}
              onKeyDown={(e) => {
                if (e.key === "Enter") handleCreateCustom();
                if (e.key === "Escape") {
                  setShowCreateDialog(false);
                  setCustomTierListName("");
                }
              }}
              placeholder="Enter tier list name"
              className="w-full px-3 py-2 bg-gray-800 text-white rounded border border-gray-700 focus:border-blue-500 focus:outline-none mb-4"
            />
            <div className="flex gap-2 justify-end">
              <button
                onClick={() => {
                  setShowCreateDialog(false);
                  setCustomTierListName("");
                }}
                className="px-4 py-2 bg-gray-700 text-white rounded hover:bg-gray-600 transition-colors"
              >
                Cancel
              </button>
              <button
                onClick={handleCreateCustom}
                disabled={!customTierListName.trim()}
                className="px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
              >
                Create
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
