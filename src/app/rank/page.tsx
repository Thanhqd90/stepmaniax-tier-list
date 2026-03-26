import { Suspense } from "react";
import RankContent from "./rank-content";

export default function RankPage() {
  return (
    <Suspense
      fallback={
        <div className="max-w-4xl mx-auto p-6">
          <div className="bg-yellow-50 border border-yellow-200 rounded p-4">
            <h1 className="text-xl font-bold text-yellow-700 mb-2">
              Loading...
            </h1>
            <p className="text-yellow-600">
              Please wait while we load your charts.
            </p>
          </div>
        </div>
      }
    >
      <RankContent />
    </Suspense>
  );
}
