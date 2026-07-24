import { BatchExporter } from "./BatchExporter";
import type { EditorPage, BatchStatus, BatchStatistics, BatchConfig } from "./types";
import type { ProfileData } from "@/hooks/use-profile";
import { ProjectStorageService, SavedBatchProject } from "./ProjectStorageService";

export interface BatchCheckpoint {
  id: string;
  name: string;
  pages: EditorPage[];
  lastProcessedIndex: number;
  format: "jpeg" | "png" | "zip" | "pdf";
  jpegQuality: number;
  category: string;
  subCategory: string;
}

const CHECKPOINT_KEY = "quotevid_batch_engine_checkpoint";

export class BatchEngine {
  private status: BatchStatus = "idle";
  private progress: number = 0;
  private currentProject: SavedBatchProject | null = null;
  private cancelFlag: boolean = false;
  private pauseFlag: boolean = false;
  private lastProcessedIndex: number = -1;

  private onStatusChangeCallbacks: ((status: BatchStatus) => void)[] = [];
  private onProgressCallbacks: ((progress: number, phase: string) => void)[] = [];

  constructor() {
    this.loadCheckpoint();
  }

  public getStatus(): BatchStatus {
    return this.status;
  }

  public getProgress(): number {
    return this.progress;
  }

  public getCurrentProject(): SavedBatchProject | null {
    return this.currentProject;
  }

  public registerOnStatusChange(cb: (status: BatchStatus) => void) {
    this.onStatusChangeCallbacks.push(cb);
  }

  public registerOnProgress(cb: (progress: number, phase: string) => void) {
    this.onProgressCallbacks.push(cb);
  }

  private setStatus(status: BatchStatus) {
    this.status = status;
    this.onStatusChangeCallbacks.forEach((cb) => cb(status));
  }

  private setProgress(progress: number, phase: string) {
    this.progress = progress;
    this.onProgressCallbacks.forEach((cb) => cb(progress, phase));
  }

  /**
   * Generates pages for a batch project based on template & list of quotes
   */
  public async createBatchProject(
    name: string,
    baseState: EditorPage,
    config: BatchConfig
  ): Promise<SavedBatchProject> {
    this.setStatus("preparing");
    this.setProgress(0, "Preparando projeto");

    this.setStatus("creatingPages");
    const pages: EditorPage[] = config.selectedQuotes.map((quote) => {
      return {
        ...baseState,
        text: quote,
      };
    });

    // Save project using ProjectStorageService
    const project = await ProjectStorageService.saveProject({
      name,
      pages,
      currentPageIndex: 0,
      selectedPageIndices: [0],
      createdBy: "batch",
      thumbnail: "", // Will render after export or first page
    });

    this.currentProject = project;
    this.setStatus("idle");
    this.setProgress(100, "Pronto");
    
    return project;
  }

  /**
   * Resumes the engine from a saved localStorage checkpoint.
   */
  public async resumeFromCheckpoint(
    profile: ProfileData,
    onProgress: (pageIndex: number, total: number, phase: string) => void
  ): Promise<{ blob?: Blob; files?: { name: string; blob: Blob }[]; stats: BatchStatistics; baseName?: string } | null> {
    const checkpoint = this.getSavedCheckpoint();
    if (!checkpoint) {
      this.setStatus("error");
      throw new Error("Nenhum checkpoint salvo encontrado");
    }

    this.setStatus("preparing");
    this.cancelFlag = false;
    this.pauseFlag = false;
    
    // Set state
    const pages = checkpoint.pages;
    const startIndex = checkpoint.lastProcessedIndex + 1;
    this.lastProcessedIndex = checkpoint.lastProcessedIndex;

    this.setStatus("rendering");

    const onProgressWrapper = (index: number, total: number, phase: "rendering" | "exporting" | "compressing") => {
      const realIndex = startIndex + index;
      const progressPct = Math.round((realIndex / total) * 100);
      this.setProgress(progressPct, phase);
      onProgress(realIndex, total, phase);

      // Save checkpoints on each success
      if (phase === "exporting" || phase === "rendering") {
        this.lastProcessedIndex = realIndex;
        this.saveCheckpoint({
          id: checkpoint.id,
          name: checkpoint.name,
          pages,
          lastProcessedIndex: realIndex,
          format: checkpoint.format,
          jpegQuality: checkpoint.jpegQuality,
          category: checkpoint.category,
          subCategory: checkpoint.subCategory,
        });
      }
    };

    try {
      const remainingPages = pages.slice(startIndex);
      const results = await BatchExporter.exportBatch(
        remainingPages,
        profile,
        checkpoint.format,
        checkpoint.jpegQuality,
        checkpoint.name,
        onProgressWrapper,
        () => this.cancelFlag || this.pauseFlag,
        checkpoint.category,
        checkpoint.subCategory
      );

      if (this.pauseFlag) {
        this.setStatus("paused");
        return null;
      }

      this.setStatus("completed");
      this.clearCheckpoint();
      return results;
    } catch (e: any) {
      if (this.cancelFlag) {
        this.setStatus("cancelled");
        this.clearCheckpoint();
        return null;
      }
      this.setStatus("error");
      throw e;
    }
  }

  /**
   * Launches the page rendering and compression/saving pipeline.
   */
  public async startExport(
    project: SavedBatchProject,
    profile: ProfileData,
    config: { format: "jpeg" | "png" | "zip" | "pdf"; jpegQuality: number; category: string; subCategory: string },
    onProgress: (pageIndex: number, total: number, phase: string) => void
  ): Promise<{ blob?: Blob; files?: { name: string; blob: Blob }[]; stats: BatchStatistics; baseName?: string } | null> {
    this.setStatus("preparing");
    this.currentProject = project;
    this.cancelFlag = false;
    this.pauseFlag = false;
    this.lastProcessedIndex = -1;

    // Save initial checkpoint
    this.saveCheckpoint({
      id: project.id,
      name: project.name,
      pages: project.pages,
      lastProcessedIndex: -1,
      format: config.format,
      jpegQuality: config.jpegQuality,
      category: config.category,
      subCategory: config.subCategory,
    });

    this.setStatus("rendering");

    const onProgressWrapper = (index: number, total: number, phase: "rendering" | "exporting" | "compressing") => {
      const progressPct = Math.round((index / total) * 100);
      this.setProgress(progressPct, phase);
      onProgress(index, total, phase);

      // Update checkpoint incrementally
      if (phase === "rendering" || phase === "exporting") {
        this.lastProcessedIndex = index;
        this.saveCheckpoint({
          id: project.id,
          name: project.name,
          pages: project.pages,
          lastProcessedIndex: index,
          format: config.format,
          jpegQuality: config.jpegQuality,
          category: config.category,
          subCategory: config.subCategory,
        });
      }
    };

    try {
      const results = await BatchExporter.exportBatch(
        project.pages,
        profile,
        config.format,
        config.jpegQuality,
        project.name,
        onProgressWrapper,
        () => this.cancelFlag || this.pauseFlag,
        config.category,
        config.subCategory
      );

      if (this.pauseFlag) {
        this.setStatus("paused");
        return null;
      }

      this.setStatus("completed");
      this.clearCheckpoint();

      // Update project thumbnail with first rendered page if possible
      if (results.files && results.files.length > 0) {
        const fileReader = new FileReader();
        fileReader.onloadend = () => {
          if (fileReader.result) {
            ProjectStorageService.saveProject({
              ...project,
              thumbnail: fileReader.result as string,
            });
          }
        };
        fileReader.readAsDataURL(results.files[0].blob);
      }

      return results;
    } catch (e: any) {
      if (this.cancelFlag) {
        this.setStatus("cancelled");
        this.clearCheckpoint();
        return null;
      }
      this.setStatus("error");
      throw e;
    }
  }

  public pause() {
    this.pauseFlag = true;
    this.setStatus("paused");
  }

  public cancel() {
    this.cancelFlag = true;
    this.setStatus("cancelled");
    this.clearCheckpoint();
  }

  // Checkpoint internals
  private saveCheckpoint(checkpoint: BatchCheckpoint) {
    if (typeof window === "undefined") return;
    localStorage.setItem(CHECKPOINT_KEY, JSON.stringify(checkpoint));
  }

  public getSavedCheckpoint(): BatchCheckpoint | null {
    if (typeof window === "undefined") return null;
    try {
      const stored = localStorage.getItem(CHECKPOINT_KEY);
      return stored ? JSON.parse(stored) : null;
    } catch {
      return null;
    }
  }

  public clearCheckpoint() {
    if (typeof window === "undefined") return;
    localStorage.removeItem(CHECKPOINT_KEY);
  }

  private loadCheckpoint() {
    const cp = this.getSavedCheckpoint();
    if (cp && cp.lastProcessedIndex < cp.pages.length - 1) {
      this.status = "paused";
      this.lastProcessedIndex = cp.lastProcessedIndex;
    }
  }
}
