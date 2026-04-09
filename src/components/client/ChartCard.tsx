"use client";

import Image from "next/image";
import type { ChartRecord } from "@/types/smx";

interface ChartCardProps {
  chart: ChartRecord;
  isSelected?: boolean;
  isDragging?: boolean;
  onDragStart?: (e: React.DragEvent<HTMLDivElement>) => void;
  onClick?: () => void;
  compact?: boolean;
}

/**
 * Chart card component displaying song jacket, title, and difficulty info
 * Can display in compact mode (just jacket art) or full mode
 */
export function ChartCard({
  chart,
  isSelected = false,
  isDragging = false,
  onDragStart,
  onClick,
  compact = false,
}: ChartCardProps) {
  const difficultyLabel = chart.isPlus
    ? `${chart.chartType}+`
    : chart.chartType;

  // Compact mode: just jacket art
  if (compact) {
    return (
      <div className="relative aspect-square">
        <div
          draggable
          onDragStart={onDragStart}
          onClick={onClick}
          className={`
            relative rounded-lg overflow-hidden cursor-pointer
            transition-all duration-200 w-full h-full
            ${isDragging ? "opacity-50" : "opacity-100"}
            ${isSelected ? "ring-2 ring-blue-500 ring-offset-2" : "ring-1 ring-gray-300"}
            hover:ring-2 hover:ring-blue-400 hover:shadow-lg
            bg-gray-200 shadow-md
          `}
          title={chart.title}
        >
          <Image
            src={chart.jacketUrl}
            alt={chart.title}
            width={100}
            height={100}
            className="object-cover w-full h-auto"
          />
        </div>
      </div>
    );
  }

  // Full mode: with title and details
  return (
    <div
      draggable
      onDragStart={onDragStart}
      onClick={onClick}
      className={`
        flex flex-col gap-2 cursor-move rounded-lg overflow-hidden
        transition-all duration-200
        ${isDragging ? "opacity-50" : "opacity-100"}
        ${isSelected ? "ring-2 ring-blue-500" : "ring-1 ring-gray-300"}
        hover:ring-2 hover:ring-blue-400
        bg-white shadow-md hover:shadow-lg
      `}
    >
      {/* Title (2-line clamp, fixed height) */}
      <div className="px-3 pt-2 pb-1">
        <h3 className="text-sm font-semibold line-clamp-2 h-10 flex items-center">
          {chart.title}
        </h3>
      </div>

      {/* Square Image */}
      <div className="relative w-full aspect-square bg-gray-200">
        <Image
          src={chart.jacketUrl}
          alt={chart.title}
          fill
          className="object-cover"
          sizes="(max-width: 768px) 100px, 120px"
        />
      </div>

      {/* Bottom row: difficulty + level left, BPM right */}
      <div className="px-3 pb-2 flex items-center justify-between gap-2 text-xs font-medium">
        <div className="flex items-center gap-1 whitespace-nowrap">
          <span className="font-bold text-blue-600">{difficultyLabel}</span>
          <span className="text-gray-800">{chart.level}</span>
        </div>
        {chart.bpmDisplay && (
          <div className="text-gray-700 whitespace-nowrap font-medium">
            {chart.bpmDisplay} BPM
          </div>
        )}
      </div>
    </div>
  );
}
