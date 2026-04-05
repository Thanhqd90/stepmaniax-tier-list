"use client";

import type { ChartRecord, Placement, TierRow } from "@/types/smx";
import { ChartCard } from "./ChartCard";
import { useState, useRef, useEffect } from "react";
import {
  EllipsisVerticalIcon,
  TrashIcon,
  PlusIcon,
  ChevronUpIcon,
  ChevronDownIcon,
  SparklesIcon,
  Cog6ToothIcon,
} from "@heroicons/react/24/solid";

interface TierRowProps {
  row: TierRow;
  charts: ChartRecord[];
  placements: Placement[];
  onRemoveChart: (chartId: string) => void;
  onReorderCharts: (args: {
    fromRowId: string;
    toRowId: string;
    fromIndex: number;
    toIndex: number;
    chartId: string;
  }) => void;
  onDeleteRow: (rowId: string) => void;
  onUpdateRow: (rowId: string, updates: Partial<TierRow>) => void;
  onAddRowAbove?: (rowId: string) => void;
  onAddRowBelow?: (rowId: string) => void;
  onMoveRowUp?: (rowId: string) => void;
  onMoveRowDown?: (rowId: string) => void;
  onChartDragStart?: (chart: ChartRecord) => void;
  onChartClick?: (chart: ChartRecord, rowId: string) => void;
  onMoveChartToRow?: (rowId: string) => void;
  selectedChartId?: string | null;
  selectedChartRowId?: string | null;
  isActive?: boolean;
  onActivate?: () => void;
  onDeactivate?: () => void;
  onDeselect?: () => void;
  totalRows?: number;
  maxRows?: number;
  isDraggingRow?: boolean;
  isDragOverRow?: boolean;
  dropPosition?: "above" | "below" | null;
  onRowDragStart?: (rowId: string) => void;
  onRowDragOver?: (rowId: string, e: React.DragEvent<HTMLDivElement>) => void;
  onRowDragLeave?: () => void;
  onRowDrop?: (rowId: string) => void;
  onChartDragOverRow?: (e: React.DragEvent<HTMLDivElement>) => void;
  onChartDragLeaveRow?: () => void;
  onChartDropOnRow?: (e: React.DragEvent<HTMLDivElement>) => void;
}

/**
 * Tier row component displaying a row of ranked charts
 */
export function TierRowComponent({
  row,
  charts,
  placements,
  onRemoveChart,
  onReorderCharts,
  onDeleteRow,
  onUpdateRow,
  onAddRowAbove,
  onAddRowBelow,
  onMoveRowUp,
  onMoveRowDown,
  onChartDragStart,
  onChartClick,
  onMoveChartToRow,
  selectedChartId,
  selectedChartRowId,
  isActive = false,
  onActivate,
  onDeactivate,
  onDeselect,
  totalRows = 0,
  maxRows = 12,
  isDraggingRow = false,
  isDragOverRow = false,
  dropPosition = null,
  onRowDragStart,
  onRowDragOver,
  onRowDragLeave,
  onRowDrop,
  onChartDragOverRow,
  onChartDragLeaveRow,
  onChartDropOnRow,
}: TierRowProps) {
  const [isEditingName, setIsEditingName] = useState(false);
  const [editingName, setEditingName] = useState(row.name);
  const [showMenu, setShowMenu] = useState(false);
  const [showColorPicker, setShowColorPicker] = useState(false);
  const [isDeleting, setIsDeleting] = useState(false);
  const [dragOverChartIdx, setDragOverChartIdx] = useState<number | null>(null);
  const [dragSide, setDragSide] = useState<"left" | "right" | null>(null);
  const menuRef = useRef<HTMLDivElement>(null);

  // Check if we can add more rows
  const canAddRow = totalRows < maxRows;

  // Generate random color
  const generateRandomColor = () => {
    const colors = [
      "#FF6B6B", // Red
      "#FF8A7F", // Orange-Red
      "#FFA07A", // Light Salmon
      "#FFB68F", // Peach
      "#FFCCA3", // Light Orange
      "#FFE2B8", // Lighter Orange
      "#FFF0D0", // Very Light Orange
      "#4ECDC4", // Teal
      "#45B7D1", // Sky Blue
      "#96CEB4", // Sage Green
      "#FFEAA7", // Yellow
      "#DFE6E9", // Light Gray
    ];
    return colors[Math.floor(Math.random() * colors.length)];
  };

  // Close menu when clicking outside
  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (menuRef.current && !menuRef.current.contains(e.target as Node)) {
        setShowMenu(false);
        setShowColorPicker(false);
      }
    };

    if (showMenu) {
      document.addEventListener("mousedown", handleClickOutside);
      return () =>
        document.removeEventListener("mousedown", handleClickOutside);
    }
  }, [showMenu]);
  // Get charts in this row, sorted by xValue
  const rowCharts = placements
    .filter((p) => p.rowId === row.id)
    .sort((a, b) => a.xValue - b.xValue)
    .map((p) => charts.find((c) => c.id === p.chartId))
    .filter(Boolean) as ChartRecord[];

  return (
    <>
      <style>{`
        @keyframes slideInUp {
          from {
            opacity: 0;
            transform: translateY(20px);
          }
          to {
            opacity: 1;
            transform: translateY(0);
          }
        }
        @keyframes slideOutDown {
          from {
            opacity: 1;
            transform: translateY(0);
          }
          to {
            opacity: 0;
            transform: translateY(20px);
          }
        }
      `}</style>
      <div
        draggable
        onDragStart={(e) => {
          e.dataTransfer.setData("rowId", row.id);
          e.dataTransfer.effectAllowed = "move";
          onRowDragStart?.(row.id);
        }}
        onDragOver={(e) => {
          e.preventDefault();
          const isChart = e.dataTransfer.types.includes("chartid");
          if (isChart) {
            onChartDragOverRow?.(e);
          } else {
            onRowDragOver?.(row.id, e);
          }
        }}
        onDragLeave={() => {
          onRowDragLeave?.();
          onChartDragLeaveRow?.();
        }}
        onDrop={(e) => {
          e.preventDefault();
          const isChart = e.dataTransfer.types.includes("chartid");
          if (isChart) {
            onChartDropOnRow?.(e);
          } else {
            onRowDrop?.(row.id);
          }
        }}
        onClick={() => {
          // If a chart is selected, deselect it when clicking on the row
          if (selectedChartId) {
            onDeselect?.();
          } else if (isActive) {
            // If row is already active, deactivate it
            onDeactivate?.();
          } else {
            // Otherwise activate the row
            onActivate?.();
          }
        }}
        className={`flex gap-2 md:gap-4 p-3 md:p-6 rounded-lg border-2 mb-2 md:mb-4 transition-all relative
        ${isActive ? "ring-2 ring-blue-500 ring-offset-2 shadow-lg" : ""}
        ${isDraggingRow ? "opacity-50" : ""}
        ${isDragOverRow && dropPosition ? "ring-2 ring-yellow-400 ring-offset-2" : ""}
        ${isDragOverRow && !dropPosition ? "ring-2 ring-blue-400 ring-offset-2" : ""}
      `}
        style={{
          borderColor: row.color,
          backgroundColor: `${row.color}15`,
          animation: isDeleting
            ? "slideOutDown 0.3s ease-out forwards"
            : "slideInUp 0.3s ease-out",
        }}
      >
        {/* Insertion line indicator - for row-to-row drag */}
        {isDragOverRow && dropPosition && (
          <>
            {dropPosition === "above" && (
              <div className="absolute top-0 left-0 right-0 flex items-center justify-center z-10">
                <div className="h-0.5 bg-blue-500 flex-1" />
                <span className="px-2 text-xs font-bold text-blue-500 bg-gray-900 rounded">
                  ↑ INSERT ABOVE
                </span>
                <div className="h-0.5 bg-blue-500 flex-1" />
              </div>
            )}
            {dropPosition === "below" && (
              <div className="absolute bottom-0 left-0 right-0 flex items-center justify-center z-10">
                <div className="h-0.5 bg-green-500 flex-1" />
                <span className="px-2 text-xs font-bold text-green-500 bg-gray-900 rounded">
                  ↓ INSERT BELOW
                </span>
                <div className="h-0.5 bg-green-500 flex-1" />
              </div>
            )}
          </>
        )}

        {/* Row Number Label - Centered */}
        <div className="flex items-center justify-center flex-shrink-0 flex-col gap-1 relative w-24 pr-2">
          {isEditingName ? (
            <input
              autoFocus
              type="text"
              value={editingName}
              onChange={(e) => setEditingName(e.target.value)}
              onKeyDown={(e) => {
                if (e.key === "Enter") {
                  onUpdateRow(row.id, { name: editingName });
                  setIsEditingName(false);
                }
                if (e.key === "Escape") {
                  setEditingName(row.name);
                  setIsEditingName(false);
                }
              }}
              onBlur={() => {
                onUpdateRow(row.id, { name: editingName });
                setIsEditingName(false);
              }}
              className="px-1 py-0.5 bg-gray-700 text-white text-xs md:text-sm rounded border border-gray-600 focus:border-blue-500 focus:outline-none min-w-12"
            />
          ) : (
            <p
              className="text-sm md:text-lg font-bold text-center text-gray-100 cursor-pointer hover:text-gray-200"
              onClick={() => {
                setEditingName(row.name);
                setIsEditingName(true);
              }}
              style={{ color: row.color }}
            >
              {row.name}
            </p>
          )}

          {/* Row edit menu */}
          <div className="flex gap-1 items-center relative" ref={menuRef}>
            {/* Move up arrow */}
            <button
              onClick={(e) => {
                e.stopPropagation();
                onMoveRowUp?.(row.id);
              }}
              className="p-1 hover:bg-gray-700 rounded inline-flex items-center justify-center transition-colors"
              title="Move row up"
              disabled={!onMoveRowUp}
            >
              <ChevronUpIcon className="w-4 h-4 text-gray-400" />
            </button>

            {/* Move down arrow */}
            <button
              onClick={(e) => {
                e.stopPropagation();
                onMoveRowDown?.(row.id);
              }}
              className="p-1 hover:bg-gray-700 rounded inline-flex items-center justify-center transition-colors"
              title="Move row down"
              disabled={!onMoveRowDown}
            >
              <ChevronDownIcon className="w-4 h-4 text-gray-400" />
            </button>

            <button
              onClick={(e) => {
                e.stopPropagation();
                setShowMenu(!showMenu);
              }}
              className="p-1 hover:bg-gray-700 rounded inline-flex items-center justify-center transition-colors"
              title="Row menu"
            >
              <Cog6ToothIcon className="w-4 h-4 text-gray-400" />
            </button>

            {showMenu && (
              <div className="absolute left-0 top-full mt-1 z-50 bg-gray-800 border border-gray-600 rounded shadow-lg min-w-max">
                {/* Color picker */}
                {showColorPicker ? (
                  <>
                    <div className="px-3 py-2 text-xs text-gray-400 border-b border-gray-700">
                      Select Row Color
                    </div>
                    <div className="px-3 py-3">
                      <input
                        type="color"
                        value={row.color}
                        onChange={(e) => {
                          onUpdateRow(row.id, { color: e.target.value });
                        }}
                        className="w-full h-12 rounded cursor-pointer"
                        autoFocus
                      />
                    </div>
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        setShowColorPicker(false);
                      }}
                      className="w-full px-3 py-1.5 text-left text-xs text-gray-400 hover:text-gray-300 hover:bg-gray-700 transition-colors border-t border-gray-700"
                    >
                      ← Back to Menu
                    </button>
                  </>
                ) : (
                  <>
                    {/* Rename option */}
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        setEditingName(row.name);
                        setIsEditingName(true);
                        setShowMenu(false);
                      }}
                      className="w-full px-3 py-2 text-left text-sm hover:bg-gray-700 transition-colors flex items-center gap-2 border-b border-gray-700"
                    >
                      <span className="text-gray-400">✏️</span>
                      Rename Row
                    </button>

                    {/* Color section */}
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        setShowColorPicker(true);
                      }}
                      className="w-full px-3 py-2 text-left text-sm hover:bg-gray-700 transition-colors flex items-center gap-2 border-b border-gray-700"
                    >
                      <div
                        className="w-3 h-3 rounded border border-gray-600"
                        style={{ backgroundColor: row.color }}
                      />
                      Choose Color
                    </button>

                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        const newColor = generateRandomColor();
                        onUpdateRow(row.id, { color: newColor });
                        setShowMenu(false);
                      }}
                      className="w-full px-3 py-2 text-left text-sm hover:bg-gray-700 transition-colors flex items-center gap-2 border-b border-gray-700"
                    >
                      <SparklesIcon className="w-3 h-3 text-yellow-400" />
                      Random Color
                    </button>

                    {/* Add rows section */}
                    {canAddRow && (
                      <>
                        <button
                          onClick={(e) => {
                            e.stopPropagation();
                            onAddRowAbove?.(row.id);
                            setShowMenu(false);
                          }}
                          className="w-full px-3 py-2 text-left text-sm hover:bg-gray-700 transition-colors flex items-center gap-2 border-b border-gray-700"
                        >
                          <ChevronUpIcon className="w-3 h-3 text-gray-400" />
                          Add Row Above
                        </button>

                        <button
                          onClick={(e) => {
                            e.stopPropagation();
                            onAddRowBelow?.(row.id);
                            setShowMenu(false);
                          }}
                          className="w-full px-3 py-2 text-left text-sm hover:bg-gray-700 transition-colors flex items-center gap-2 border-b border-gray-700"
                        >
                          <ChevronDownIcon className="w-3 h-3 text-gray-400" />
                          Add Row Below
                        </button>
                      </>
                    )}

                    {/* Max rows warning */}
                    {!canAddRow && (
                      <div className="w-full px-3 py-2 text-xs text-red-400 bg-red-950 bg-opacity-40 border-b border-red-900 flex items-center gap-2">
                        ⚠️ Maximum {maxRows} rows reached
                      </div>
                    )}

                    {/* Delete section */}
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        if (window.confirm(`Delete "${row.name}" row?`)) {
                          setIsDeleting(true);
                          // Wait for animation to complete before actually deleting
                          setTimeout(() => {
                            onDeleteRow(row.id);
                          }, 300);
                        }
                        setShowMenu(false);
                      }}
                      className="w-full px-3 py-2 text-left text-sm hover:bg-red-900 transition-colors flex items-center gap-2 text-red-400"
                    >
                      <TrashIcon className="w-3 h-3" />
                      Delete Row
                    </button>
                  </>
                )}
              </div>
            )}
          </div>
        </div>

        {/* Charts Grid */}
        <div
          className="flex-1"
          onClick={(e) => {
            if (selectedChartId) {
              e.stopPropagation();
              if (selectedChartRowId === row.id) {
                // Deselect if clicking empty space in same row as selected chart
                onDeselect?.();
              } else {
                // Move to different row
                onMoveChartToRow?.(row.id);
              }
            }
          }}
        >
          {rowCharts.length === 0 ? (
            <div className="flex items-center justify-center h-16 md:h-24 bg-gray-800 rounded border-2 border-dashed border-gray-700">
              <p className="text-gray-400 text-xs md:text-sm font-medium">
                {selectedChartId && isActive
                  ? "Tap to move chart here"
                  : "There are no charts in this row"}
              </p>
            </div>
          ) : (
            <div className="flex flex-wrap gap-2 md:gap-3">
              {rowCharts.map((chart, chartIdx) => {
                const isSelected = selectedChartId === chart.id;
                return (
                  <div
                    key={chart.id}
                    draggable
                    className={`relative group w-16 md:w-20 cursor-pointer transition-all ${isSelected ? "ring-2 ring-yellow-400" : ""}${dragOverChartIdx === chartIdx ? " opacity-60" : ""}`}
                    style={{ touchAction: "none" }}
                    onClick={(e) => {
                      e.stopPropagation();
                      onChartClick?.(chart, row.id);
                    }}
                    onDragStart={(e) => {
                      e.stopPropagation();
                      e.dataTransfer.effectAllowed = "move";
                      e.dataTransfer.setData("chartId", chart.id);
                      e.dataTransfer.setData("fromRowId", row.id);
                      e.dataTransfer.setData("fromIndex", String(chartIdx));
                      onChartDragStart?.(chart);
                    }}
                    onDragOver={(e) => {
                      e.preventDefault();
                      e.stopPropagation();
                      e.dataTransfer.dropEffect = "move";
                      const rect = e.currentTarget.getBoundingClientRect();
                      const side =
                        e.clientX < rect.left + rect.width / 2
                          ? "left"
                          : "right";
                      setDragOverChartIdx(chartIdx);
                      setDragSide(side);
                    }}
                    onDragLeave={(e) => {
                      e.stopPropagation();
                      setDragOverChartIdx(null);
                      setDragSide(null);
                    }}
                    onDrop={(e) => {
                      e.preventDefault();
                      e.stopPropagation();
                      setDragOverChartIdx(null);
                      setDragSide(null);
                      const fromRowId = e.dataTransfer.getData("fromRowId");
                      const fromIndex = parseInt(
                        e.dataTransfer.getData("fromIndex"),
                        10,
                      );
                      const chartId = e.dataTransfer.getData("chartId");
                      if (chartId && onReorderCharts) {
                        const rect = e.currentTarget.getBoundingClientRect();
                        const side =
                          e.clientX < rect.left + rect.width / 2
                            ? "left"
                            : "right";
                        const insertIndex =
                          side === "right" ? chartIdx + 1 : chartIdx;
                        onReorderCharts({
                          fromRowId,
                          toRowId: row.id,
                          fromIndex,
                          toIndex: insertIndex,
                          chartId,
                        });
                      }
                    }}
                    onTouchStart={(e) => {
                      const touch = e.touches[0];
                      e.currentTarget.dataset.touchStartX = touch.clientX;
                      e.currentTarget.dataset.touchStartY = touch.clientY;
                      e.currentTarget.dataset.touchMoved = "false";
                    }}
                    onTouchMove={(e) => {
                      const touch = e.touches[0];
                      const startX = parseFloat(
                        e.currentTarget.dataset.touchStartX || "0",
                      );
                      const startY = parseFloat(
                        e.currentTarget.dataset.touchStartY || "0",
                      );
                      const dx = touch.clientX - startX;
                      const dy = touch.clientY - startY;
                      if (Math.abs(dx) > 10 || Math.abs(dy) > 10) {
                        e.currentTarget.dataset.touchMoved = "true";
                        e.currentTarget.style.transform = `translate(${dx}px, ${dy}px)`;
                        e.currentTarget.style.opacity = "0.6";
                        e.currentTarget.style.zIndex = "1000";
                        e.currentTarget.style.position = "relative";
                      }
                    }}
                    onTouchEnd={(e) => {
                      if (e.currentTarget.dataset.touchMoved !== "true") return;
                      e.currentTarget.style.transform = "";
                      e.currentTarget.style.opacity = "";
                      e.currentTarget.style.zIndex = "";
                      e.currentTarget.style.position = "";
                      const touch = e.changedTouches[0];
                      const target = document.elementFromPoint(
                        touch.clientX,
                        touch.clientY,
                      );
                      let dropRowId = row.id;
                      let dropIndex = chartIdx;
                      if (target) {
                        const dropChart = target.closest("[data-chart-id]");
                        if (dropChart && dropChart !== e.currentTarget) {
                          dropRowId =
                            dropChart.getAttribute("data-row-id") || row.id;
                          dropIndex = parseInt(
                            dropChart.getAttribute("data-chart-idx") ||
                              String(chartIdx),
                            10,
                          );
                        } else {
                          const dropRow = target.closest("[data-row-id]");
                          if (dropRow) {
                            dropRowId =
                              dropRow.getAttribute("data-row-id") || row.id;
                            dropIndex = -1; // drop at end
                          }
                        }
                      }
                      if (onReorderCharts) {
                        onReorderCharts({
                          fromRowId: row.id,
                          toRowId: dropRowId,
                          fromIndex: chartIdx,
                          toIndex: dropIndex,
                          chartId: chart.id,
                        });
                      }
                    }}
                    data-chart-id={chart.id}
                    data-row-id={row.id}
                    data-chart-idx={chartIdx}
                  >
                    {dragOverChartIdx === chartIdx && dragSide === "left" && (
                      <div className="absolute left-0 top-0 bottom-0 w-0.5 bg-blue-400 z-20 rounded" />
                    )}
                    {dragOverChartIdx === chartIdx && dragSide === "right" && (
                      <div className="absolute right-0 top-0 bottom-0 w-0.5 bg-blue-400 z-20 rounded" />
                    )}
                    <ChartCard chart={chart} compact={true} />
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        onRemoveChart(chart.id);
                      }}
                      className="
                      absolute top-0.5 md:top-1 right-0.5 md:right-1 bg-red-500 text-white
                      rounded-full w-5 md:w-6 h-5 md:h-6 flex items-center justify-center
                      opacity-0 group-hover:opacity-100 transition-opacity
                      text-xs font-bold hover:bg-red-600 z-10
                    "
                    >
                      ×
                    </button>
                  </div>
                );
              })}
            </div>
          )}
        </div>
      </div>
    </>
  );
}
