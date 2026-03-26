import type { ChartRecord, Song } from "@/types/smx";
import { songsToChartRecords } from "@/lib/utils";
import { TierBoard } from "@/components/client/TierBoard";

interface TierBoardServerProps {
  levelFilter?: number;
}

/**
 * Server component that loads chart data and renders the tier board
 */
export default async function TierBoardServer({
  levelFilter,
}: TierBoardServerProps) {
  let charts: ChartRecord[] = [];

  try {
    // Load the transformed chart data
    const chartsModule = await import("@/data/smx-charts.json");
    const data = chartsModule.default || chartsModule;
    const songs = (Array.isArray(data) ? data : []) as Song[];
    charts = songsToChartRecords(songs);

    if (!Array.isArray(charts)) {
      throw new Error("Invalid chart data format");
    }

    // Filter by level if provided
    if (levelFilter !== undefined) {
      charts = charts.filter((chart) => chart.level === levelFilter);
    }
  } catch (error) {
    console.error("Failed to load chart data:", error);
    return (
      <div className="max-w-4xl mx-auto p-6">
        <div className="bg-red-50 border border-red-200 rounded p-4">
          <h1 className="text-xl font-bold text-red-700 mb-2">
            Chart Data Not Found
          </h1>
          <p className="text-red-600 mb-4">
            The transformed chart data (smx-charts.json) was not found.
          </p>
          <div className="bg-white p-4 rounded text-sm font-mono text-gray-700">
            <p className="mb-2">To generate the chart data:</p>
            <ol className="list-decimal list-inside space-y-1">
              <li>
                Place your <code>smx.json</code> file in <code>src/data/</code>
              </li>
              <li>
                Place jacket images in <code>public/images/jackets/smx/</code>
              </li>
              <li>
                Run: <code>npx ts-node scripts/transform-smx.ts</code>
              </li>
            </ol>
          </div>
        </div>
      </div>
    );
  }

  return <TierBoard charts={charts} levelFilter={levelFilter} />;
}
