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

          {/* Moving Charts */}
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
                <p>✓ Auto-save tier lists to your browser</p>
                <p>✓ Export as high-quality PNG images</p>
                <p>✓ Recently visited tracking</p>
                <p>✓ Add favorites</p>
                <p>✓ Move charts with drag-and-drop or tap</p>
                <p>✓ Show/hide all charts in sidebar</p>
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
                <p>• Click the eye icon to hide the charts sidebar for more</p>
                <p>
                  • Use a custom name when exporting to label your tier list
                </p>
                <p>
                  • Charts stay organized even after you close and reopen the
                  page as long as you use the same browser and not in incognito
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
