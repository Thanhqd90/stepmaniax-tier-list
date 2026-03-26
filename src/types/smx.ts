/**
 * StepManiaX Chart and Tier List Types
 */

export type DifficultyName =
  | "beginner"
  | "easy"
  | "hard"
  | "wild"
  | "dual"
  | "full"
  | "team";

export type ModeGroup = "singles" | "dual" | "full" | "team";

export interface Chart {
  chartType: DifficultyName;
  isPlus: boolean;
  level: number;
}

export interface Song {
  id: string; // songId
  title: string;
  artist: string;
  jacketUrl: string; // e.g., /images/jackets/smx/filename.jpg
  modeGroup: ModeGroup;
  bpmDisplay?: string;
  tags: string[];
  charts: Chart[];
}

export interface ChartRecord {
  id: string; // {songId}-{chartType}-{level}-{plus|base}
  songId: string;
  title: string;
  artist: string;
  jacketUrl: string;
  chartType: DifficultyName;
  isPlus: boolean;
  level: number;
  modeGroup: ModeGroup;
  bpmDisplay?: string;
  tags: string[];
}

export interface Placement {
  chartId: string;
  rowId: string;
  xValue: number;
}

export interface TierRow {
  id: string;
  name: string;
  color: string; // Hex color for row background
}

export interface TierListState {
  rows: TierRow[];
  placements: Placement[];
  name?: string; // Optional name for the tier list
}

export interface FilterState {
  selectedDifficulties: string[]; // e.g., ["easy", "easy+", "hard"]
  levels: number[];
  searchQuery: string;
  tags: string[];
}
