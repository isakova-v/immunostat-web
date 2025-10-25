// src/lib/types.ts
export type UUID = string;

export type Role = "immunologist" | "bioinformatician" | "researcher" | "lecturer" | "guest";

export interface User {
  id: UUID;
  name: string;
  email?: string;
  role: Role;
}

export type FileFormat = "csv" | "xlsx";

export interface Project {
  id: UUID;
  name: string;
  description?: string;
  createdAt: string;
  updatedAt: string;
  ownerId: UUID;
  memberIds: UUID[];
  settings?: ProjectSettings;
}

export interface ProjectSettings {
  defaultGrouping?: string;
  savedViews: SavedView[];
}

export interface SavedView {
  id: UUID;
  name: string;
  description?: string;
  chart: VisualizationSpec;
  filters: Filter[];
}

export interface Dataset {
  id: UUID;
  projectId: UUID;
  name: string;
  sourceFileName: string;
  format: FileFormat;
  columns: ColumnMeta[];
  rowsPreview?: Record<string, unknown>[];
  createdAt: string;
}

export type ColumnType = "number" | "string" | "boolean" | "date" | "category";

export interface ColumnMeta {
  name: string;
  label?: string;
  type: ColumnType;
  unit?: string;
  isTarget?: boolean;
  isGroup?: boolean;
}

export interface VariableSelection {
  x?: string;
  y?: string;
  groupBy?: string;
  facetBy?: string;
}

export type ChartType = "histogram" | "violin" | "scatter" | "boxplot" | "heatmap" | "bar";

export interface VisualizationSpec {
  id: UUID;
  datasetId: UUID;
  type: ChartType;
  vars: VariableSelection;
  options?: VisualizationOptions;
}

export interface VisualizationOptions {
  bins?: number;
  agg?: "mean" | "median" | "count" | "sum";
  logScaleX?: boolean;
  logScaleY?: boolean;
  showLegend?: boolean;
  showConfidence?: boolean;
}

export interface Filter {
  column: string;
  op: "eq" | "neq" | "in" | "gt" | "gte" | "lt" | "lte" | "between";
  value: unknown | unknown[];
}

export type HLAFieldLevel = "1-field" | "2-field";

export interface HLAAllele {
  locus: "A" | "B" | "C" | "DRB1" | "DQB1" | "DPB1";
  allele: string;
  normalized: string;
  fieldLevel: HLAFieldLevel;
}

export interface HLAFrequency {
  locus: HLAAllele["locus"];
  alleleNormalized: string;
  fieldLevel: HLAFieldLevel;
  frequency: number;
  group?: string;
}

export interface HLATestResult {
  locus: HLAAllele["locus"];
  alleleNormalized: string;
  test: "fisher" | "chi-square";
  pValue: number;
  qValue?: number;
  oddsRatio?: number;
}