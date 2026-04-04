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

export type TierListType = "decimal" | "category" | "custom";

export interface TierListVariant extends TierListState {
  id: string; // Unique ID for this tier list variant
  type: TierListType; // decimal, category, or custom
  displayName: string; // Base name (e.g., "Difficulty", "Skillset", custom name)
  customLabel?: string; // Optional user annotation (e.g., "By username")
  editable: boolean; // Whether rows can be edited (true for all types now)
  chartRatings?: Record<string, number>; // Map of chartId to star rating (0-7), undefined means unrated
}

export interface FilterState {
  selectedDifficulties: string[]; // e.g., ["easy", "easy+", "hard"]
  levels: number[];
  searchQuery: string;
  tags: string[];
}
