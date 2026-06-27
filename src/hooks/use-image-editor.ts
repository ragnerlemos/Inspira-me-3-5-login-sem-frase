// src/hooks/use-image-editor.ts

// Define TypeScript types for image editing functions
export type ImageEditorOptions = {
    crop?: { x: number; y: number; width: number; height: number; };
    rotate?: number; // in degrees
    brightness?: number; // value between -1 and 1
    contrast?: number; // value between -1 and 1
};

// Image editing functions
export function cropImage(image: HTMLImageElement, options: ImageEditorOptions['crop']): HTMLCanvasElement {
    const canvas = document.createElement('canvas');
    const ctx = canvas.getContext('2d');
    if (!ctx) throw new Error('Unable to get canvas context');

    canvas.width = options.width;
    canvas.height = options.height;
    ctx.drawImage(image, options.x, options.y, options.width, options.height, 0, 0, options.width, options.height);
    return canvas;
}

export function rotateImage(image: HTMLImageElement, degrees: number): HTMLCanvasElement {
    const canvas = document.createElement('canvas');
    const ctx = canvas.getContext('2d');
    if (!ctx) throw new Error('Unable to get canvas context');

    const radians = degrees * (Math.PI / 180);
    canvas.width = image.width;
    canvas.height = image.height;
    ctx.translate(canvas.width / 2, canvas.height / 2);
    ctx.rotate(radians);
    ctx.drawImage(image, -image.width / 2, -image.height / 2);
    return canvas;
}

export function adjustBrightness(image: HTMLImageElement, brightness: number): HTMLCanvasElement {
    const canvas = document.createElement('canvas');
    const ctx = canvas.getContext('2d');
    if (!ctx) throw new Error('Unable to get canvas context');

    canvas.width = image.width;
    canvas.height = image.height;
    ctx.drawImage(image, 0, 0);

    ctx.globalCompositeOperation = 'source-over';
    ctx.fillStyle = `rgba(${brightness * 255}, ${brightness * 255}, ${brightness * 255}, ${Math.abs(brightness)})`;
    ctx.fillRect(0, 0, canvas.width, canvas.height);
    return canvas;
}

export function adjustContrast(image: HTMLImageElement, contrast: number): HTMLCanvasElement {
    const canvas = document.createElement('canvas');
    const ctx = canvas.getContext('2d');
    if (!ctx) throw new Error('Unable to get canvas context');

    canvas.width = image.width;
    canvas.height = image.height;
    ctx.drawImage(image, 0, 0);

    ctx.filter = `contrast(${(contrast + 1) * 100}%)`;
    ctx.drawImage(canvas, 0, 0);
    return canvas;
}