import { clsx, type ClassValue } from "clsx"
import { twMerge } from "tailwind-merge"

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}

export function generateFilename(
    quote: { category?: string; subCategory?: string },
    format: 'png' | 'jpeg' | 'jpg' | 'mp4' | 'webm'
): string {
    const safeCategory = quote.category?.trim().replace(/\s+/g, '_') || 'Geral';
    const safeSubCategory = quote.subCategory?.trim().replace(/\s+/g, '_');
    
    const now = new Date();
    const year = now.getFullYear();
    const month = (now.getMonth() + 1).toString().padStart(2, '0');
    const day = now.getDate().toString().padStart(2, '0');
    const hours = now.getHours().toString().padStart(2, '0');
    const minutes = now.getMinutes().toString().padStart(2, '0');
    const seconds = now.getSeconds().toString().padStart(2, '0');
    const timestamp = `${year}${month}${day}_${hours}${minutes}${seconds}`;

    const parts = ['InspiraMe', safeCategory];
    if (safeSubCategory && safeSubCategory !== 'Todos') {
        parts.push(safeSubCategory);
    }
    parts.push(timestamp);
    
    const normalizedFormat = format.toLowerCase();
    return `${parts.join('_')}.${normalizedFormat}`;
}
