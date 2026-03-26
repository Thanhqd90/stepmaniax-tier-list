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
  isActive?: boolean;
  onActivate?: () => void;
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
  isActive = false,
  onActivate,
}: TierRowProps) {
  const [isEditingName, setIsEditingName] = useState(false);
  const [editingName, setEditingName] = useState(row.name);

  // Get charts in this row, sorted by xValue
  const rowCharts = placements
    .filter((p) => p.rowId === row.id)
    .sort((a, b) => a.xValue - b.xValue)
    .map((p) => charts.find((c) => c.id === p.chartId))
    .filter(Boolean) as ChartRecord[];

  const handleSaveName = () => {
    if (editingName.trim()) {
      onUpdateRow(row.id, { name: editingName });
    } else {
      setEditingName(row.name);
    }
    setIsEditingName(false);
  };

  return (
    <div
      onClick={onActivate}
      className={`flex gap-2 md:gap-4 p-2 md:p-4 rounded-lg border-2 mb-2 md:mb-4 cursor-pointer transition-all
        ${isActive ? "ring-2 ring-blue-500 ring-offset-2 shadow-lg" : ""}
      `}
      style={{ borderColor: row.color, backgroundColor: `${row.color}15` }}
    >
      {/* Row Number Label - Centered */}
      <div className="flex items-center justify-center flex-shrink-0 min-w-12 md:min-w-16">
        {isEditingName ? (
          <div className="flex flex-col gap-1">
            <input
              autoFocus
              type="text"
              value={editingName}
              onChange={(e) => setEditingName(e.target.value)}
              onKeyDown={(e) => {
                if (e.key === "Enter") handleSaveName();
                if (e.key === "Escape") {
                  setEditingName(row.name);
                  setIsEditingName(false);
                }
              }}
              className="px-2 py-1 text-xs md:text-sm border border-gray-600 bg-gray-700 text-white rounded focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
            <button
              onClick={handleSaveName}
              className="px-2 py-1 bg-green-600 text-white text-xs rounded hover:bg-green-700"
            >
              Save
            </button>
          </div>
        ) : (
          <p
            className="text-sm md:text-lg font-bold text-center cursor-pointer hover:underline text-gray-100"
            onClick={() => setIsEditingName(true)}
            style={{ color: row.color }}
          >
            {row.name}
          </p>
        )}
      </div>

      {/* Charts Grid */}
      <div className="flex-1">
        {rowCharts.length === 0 ? (
          <div className="flex items-center justify-center h-16 md:h-24 bg-gray-800 rounded border-2 border-dashed border-gray-700">
            <p className="text-gray-400 text-xs md:text-sm font-medium">
              Drag charts here
            </p>
          </div>
        ) : (
          <div className="flex flex-wrap gap-1 md:gap-2">
            {rowCharts.map((chart) => (
              <div key={chart.id} className="relative group w-16 md:w-20">
                <ChartCard
                  chart={chart}
                  onDragStart={() => onChartDragStart?.(chart)}
                  compact={true}
                />
                <button
                  onClick={() => onRemoveChart(chart.id)}
                  className="
                    absolute top-0.5 md:top-1 right-0.5 md:right-1 bg-red-500 text-white
                    rounded-full w-5 md:w-6 h-5 md:h-6 flex items-center justify-center
                    opacity-0 group-hover:opacity-100 transition-opacity
                    text-xs font-bold hover:bg-red-600
                  "
                >
                  ×
                </button>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
