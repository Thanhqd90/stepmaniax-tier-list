import fs from "fs";
import path from "path";

const inputPath = path.resolve("./src/data/smx.json");
const outputPath = path.resolve("./src/data/smx-charts.json");

type ModeGroup = "singles" | "dual" | "full" | "team";

function getModeGroup(diffClass: string): ModeGroup {
  if (diffClass === "dual") return "dual";
  if (diffClass === "full") return "full";
  if (diffClass === "team") return "team";
  return "singles";
}

function buildId(
  songId: string,
  diffClass: string,
  level: number,
  isPlus: boolean,
) {
  return `${songId}-${diffClass}-${level}-${isPlus ? "plus" : "base"}`;
}

function run() {
  const raw = JSON.parse(fs.readFileSync(inputPath, "utf-8"));

  const songs: any[] = [];

  for (const song of raw.songs) {
    const charts: any[] = [];

    for (const chart of song.charts) {
      if (!chart.diffClass) continue;

      const isPlus = chart.flags?.includes("plus") ?? false;

      charts.push({
        chartType: chart.diffClass.toLowerCase(),
        isPlus,
        level: chart.lvl,
      });
    }

    // Only add song if it has charts
    if (charts.length > 0) {
      songs.push({
        id: song.saIndex,
        title: song.name,
        artist: song.artist,
        jacketUrl: `/images/jackets/${song.jacket}`,
        modeGroup: getModeGroup(song.charts[0]?.diffClass ?? "singles"),
        bpmDisplay: song.bpm?.trim(),
        tags: [],
        charts,
      });
    }
  }

  fs.writeFileSync(outputPath, JSON.stringify(songs, null, 2));

  console.log(
    `✅ Generated ${songs.length} songs with ${songs.reduce((sum, s) => sum + s.charts.length, 0)} charts`,
  );
}

run();
