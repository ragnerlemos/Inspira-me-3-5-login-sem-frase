import type { SavedProject } from "@/hooks/use-projects";
import type { EditorPage } from "./types";

export interface SavedBatchProject {
  id: string;
  name: string;
  thumbnail: string;
  pages: EditorPage[];
  currentPageIndex: number;
  selectedPageIndices: number[];
  createdBy: "manual" | "batch";
  version: string;
  editorVersion: string;
  batchVersion: string;
  createdAt: string;
  updatedAt: string;
}

const STORAGE_KEY = "quotevid_my_projects_batch";

export class ProjectStorageService {
  private static STORAGE_VERSION = "1.0.0";
  private static EDITOR_VERSION = "1.0.0";
  private static BATCH_VERSION = "1.0.0";

  /**
   * Saves a project to local storage (or eventually IndexedDB)
   */
  public static async saveProject(project: Omit<SavedBatchProject, "version" | "editorVersion" | "batchVersion" | "updatedAt"> & { id?: string }): Promise<SavedBatchProject> {
    const allProjects = await this.getAllProjects();
    const now = new Date().toISOString();
    
    const id = project.id || `proj_${Math.random().toString(36).substr(2, 9)}`;
    const fullProject: SavedBatchProject = {
      ...project,
      id,
      version: this.STORAGE_VERSION,
      editorVersion: this.EDITOR_VERSION,
      batchVersion: this.BATCH_VERSION,
      createdAt: project.createdAt || now,
      updatedAt: now,
    };

    const existingIndex = allProjects.findIndex((p) => p.id === id);
    if (existingIndex >= 0) {
      allProjects[existingIndex] = fullProject;
    } else {
      allProjects.unshift(fullProject);
    }

    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(allProjects));
    } catch (e) {
      console.error("ProjectStorageService: Error saving project", e);
      throw new Error("storage_quota_exceeded");
    }

    // Also update standard useProjects to keep synced
    this.syncWithStandardStorage(fullProject);

    return fullProject;
  }

  /**
   * Retrieves a specific project by id
   */
  public static async getProjectById(id: string): Promise<SavedBatchProject | null> {
    const allProjects = await this.getAllProjects();
    const found = allProjects.find((p) => p.id === id);
    return found || null;
  }

  /**
   * Retrieves all projects
   */
  public static async getAllProjects(): Promise<SavedBatchProject[]> {
    if (typeof window === "undefined") return [];
    try {
      const stored = localStorage.getItem(STORAGE_KEY);
      if (!stored) {
        // Fallback or import from standard localStorage to upgrade them
        return this.importAndUpgradeFromStandard();
      }
      const parsed = JSON.parse(stored) as SavedBatchProject[];
      return parsed.map((p) => this.upgradeProjectSchema(p));
    } catch (e) {
      console.error("ProjectStorageService: Error reading projects", e);
      return [];
    }
  }

  /**
   * Deletes a project
   */
  public static async deleteProject(id: string): Promise<void> {
    const allProjects = await this.getAllProjects();
    const filtered = allProjects.filter((p) => p.id !== id);
    localStorage.setItem(STORAGE_KEY, JSON.stringify(filtered));

    // Sync deletion with standard storage
    try {
      const standardKey = "quotevid_my_projects";
      const storedStandard = localStorage.getItem(standardKey);
      if (storedStandard) {
        const parsed = JSON.parse(storedStandard) as SavedProject[];
        const filteredStandard = parsed.filter((p) => p.id !== id);
        localStorage.setItem(standardKey, JSON.stringify(filteredStandard));
      }
    } catch (err) {
      console.error("ProjectStorageService: error deleting from standard storage", err);
    }
  }

  /**
   * Syncs a batch project into standard useProjects storage so it appears in standard project lists
   */
  private static syncWithStandardStorage(project: SavedBatchProject) {
    try {
      const standardKey = "quotevid_my_projects";
      const storedStandard = localStorage.getItem(standardKey);
      let list: SavedProject[] = [];
      if (storedStandard) {
        list = JSON.parse(storedStandard) as SavedProject[];
      }

      const activePage = project.pages[project.currentPageIndex] || project.pages[0];
      if (!activePage) return;

      const mappedState = {
        ...activePage,
        pages: project.pages,
        currentPageIndex: project.currentPageIndex,
        selectedPageIndices: project.selectedPageIndices,
        createdBy: project.createdBy,
      } as any;

      const standardItem: SavedProject = {
        id: project.id,
        name: project.name,
        thumbnail: project.thumbnail,
        editorState: mappedState,
        createdAt: project.createdAt,
        updatedAt: project.updatedAt,
      };

      const existingIndex = list.findIndex((p) => p.id === project.id);
      if (existingIndex >= 0) {
        list[existingIndex] = standardItem;
      } else {
        list.unshift(standardItem);
      }

      localStorage.setItem(standardKey, JSON.stringify(list));
    } catch (e) {
      console.error("ProjectStorageService: Error syncing with standard storage", e);
    }
  }

  /**
   * Upgrades schemas on load if structure versions change in the future
   */
  private static upgradeProjectSchema(project: any): SavedBatchProject {
    // Add missing fields or adapt schema dynamically
    if (!project.pages && project.editorState) {
      const state = project.editorState;
      project.pages = state.pages || [
        {
          ...state,
          pages: undefined,
          currentPageIndex: undefined,
          selectedPageIndices: undefined,
        },
      ];
      project.currentPageIndex = state.currentPageIndex ?? 0;
      project.selectedPageIndices = state.selectedPageIndices ?? [0];
      project.createdBy = state.createdBy ?? "manual";
      delete project.editorState;
    }

    if (!project.version) project.version = "1.0.0";
    if (!project.editorVersion) project.editorVersion = "1.0.0";
    if (!project.batchVersion) project.batchVersion = "1.0.0";

    return project as SavedBatchProject;
  }

  /**
   * Imports projects from useProjects storage and upgrades them to batch-compatible schemas
   */
  private static importAndUpgradeFromStandard(): SavedBatchProject[] {
    try {
      const standardKey = "quotevid_my_projects";
      const stored = localStorage.getItem(standardKey);
      if (!stored) return [];

      const standardList = JSON.parse(stored) as SavedProject[];
      const converted: SavedBatchProject[] = standardList.map((standard) => {
        const state = standard.editorState;
        const pages: EditorPage[] = (state as any).pages || [
          {
            ...state,
            pages: undefined,
            currentPageIndex: undefined,
            selectedPageIndices: undefined,
          },
        ];

        return {
          id: standard.id,
          name: standard.name,
          thumbnail: standard.thumbnail,
          pages,
          currentPageIndex: (state as any).currentPageIndex ?? 0,
          selectedPageIndices: (state as any).selectedPageIndices ?? [0],
          createdBy: (state as any).createdBy ?? "manual",
          version: "1.0.0",
          editorVersion: "1.0.0",
          batchVersion: "1.0.0",
          createdAt: standard.createdAt,
          updatedAt: standard.updatedAt,
        };
      });

      // Save initial imported list
      localStorage.setItem(STORAGE_KEY, JSON.stringify(converted));
      return converted;
    } catch (e) {
      console.error("ProjectStorageService: Error importing standard projects", e);
      return [];
    }
  }
}
