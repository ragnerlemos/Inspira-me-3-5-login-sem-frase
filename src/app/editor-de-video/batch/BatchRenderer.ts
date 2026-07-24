import React from "react";
import { createRoot } from "react-dom/client";
import type { EditorPage } from "./types";
import type { ProfileData } from "@/hooks/use-profile";
import { PreviewCanva } from "../components/preview-canva";
import { createStrokeStyle, createDropShadowStyle } from "../utils/text-style-utils";
import type { EditorState } from "../tipos";
import { toCanvas } from "html-to-image";

export class BatchRenderer {
  /**
   * Calculates typography and effects styles for an EditorPage, identical to EditorProvider.
   */
  public static computeStyles(page: EditorPage) {
    const baseTextStyle: React.CSSProperties = {
      fontFamily: page.fontFamily,
      fontSize: `${page.fontSize}cqw`,
      fontWeight: page.fontWeight,
      fontStyle: page.fontStyle,
      color: page.textColor || "#FFFFFF",
      textAlign: page.textAlign,
      lineHeight: page.lineHeight,
      letterSpacing: `${(page.letterSpacing || 0) / 100}em`,
      wordSpacing: `${(page.wordSpacing || 0) / 100}em`,
    };

    const strokeStyle = createStrokeStyle(
      page.textStrokeWidth,
      page.textStrokeColor,
      page.textStrokeCornerStyle
    );

    const shadowStyle = createDropShadowStyle(
      page.textShadowBlur,
      page.textShadowOpacity
    );

    const textEffectsStyle = {
      ...strokeStyle,
    };

    return { baseTextStyle, textEffectsStyle, dropShadowStyle: shadowStyle };
  }

  /**
   * Renders a page off-screen using the exact same PreviewCanva component.
   * Returns a promise resolving to an HTMLCanvasElement.
   */
  public static async renderPageToCanvas(page: EditorPage, profile: ProfileData): Promise<HTMLCanvasElement> {
    if (typeof window === "undefined") {
      throw new Error("BatchRenderer: rendering is only supported in browser environments.");
    }

    // Prepare container for off-screen render
    const container = document.createElement("div");
    container.style.position = "fixed";
    container.style.left = "-9999px";
    container.style.top = "0";
    container.style.width = "400px";
    container.style.height = "711px"; // Fits 9:16 aspect ratio offscreen
    container.style.overflow = "hidden";
    container.style.zIndex = "-9999";
    document.body.appendChild(container);

    const root = createRoot(container);
    const { baseTextStyle, textEffectsStyle, dropShadowStyle } = this.computeStyles(page);
    
    const dummyRef = React.createRef<HTMLDivElement>();

    // Render PreviewCanva inside the temporary offscreen element
    root.render(
      React.createElement(PreviewCanva, {
        editorState: page as EditorState,
        profile,
        baseTextStyle,
        textEffectsStyle,
        dropShadowStyle,
        scale: 1,
        containerRef: dummyRef,
        updateState: () => {},
        onTextChange: () => {},
      })
    );

    // Wait for fonts & DOM painting
    await document.fonts.ready;
    await new Promise((resolve) => setTimeout(resolve, 150));

    try {
      const previewContentNode = container.querySelector("#editor-preview-content") as HTMLElement;
      if (!previewContentNode) {
        throw new Error("BatchRenderer: Failed to locate #editor-preview-content in off-screen render.");
      }

      const canvas = await toCanvas(previewContentNode, {
        pixelRatio: 2, // Retain high-definition 2x rendering
        backgroundColor: "#000000",
        style: {
          transform: "none",
          left: "0",
          top: "0",
        },
      });

      // Cleanup
      root.unmount();
      document.body.removeChild(container);

      return canvas;
    } catch (error) {
      // Cleanup on failure
      try {
        root.unmount();
      } catch {}
      try {
        document.body.removeChild(container);
      } catch {}
      throw error;
    }
  }

  /**
   * Renders a page off-screen and converts it directly to a Blob for low memory consumption.
   */
  public static async renderPageToBlob(
    page: EditorPage,
    profile: ProfileData,
    options?: { format?: "jpeg" | "png"; quality?: number }
  ): Promise<Blob> {
    const canvas = await this.renderPageToCanvas(page, profile);
    const format = options?.format || "jpeg";
    const quality = format === "jpeg" ? (options?.quality ?? 0.9) : undefined;

    return new Promise((resolve, reject) => {
      canvas.toBlob(
        (blob) => {
          if (blob) {
            resolve(blob);
          } else {
            reject(new Error("BatchRenderer: Failed to convert canvas to blob."));
          }
        },
        `image/${format}`,
        quality
      );
    });
  }
}
