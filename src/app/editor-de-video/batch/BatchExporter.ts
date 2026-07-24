import { BatchRenderer } from "./BatchRenderer";
import type { EditorPage, BatchStatistics } from "./types";
import type { ProfileData } from "@/hooks/use-profile";
import JSZip from "jszip";
import { jsPDF } from "jspdf";

export class BatchExporter {
  /**
   * Estimates the export size by rendering the first page and multiplying it.
   */
  public static async estimateExportSize(
    pages: EditorPage[],
    profile: ProfileData,
    format: "jpeg" | "png" | "zip" | "pdf",
    jpegQuality: number
  ): Promise<{ singlePageSize: number; totalEstimatedSize: number }> {
    if (pages.length === 0) {
      return { singlePageSize: 0, totalEstimatedSize: 0 };
    }

    try {
      // Render sample page (first page)
      const sampleBlob = await BatchRenderer.renderPageToBlob(pages[0], profile, {
        format: format === "png" ? "png" : "jpeg",
        quality: jpegQuality,
      });

      const singlePageSize = sampleBlob.size;
      let totalEstimatedSize = singlePageSize * pages.length;

      if (format === "zip") {
        totalEstimatedSize = Math.round(totalEstimatedSize * 0.95); // estimate 5% compression savings
      } else if (format === "pdf") {
        totalEstimatedSize = Math.round(totalEstimatedSize * 1.01); // estimate tiny PDF header overhead
      }

      return { singlePageSize, totalEstimatedSize };
    } catch (error) {
      console.warn("BatchExporter: Failed to estimate real size, using fallback.", error);
      // Fallback: 150 KB per page
      const fallbackSingle = 150 * 1024;
      return {
        singlePageSize: fallbackSingle,
        totalEstimatedSize: fallbackSingle * pages.length,
      };
    }
  }

  /**
   * Main pipeline to export batch pages. Reuses the BatchRenderer off-screen.
   */
  public static async exportBatch(
    pages: EditorPage[],
    profile: ProfileData,
    format: "jpeg" | "png" | "zip" | "pdf",
    jpegQuality: number,
    projectName: string,
    onProgress: (pageIndex: number, total: number, phase: "rendering" | "exporting" | "compressing") => void,
    isCancelled: () => boolean,
    category?: string,
    subCategory?: string
  ): Promise<{ blob?: Blob; files?: { name: string; blob: Blob }[]; stats: BatchStatistics }> {
    const startTime = performance.now();
    let renderTimeSum = 0;
    let exportTimeSum = 0;
    let zipCompressionTimeMs = 0;
    let pdfGenerationTimeMs = 0;
    let totalSizeInBytes = 0;

    let exportedCount = 0;
    let errorCount = 0;

    const blobs: Blob[] = [];
    const files: { name: string; blob: Blob }[] = [];
    let finalResolution = "";

    const sanitize = (part: string) => {
      if (!part) return "";
      return part.replace(/[\/\\:*?"<>|]/g, "_").trim();
    };

    const getFormattedDateTime = () => {
      const now = new Date();
      const year = now.getFullYear();
      const month = String(now.getMonth() + 1).padStart(2, '0');
      const day = String(now.getDate()).padStart(2, '0');
      const hours = String(now.getHours()).padStart(2, '0');
      const minutes = String(now.getMinutes()).padStart(2, '0');
      const seconds = String(now.getSeconds()).padStart(2, '0');
      return `${year}${month}${day}_${hours}${minutes}${seconds}`;
    };

    const cat = sanitize(category || "Geral");
    const sub = sanitize(subCategory || "");
    const dateTime = getFormattedDateTime();
    const baseName = sub ? `InspiraMe_${cat}_${sub}_${dateTime}` : `InspiraMe_${cat}_${dateTime}`;

    // Step 1: Render all pages
    for (let i = 0; i < pages.length; i++) {
      if (isCancelled()) {
        throw new Error("Export cancelled by user");
      }

      onProgress(i, pages.length, "rendering");

      const pageStart = performance.now();
      try {
        const renderFormat = format === "png" ? "png" : "jpeg";
        const pageCanvas = await BatchRenderer.renderPageToCanvas(pages[i], profile);
        
        if (!finalResolution) {
          finalResolution = `${pageCanvas.width}x${pageCanvas.height}`;
        }

        const renderEnd = performance.now();
        renderTimeSum += (renderEnd - pageStart);

        const exportStart = performance.now();
        const pageBlob = await new Promise<Blob>((resolve, reject) => {
          pageCanvas.toBlob(
            (b) => b ? resolve(b) : reject(new Error("Failed to convert canvas to blob")),
            `image/${renderFormat}`,
            format === "png" ? undefined : jpegQuality
          );
        });

        const exportEnd = performance.now();
        exportTimeSum += (exportEnd - exportStart);

        blobs.push(pageBlob);
        
        const extension = format === "png" ? "png" : "jpg";
        files.push({
          name: `${baseName}_Lote ${i + 1}.${extension}`,
          blob: pageBlob,
        });

        exportedCount++;
      } catch (err) {
        console.error(`BatchExporter: Error rendering page ${i + 1}`, err);
        errorCount++;
      }
    }

    // Measure memory (if browser API is available)
    const memoryUsedMb = (typeof window !== "undefined" && (window.performance as any).memory)
      ? Math.round((window.performance as any).memory.usedJSHeapSize / (1024 * 1024))
      : undefined;

    let finalBlob: Blob | undefined;

    // Step 2: Assemble output according to the format
    if (format === "zip") {
      const zipStart = performance.now();
      onProgress(pages.length, pages.length, "compressing");

      const zip = new JSZip();
      files.forEach((file) => {
        zip.file(file.name, file.blob);
      });

      finalBlob = await zip.generateAsync({ type: "blob" });
      zipCompressionTimeMs = performance.now() - zipStart;
      totalSizeInBytes = finalBlob.size;

    } else if (format === "pdf") {
      const pdfStart = performance.now();
      onProgress(pages.length, pages.length, "compressing");

      if (blobs.length > 0) {
        // Read aspect ratio of the first page to define PDF format orientation
        const isLandscape = pages[0]?.aspectRatio === "16 / 9";
        
        // Load first page dimensions
        const firstCanvas = await BatchRenderer.renderPageToCanvas(pages[0], profile);
        const pdf = new jsPDF({
          orientation: isLandscape ? "landscape" : "portrait",
          unit: "px",
          format: [firstCanvas.width, firstCanvas.height],
        });

        for (let i = 0; i < blobs.length; i++) {
          if (isCancelled()) {
            throw new Error("Export cancelled by user");
          }

          if (i > 0) {
            const pageCanvas = await BatchRenderer.renderPageToCanvas(pages[i], profile);
            pdf.addPage([pageCanvas.width, pageCanvas.height], isLandscape ? "landscape" : "portrait");
          }

          const blobUrl = URL.createObjectURL(blobs[i]);
          const base64Data = await new Promise<string>((resolve) => {
            const reader = new FileReader();
            reader.onloadend = () => resolve(reader.result as string);
            reader.readAsDataURL(blobs[i]);
          });

          const currentCanvas = await BatchRenderer.renderPageToCanvas(pages[i], profile);
          pdf.addImage(base64Data, format === "png" ? "PNG" : "JPEG", 0, 0, currentCanvas.width, currentCanvas.height);
          URL.revokeObjectURL(blobUrl);
        }

        finalBlob = pdf.output("blob");
        totalSizeInBytes = finalBlob.size;
      }
      pdfGenerationTimeMs = performance.now() - pdfStart;

    } else {
      // Individual files
      totalSizeInBytes = blobs.reduce((sum, b) => sum + b.size, 0);
    }

    const overallTime = performance.now() - startTime;
    const averageTimePerPageMs = pages.length > 0 ? overallTime / pages.length : 0;
    const pagesPerSecond = averageTimePerPageMs > 0 ? 1000 / averageTimePerPageMs : 0;

    const stats: BatchStatistics = {
      version: "1.0.0",
      engineVersion: "1.0.0",
      editorVersion: "1.0.0",
      totalPages: pages.length,
      exportedCount,
      errorCount,
      averageTimePerPageMs,
      pagesPerSecond,
      maxMemoryUsedMb: memoryUsedMb,
      renderTimeMs: renderTimeSum,
      exportTimeMs: exportTimeSum,
      zipCompressionTimeMs,
      pdfGenerationTimeMs,
      jpegQualityUsed: Math.round(jpegQuality * 100),
      finalResolution: finalResolution || "unknown",
      totalSizeInBytes,
      exportFormat: format,
      createdAt: new Date().toISOString(),
      projectName,
    };

    return {
      blob: finalBlob,
      files: (format === "jpeg" || format === "png") ? files : undefined,
      stats,
    };
  }
}
