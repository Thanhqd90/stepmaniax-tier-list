"use client";

import { useState } from "react";
import { XMarkIcon } from "@heroicons/react/24/solid";

interface HelpModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export function HelpModal({ isOpen, onClose }: HelpModalProps) {
  const [expandedSection, setExpandedSection] = useState<string>("overview");

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4">
      <div className="bg-gray-800 rounded-lg shadow-xl max-w-2xl w-full max-h-[80vh] flex flex-col">
        {/* Header */}
        <div className="flex items-center justify-between p-6 border-b border-gray-700">
          <h2 className="text-2xl font-bold text-yellow-400">
            Tier List Maker Guide
          </h2>
          <button
            onClick={onClose}
            className="text-gray-400 hover:text-gray-200 transition-colors"
          >
            <XMarkIcon className="w-6 h-6" />
          </button>
        </div>

        {/* Content */}
        <div className="overflow-y-auto flex-1 p-6 space-y-4">
          {/* Overview Section */}
          <div className="bg-gray-700/50 rounded-lg p-4">
            <button
              onClick={() =>
                setExpandedSection(
                  expandedSection === "overview" ? "" : "overview",
                )
              }
              className="w-full flex items-center justify-between text-left hover:text-yellow-400 transition-colors"
            >
              <h3 className="text-lg font-bold text-yellow-400">Overview</h3>
              <span className="text-gray-400">
                {expandedSection === "overview" ? "−" : "+"}
              </span>
            </button>
            {expandedSection === "overview" && (
              <div className="text-gray-300 mt-3 text-sm space-y-2">
                <p>
                  <strong className="text-yellow-300">Note:</strong> This is a
                  fan-made site Built by JellySlosh.
                </p>
                <p>
                  Create ranked tier lists with StepManiaX charts. Organize
                  songs into more granular difficulty tiers, then export as an
                  image to share with the community.
                </p>
              </div>
            )}
          </div>

          {/* Getting Started */}
          <div className="bg-gray-700/50 rounded-lg p-4">
            <button
              onClick={() =>
                setExpandedSection(
                  expandedSection === "started" ? "" : "started",
                )
              }
              className="w-full flex items-center justify-between text-left hover:text-yellow-400 transition-colors"
            >
              <h3 className="text-lg font-bold text-yellow-400">
                Getting Started
              </h3>
              <span className="text-gray-400">
                {expandedSection === "started" ? "−" : "+"}
              </span>
            </button>
            {expandedSection === "started" && (
              <div className="text-gray-300 mt-3 text-sm space-y-2">
                <p>
                  <strong>1. Select a difficulty</strong>
                </p>
                <p>
                  <strong>2. Pick a level</strong>
                </p>
                <p>
                  <strong>3. Start ranking</strong>
                </p>
                <p>
                  <strong>4. Export</strong>
                </p>
              </div>
            )}
          </div>

          {/* Tier List Types */}
          <div className="bg-gray-700/50 rounded-lg p-4">
            <button
              onClick={() =>
                setExpandedSection(expandedSection === "types" ? "" : "types")
              }
              className="w-full flex items-center justify-between text-left hover:text-yellow-400 transition-colors"
            >
              <h3 className="text-lg font-bold text-yellow-400">
                Tier List Types
              </h3>
              <span className="text-gray-400">
                {expandedSection === "types" ? "−" : "+"}
              </span>
            </button>
            {expandedSection === "types" && (
              <div className="text-gray-300 mt-3 text-sm space-y-2">
                <p>
                  <strong className="text-yellow-300">Difficulty:</strong>{" "}
                  Default tier ranking system (Beginner to Challenge)
                </p>
                <p>
                  <strong className="text-yellow-300">Skillset:</strong> 8
                  categories for detailed analysis: Stamina, Footspeed, Low BPM,
                  Technical, Brackets, Rhythms, Twists, Gimmicks
                </p>
                <p>
                  <strong className="text-yellow-300">Custom:</strong> Create
                  your own tier list with custom rows (limited to 1 per level)
                </p>
                <p>Switch between types using the dropdown below the title.</p>
              </div>
            )}
          </div>

          {/* Managing Rows */}
          <div className="bg-gray-700/50 rounded-lg p-4">
            <button
              onClick={() =>
                setExpandedSection(expandedSection === "rows" ? "" : "rows")
              }
              className="w-full flex items-center justify-between text-left hover:text-yellow-400 transition-colors"
            >
              <h3 className="text-lg font-bold text-yellow-400">
                Managing Rows
              </h3>
              <span className="text-gray-400">
                {expandedSection === "rows" ? "−" : "+"}
              </span>
            </button>
            {expandedSection === "rows" && (
              <div className="text-gray-300 mt-3 text-sm space-y-2">
                <p>Each row has quick action buttons and a menu button (⚙️):</p>
                <p className="ml-2">
                  <strong>Quick Actions:</strong>
                </p>
                <p className="ml-2">
                  ⬆️ <strong>Move Up</strong> - Move row up one position
                </p>
                <p className="ml-2">
                  ⬇️ <strong>Move Down</strong> - Move row down one position
                </p>
                <p className="ml-2 text-gray-400 text-xs mt-1">
                  or drag the entire row to reorder
                </p>
                <p className="ml-2 mt-2">
                  <strong>Menu (⚙️) Options:</strong>
                </p>
                <p className="ml-2">
                  ✏️ <strong>Rename Row</strong> - Edit the row name
                </p>
                <p className="ml-2">
                  🎨 <strong>Choose Color</strong> - Pick a custom color
                </p>
                <p className="ml-2">
                  ✨ <strong>Random Color</strong> - Auto-generate a color
                </p>
                <p className="ml-2">
                  ➕ <strong>Add Row Above/Below</strong> - Insert new rows
                </p>
                <p className="ml-2">
                  🗑️ <strong>Delete Row</strong> - Remove a row
                </p>
                <p className="mt-2 text-yellow-200">
                  Maximum 12 rows per tier list
                </p>
              </div>
            )}
          </div>

          {/* Reordering Rows */}
          <div className="bg-gray-700/50 rounded-lg p-4">
            <button
              onClick={() =>
                setExpandedSection(
                  expandedSection === "reorder" ? "" : "reorder",
                )
              }
              className="w-full flex items-center justify-between text-left hover:text-yellow-400 transition-colors"
            >
              <h3 className="text-lg font-bold text-yellow-400">
                Drag & Drop Rows
              </h3>
              <span className="text-gray-400">
                {expandedSection === "reorder" ? "−" : "+"}
              </span>
            </button>
            {expandedSection === "reorder" && (
              <div className="text-gray-300 mt-3 text-sm space-y-2">
                <p>Drag any row to reorder your tier list:</p>
                <p className="ml-2">• Dragging becomes semi-transparent</p>
                <p className="ml-2">
                  • Target row highlights with a yellow ring
                </p>
                <p className="ml-2">
                  • Visual indicator shows: ↑ INSERT ABOVE or ↓ INSERT BELOW
                </p>
                <p className="ml-2">
                  • Drop to move the row to the new position
                </p>
              </div>
            )}
          </div>
          <div className="bg-gray-700/50 rounded-lg p-4">
            <button
              onClick={() =>
                setExpandedSection(expandedSection === "moving" ? "" : "moving")
              }
              className="w-full flex items-center justify-between text-left hover:text-yellow-400 transition-colors"
            >
              <h3 className="text-lg font-bold text-yellow-400">
                Moving Charts
              </h3>
              <span className="text-gray-400">
                {expandedSection === "moving" ? "−" : "+"}
              </span>
            </button>
            {expandedSection === "moving" && (
              <p className="text-gray-300 mt-3 text-sm">
                Click and drag a chart card to any tier row to move it. On
                mobile, tap a chart to select it (yellow ring appears), then tap
                a tier row to move it.
              </p>
            )}
          </div>

          {/* Features */}
          <div className="bg-gray-700/50 rounded-lg p-4">
            <button
              onClick={() =>
                setExpandedSection(
                  expandedSection === "features" ? "" : "features",
                )
              }
              className="w-full flex items-center justify-between text-left hover:text-yellow-400 transition-colors"
            >
              <h3 className="text-lg font-bold text-yellow-400">Features</h3>
              <span className="text-gray-400">
                {expandedSection === "features" ? "−" : "+"}
              </span>
            </button>
            {expandedSection === "features" && (
              <div className="text-gray-300 mt-3 text-sm space-y-1">
                <p>✓ Multiple tier list types (Difficulty, Skillset, Custom)</p>
                <p>✓ Drag-and-drop row reordering with visual indicators</p>
                <p>✓ Full row management (add, delete, rename, color)</p>
                <p>✓ 12-row limit per tier list</p>
                <p>✓ Move charts with drag-and-drop or tap</p>
                <p>✓ Auto-save tier lists to your browser</p>
                <p>✓ Export as high-quality PNG images</p>
                <p>✓ Export/import tier lists as files</p>
                <p>✓ Recently visited tracking</p>
                <p>✓ Add favorites</p>
                <p>✓ Show/hide all charts in sidebar</p>
                <p>✓ Custom tier list naming</p>
              </div>
            )}
          </div>

          {/* Import & Export */}
          <div className="bg-gray-700/50 rounded-lg p-4">
            <button
              onClick={() =>
                setExpandedSection(
                  expandedSection === "import_export" ? "" : "import_export",
                )
              }
              className="w-full flex items-center justify-between text-left hover:text-yellow-400 transition-colors"
            >
              <h3 className="text-lg font-bold text-yellow-400">
                Import & Export
              </h3>
              <span className="text-gray-400">
                {expandedSection === "import_export" ? "−" : "+"}
              </span>
            </button>
            {expandedSection === "import_export" && (
              <div className="text-gray-300 mt-3 text-sm space-y-2">
                <p>
                  <strong className="text-yellow-300">Export PNG Image:</strong>{" "}
                  Click the "Export Image" button to download a high-quality
                  image of your tier list. You need at least 5 charts placed to
                  export.
                </p>
                <p>
                  <strong className="text-yellow-300">Export Tier List:</strong>{" "}
                  Use the "More" menu (⋮) to export your tier list as a file.
                  This saves all tier rows, placements, and settings, making it
                  easy to share or backup your data.
                </p>
                <p>
                  <strong className="text-yellow-300">Import Tier List:</strong>{" "}
                  Use the "Import Tier List" option in the "More" menu to load a
                  previously exported tier list. Your current tier list will be
                  replaced.
                </p>
                <p className="text-yellow-200 border-l-2 border-yellow-400 pl-2">
                  💡 Use export/import to open your tier lists on different
                  devices!
                </p>
              </div>
            )}
          </div>

          {/* Tips */}
          <div className="bg-gray-700/50 rounded-lg p-4">
            <button
              onClick={() =>
                setExpandedSection(expandedSection === "tips" ? "" : "tips")
              }
              className="w-full flex items-center justify-between text-left hover:text-yellow-400 transition-colors"
            >
              <h3 className="text-lg font-bold text-yellow-400">Tips</h3>
              <span className="text-gray-400">
                {expandedSection === "tips" ? "−" : "+"}
              </span>
            </button>
            {expandedSection === "tips" && (
              <div className="text-gray-300 mt-3 text-sm space-y-2">
                <p>
                  • Use different tier list types for different analysis
                  (Difficulty, Skillset, Custom)
                </p>
                <p>
                  • Drag rows to quickly reorder them, or use the menu buttons
                  for more control
                </p>
                <p>
                  • Click the eye icon to hide the charts sidebar for more
                  screen space
                </p>
                <p>
                  • Use custom colors to visually organize rows by difficulty or
                  category
                </p>
                <p>
                  • Maximum 12 rows keeps tier lists organized and prevents UI
                  clutter
                </p>
                <p>
                  • Use a custom name when exporting to label your tier list
                </p>
                <p>
                  • Charts stay organized across browser sessions in the same
                  browser
                </p>
                <p>
                  • Export your tier list as a file to back it up or open on a
                  different device
                </p>
              </div>
            )}
          </div>
        </div>

        {/* Footer */}
        <div className="border-t border-gray-700 p-4 bg-gray-900">
          <button
            onClick={onClose}
            className="w-full bg-yellow-500 hover:bg-yellow-600 text-gray-900 font-bold py-2 rounded transition-colors"
          >
            Got it!
          </button>
        </div>
      </div>
    </div>
  );
}
