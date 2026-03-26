"use client";

import type { ChartRecord, Placement, TierRow } from "@/types/smx";
import { ChartCard } from "./ChartCard";
import { useState } from "react";

interface TierRowProps {
  row: TierRow;
  charts: ChartRecord[];
  placements: Placement[];
  onRemoveChart: (chartId: string) => void;
  onReorderCharts: (chartIds: string[]) => void;
  onDeleteRow: (rowId: string) => void;
  onUpdateRow: (rowId: string, updates: Partial<TierRow>) => void;
  onChartDragStart?: (chart: ChartRecord) => void;
  onChartClick?: (chart: ChartRecord, rowId: string) => void;
  onMoveChartToRow?: (rowId: string) => void;
  selectedChartId?: string | null;
  selectedChartRowId?: string | null;
  isActive?: boolean;
  onActivate?: () => void;
  onDeactivate?: () => void;
  onDeselect?: () => void;
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
  onChartDragStart,
  onChartClick,
  onMoveChartToRow,
  selectedChartId,
  selectedChartRowId,
  isActive = false,
  onActivate,
  onDeactivate,
  onDeselect,
}: TierRowProps) {
  // Get charts in this row, sorted by xValue
  const rowCharts = placements
    .filter((p) => p.rowId === row.id)
    .sort((a, b) => a.xValue - b.xValue)
    .map((p) => charts.find((c) => c.id === p.chartId))
    .filter(Boolean) as ChartRecord[];

  return (
    <div
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
      className={`flex gap-2 md:gap-4 p-2 md:p-4 rounded-lg border-2 mb-2 md:mb-4 cursor-pointer transition-all
        ${isActive ? "ring-2 ring-blue-500 ring-offset-2 shadow-lg" : ""}
      `}
      style={{ borderColor: row.color, backgroundColor: `${row.color}15` }}
    >
      {/* Row Number Label - Centered */}
      <div className="flex items-center justify-center flex-shrink-0 min-w-12 md:min-w-16">
        <p
          className="text-sm md:text-lg font-bold text-center text-gray-100"
          style={{ color: row.color }}
        >
          {row.name}
        </p>
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
          <div className="flex flex-wrap gap-1 md:gap-2">
            {rowCharts.map((chart) => {
              const isSelected = selectedChartId === chart.id;
              return (
                <div
                  key={chart.id}
                  className={`relative group w-16 md:w-20 cursor-pointer transition-all ${
                    isSelected ? "ring-2 ring-yellow-400" : ""
                  }`}
                  onClick={(e) => {
                    e.stopPropagation();
                    onChartClick?.(chart, row.id);
                  }}
                  onDragStart={() => onChartDragStart?.(chart)}
                >
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
  );
}
