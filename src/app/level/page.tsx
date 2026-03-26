import Link from "next/link";

export const metadata = {
  title: "Level Select - StepManiaX Tier List Maker",
  description: "Select a difficulty level to create your tier list",
};

export default function LevelSelectPage() {
  return (
    <div className="min-h-screen bg-gray-50">
      <main className="max-w-6xl mx-auto p-6">
        {/* Header */}
        <div className="mb-12">
          <div className="flex items-center gap-4 mb-6">
            <Link
              href="/"
              className="px-4 py-2 bg-gray-500 text-white rounded hover:bg-gray-600 text-sm"
            >
              ← Back to All Levels
            </Link>
          </div>
          <h1 className="text-4xl font-bold mb-2">Select a Level</h1>
          <p className="text-lg text-gray-600">
            Choose a difficulty level (1-28) to create your tier list
          </p>
        </div>

        {/* Levels Grid */}
        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-7 gap-4">
          {Array.from({ length: 28 }, (_, i) => i + 1).map((level) => (
            <Link
              key={level}
              href={`/level/${level}`}
              className="
                flex items-center justify-center
                p-4 bg-white rounded-lg border-2 border-gray-300
                hover:border-blue-500 hover:bg-blue-50
                transition-all duration-200
                font-bold text-lg
                shadow-sm hover:shadow-md
              "
            >
              {level}
            </Link>
          ))}
        </div>

        {/* Info Section */}
        <div className="mt-12 grid md:grid-cols-2 gap-6">
          <div className="bg-blue-50 border border-blue-200 rounded-lg p-6">
            <h2 className="text-lg font-bold text-blue-900 mb-2">How to Use</h2>
            <ol className="text-sm text-blue-800 space-y-2 list-decimal list-inside">
              <li>Select a difficulty level above</li>
              <li>Charts for that level will be displayed</li>
              <li>Create tier rows and drag charts to rank them</li>
              <li>Your tier list is automatically saved</li>
            </ol>
          </div>

          <div className="bg-green-50 border border-green-200 rounded-lg p-6">
            <h2 className="text-lg font-bold text-green-900 mb-2">
              View All Levels
            </h2>
            <p className="text-sm text-green-800 mb-3">
              Click the "Back to All Levels" button to see tier lists that mix
              all difficulty levels.
            </p>
            <Link
              href="/"
              className="inline-block px-4 py-2 bg-green-500 text-white rounded hover:bg-green-600 text-sm font-medium"
            >
              View All Levels
            </Link>
          </div>
        </div>
      </main>
    </div>
  );
}
