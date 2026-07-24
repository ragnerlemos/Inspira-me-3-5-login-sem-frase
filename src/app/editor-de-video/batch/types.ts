import type { EditorState } from "../tipos";

export type EditorPage = Omit<
  EditorState,
  "pages" |
  "currentPageIndex" |
  "selectedPageIndices" |
  "createdBy"
>;

export type BatchStatus =
  | "idle"
  | "preparing"
  | "loadingQuotes"
  | "creatingPages"
  | "rendering"
  | "exporting"
  | "compressing"
  | "completed"
  | "paused"
  | "cancelled"
  | "error";

export interface BatchStatistics {
  version: string;
  engineVersion: string;
  editorVersion: string;
  totalPages: number;
  exportedCount: number;
  errorCount: number;
  averageTimePerPageMs: number;
  pagesPerSecond: number;
  maxMemoryUsedMb?: number;
  renderTimeMs: number;
  exportTimeMs: number;
  zipCompressionTimeMs: number;
  pdfGenerationTimeMs: number;
  jpegQualityUsed: number;
  finalResolution: string;
  totalSizeInBytes: number;
  exportFormat: "jpeg" | "png" | "zip" | "pdf";
  createdAt: string;
  projectName: string;
}

export interface BatchConfig {
  format: "jpeg" | "png" | "zip" | "pdf";
  jpegQuality: number; // e.g. 0.80, 0.85, 0.90, 0.95, 1.0
  category: string;
  subCategory: string;
  selectedQuotes: string[];
}
