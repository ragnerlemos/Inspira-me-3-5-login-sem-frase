'use client';

// import { toCanvas } from 'html-to-image';
import type { EditorState, EstiloTexto } from './tipos';
import type { ProfileData } from '@/hooks/use-profile';
import type { ExportOptions } from './components/export-modal';
import { getApiUrl } from '@/lib/api-client';
import { Capacitor } from '@capacitor/core';
import { saveFileToAppFolder } from '@/lib/file-storage';

interface ToastProps {
    variant?: "default" | "destructive" | null | undefined,
    title: string;
    description: string;
}
type ToastFn = (props: ToastProps) => void;

export const captureAndDownload = async (format: 'jpeg' | 'png', toast: ToastFn, state: EditorState, profile: ProfileData, baseTextStyle: EstiloTexto, textEffectsStyle: EstiloTexto, dropShadowStyle: EstiloTexto) => {
    const previewElement = document.getElementById('editor-preview-content');

    if (!previewElement) {
        toast({ variant: 'destructive', title: 'Erro', description: 'Área de visualização não encontrada.' });
        return;
    }

    toast({ title: 'Exportando...', description: `Gerando imagem ${format.toUpperCase()} de alta definição.` });
    
    await document.fonts.ready;
    await new Promise(r => setTimeout(r, 200));

    try {
        const width = previewElement.clientWidth * 2;
        const height = previewElement.clientHeight * 2;

        const canvas = document.createElement('canvas');
        canvas.width = width;
        canvas.height = height;
        const ctx = canvas.getContext('2d', { alpha: false });

        if (!ctx) throw new Error("Falha ao criar canvas.");

        const backgroundVideo = previewElement.querySelector('video') as HTMLVideoElement | null;
        const backgroundImageElement = previewElement.querySelector('img[alt="Background"]') as HTMLImageElement | null;

        ctx.fillStyle = '#000';
        ctx.fillRect(0, 0, width, height);

        if (state.backgroundStyle?.type === 'gradient') {
            ctx.fillStyle = state.backgroundStyle.value || '#000';
            ctx.fillRect(0, 0, width, height);
        } else if (state.backgroundStyle?.type === 'solid') {
            ctx.fillStyle = state.backgroundStyle.value || '#000';
            ctx.fillRect(0, 0, width, height);
        }

        if (backgroundImageElement) {
            try {
                const b64 = await imgToBase64(backgroundImageElement.src);
                const bgImg = new Image();
                bgImg.src = b64;
                await new Promise((resolve, reject) => {
                    bgImg.onload = () => resolve(null);
                    bgImg.onerror = reject;
                });
                ctx.drawImage(bgImg, 0, 0, width, height);
            } catch (e) {
                console.warn("[Export] Falha ao carregar fundo de imagem:", e);
            }
        }

        if (backgroundVideo) {
            try {
                ctx.drawImage(backgroundVideo, 0, 0, width, height);
            } catch (e) {
                console.warn("[Export] Falha ao capturar frame do vídeo.");
            }
        }

        const { toCanvas } = await import('html-to-image');
        const overlayCanvas = await toCanvas(previewElement, {
            pixelRatio: 2,
            width,
            height,
            backgroundColor: 'transparent',
            style: {
                transform: 'none',
                left: '0',
                top: '0'
            },
            filter: (node: any) => {
                if (node.tagName === 'VIDEO') return false;
                if (node.tagName === 'IMG' && node.alt === 'Background') return false;
                return true;
            }
        });

        ctx.drawImage(overlayCanvas, 0, 0, width, height);
        
        const quality = format === 'jpeg' ? 1.0 : undefined;
        const dataUrl = canvas.toDataURL(`image/${format}`, quality);
        
        if (Capacitor.isNativePlatform()) {
            const base64Data = dataUrl.split('base64,')[1];
            if (base64Data) {
                const now = Date.now();
                const filename = `inspire-me-img-${now}.${format}`;
                let finalCategory: string | undefined = undefined;
                if (typeof window !== 'undefined') {
                    const searchParams = new URLSearchParams(window.location.search);
                    const cat = searchParams.get('category');
                    if (cat) finalCategory = cat;
                }
                try {
                    await saveFileToAppFolder(base64Data, filename, finalCategory);
                    toast({ title: 'Sucesso!', description: `Imagem salva na pasta Download/InspiraMe/${finalCategory || ''}` });
                } catch (err) {
                    console.error("Erro ao salvar imagem nativamente:", err);
                    toast({ variant: 'destructive', title: 'Erro de exportação', description: 'Não foi possível salvar a imagem.' });
                }
            }
            return;
        }

        const link = document.createElement('a');
        link.href = dataUrl;
        link.download = `inspire-me-img-${Date.now()}.${format}`;
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);

        toast({ title: 'Sucesso!', description: `Imagem exportada com sucesso.` });

    } catch (error: any) {
        console.error('Erro na exportação:', error);
        toast({ variant: 'destructive', title: 'Erro de Exportação', description: error.message });
    }
};

export const captureThumbnail = async (toast: ToastFn, state: EditorState, profile: ProfileData, baseTextStyle: EstiloTexto, textEffectsStyle: EstiloTexto, dropShadowStyle: EstiloTexto): Promise<string | null> => {
  const previewElement = document.getElementById('editor-preview-content');
  if (!previewElement) return null;
  
  await document.fonts.ready;
  try {
     const width = 400;
     const height = 400;
     const canvas = document.createElement('canvas');
     canvas.width = width;
     canvas.height = height;
     const ctx = canvas.getContext('2d');
     if (!ctx) return null;

     const video = previewElement.querySelector('video') as HTMLVideoElement | null;
     if (video) ctx.drawImage(video, 0, 0, width, height);

     const videoStyle = video?.style.getPropertyValue('display') || '';
     if (video) video.style.display = 'none';
     
     const { toCanvas } = await import('html-to-image');
     const overlayCanvas = await toCanvas(previewElement, {
        pixelRatio: 1,
        width: width,
        height: height,
        backgroundColor: 'transparent'
      });
     
     if (video) video.style.display = videoStyle;
     ctx.drawImage(overlayCanvas, 0, 0, width, height);
     return canvas.toDataURL('image/jpeg', 0.8);
  } catch (err) {
       return null;
  }
};

let ffmpeg: any = null;

const imgToBase64 = async (url: string): Promise<string> => {
    if (url.startsWith('data:')) return url;
    try {
        const fullUrl = url.startsWith('http') ? url : getApiUrl(url);
        const response = await fetch(fullUrl);
        const blob = await response.blob();
        return new Promise((resolve, reject) => {
            const reader = new FileReader();
            reader.onloadend = () => resolve(reader.result as string);
            reader.onerror = reject;
            reader.readAsDataURL(blob);
        });
    } catch (err) {
        return url;
    }
};

const loadFFmpeg = async (toast: ToastFn) => {
    if (ffmpeg) return ffmpeg;
    try {
        const { FFmpeg } = await import('@ffmpeg/ffmpeg');
        const { toBlobURL } = await import('@ffmpeg/util');
        ffmpeg = new FFmpeg();
        const baseURL = 'https://unpkg.com/@ffmpeg/core@0.12.6/dist/umd';
        await ffmpeg.load({
            coreURL: await toBlobURL(`${baseURL}/ffmpeg-core.js`, 'text/javascript'),
            wasmURL: await toBlobURL(`${baseURL}/ffmpeg-core.wasm`, 'application/wasm'),
        });
        return ffmpeg;
    } catch (err) {
        toast({ variant: 'destructive', title: 'Erro de Motor', description: 'Falha ao carregar motor de vídeo.' });
        ffmpeg = null;
        return null;
    }
};

const dataURLToUint8Array = (dataURL: string): Uint8Array => {
    const base64 = dataURL.split(',')[1];
    const binaryString = window.atob(base64);
    const len = binaryString.length;
    const bytes = new Uint8Array(len);
    for (let i = 0; i < len; i++) {
        bytes[i] = binaryString.charCodeAt(i);
    }
    return bytes;
};

export const generateVideoBlob = async (
  toast: ToastFn,
  state: EditorState,
  profile: ProfileData,
  baseTextStyle: EstiloTexto,
  textEffectsStyle: EstiloTexto,
  dropShadowStyle: EstiloTexto,
  durationSeconds = 3,
  options?: ExportOptions,
  onProgress?: (p: number) => void
): Promise<{ blob: Blob | null; error?: string }> => {
  const previewElement = document.getElementById('editor-preview-content');
  if (!previewElement) return { blob: null, error: 'Área de visualização não encontrada.' };

  const ff = await loadFFmpeg(toast);
  if (!ff) return { blob: null, error: 'Falha ao carregar motor de vídeo.' };

  await document.fonts.ready;
  
  const fps = options?.fps || 30;
  const scale = options?.renderScale || 1.5;
  const format = options?.format || 'mp4';

  const logicalWidth = previewElement.clientWidth;
  const logicalHeight = previewElement.clientHeight;
  const width = Math.round(logicalWidth * scale);
  const height = Math.round(logicalHeight * scale);

  const outputCanvas = document.createElement('canvas');
  outputCanvas.width = width;
  outputCanvas.height = height;
  const ctx = outputCanvas.getContext('2d', { alpha: false });
  if (!ctx) return { blob: null, error: 'Falha ao criar canvas.' };

  const backgroundVideo = previewElement.querySelector('video') as HTMLVideoElement | null;
  const backgroundImageElement = previewElement.querySelector('img[alt="Background"]') as HTMLImageElement | null;
  
  const durationValue = backgroundVideo?.duration || durationSeconds || 5;
  const finalDuration = (isNaN(durationValue) || durationValue <= 0 || durationValue === Infinity) ? 5 : durationValue;
  
  let bgImageInMem: HTMLImageElement | null = null;
  if (backgroundImageElement) {
    try {
        const b64 = await imgToBase64(backgroundImageElement.src);
        bgImageInMem = new Image();
        bgImageInMem.src = b64;
        await new Promise((r, reject) => {
            bgImageInMem!.onload = () => r(null);
            bgImageInMem!.onerror = reject;
        });
    } catch (e) {}
  }

  // Ocultar mídias para captura limpa do overlay
  const videoStyle = backgroundVideo?.style.getPropertyValue('display') || '';
  const imgStyle = backgroundImageElement?.style.getPropertyValue('display') || '';
  if (backgroundVideo) backgroundVideo.style.display = 'none';
  if (backgroundImageElement) backgroundImageElement.style.display = 'none';

  // Avatar/Imagens (CORS Neutralizado)
  const allImages = Array.from(previewElement.querySelectorAll('img'));
  const originalSources = new Map<HTMLImageElement, string>();
  for (const img of allImages) {
    if (img === backgroundImageElement) continue; 
    originalSources.set(img, img.src);
    try { img.src = await imgToBase64(img.src); } catch (e) {}
  }

  let overlayCanvas: HTMLCanvasElement;
  try {
    // IMPORTANTE: Aqui usamos pixelRatio e as dimensões lógicas para o alinhamento ficar perfeito
    const { toCanvas } = await import('html-to-image');
    overlayCanvas = await toCanvas(previewElement, {
        pixelRatio: scale,
        width: logicalWidth,
        height: logicalHeight,
        backgroundColor: 'transparent',
        style: { transform: 'none', left: '0', top: '0' },
        filter: (node: any) => {
            if (node.tagName === 'VIDEO') return false;
            if (node.tagName === 'IMG' && node.alt === 'Background') return false;
            if (node.classList && node.classList.contains('export-ignore')) return false;
            return true;
        }
    });
  } catch (err: any) {
    for (const [img, src] of originalSources) img.src = src;
    if (backgroundVideo) backgroundVideo.style.display = videoStyle;
    if (backgroundImageElement) backgroundImageElement.style.display = imgStyle;
    return { blob: null, error: `Erro visual: ${err?.message || 'Erro CORS'}` };
  }

  // Restaurar DOM
  for (const [img, src] of originalSources) img.src = src;
  if (backgroundVideo) {
    backgroundVideo.style.display = videoStyle;
    backgroundVideo.pause();
    backgroundVideo.muted = true;
  }
  if (backgroundImageElement) backgroundImageElement.style.display = imgStyle;

  const frameCount = Math.round(finalDuration * fps);
  const frameTime = 1 / fps;

  // Função auxiliar para desenhar mídia com "Object-Fit: Cover"
  const drawCover = (image: CanvasImageSource, sWidth: number, sHeight: number) => {
    const scale = Math.max(width / sWidth, height / sHeight);
    const x = (width - sWidth * scale) / 2;
    const y = (height - sHeight * scale) / 2;
    ctx.drawImage(image, x, y, sWidth * scale, sHeight * scale);
  };

  toast({ title: 'Renderizando...', description: `Processando ${frameCount} quadros.` });

  for (let i = 0; i < frameCount; i++) {
    try {
      ctx.fillStyle = '#000';
      ctx.fillRect(0, 0, width, height);

      // Fundo Cor/Gradiente
      if (state.backgroundStyle?.type === 'gradient' || state.backgroundStyle?.type === 'solid') {
          ctx.fillStyle = state.backgroundStyle.value || '#000';
          ctx.fillRect(0, 0, width, height);
      }

      // Fundo Imagem
      if (bgImageInMem) {
          drawCover(bgImageInMem, bgImageInMem.width, bgImageInMem.height);
      }

      // Fundo Vídeo
      if (backgroundVideo) {
        backgroundVideo.currentTime = i * frameTime;
        await new Promise(r => {
          let resolved = false;
          const done = () => { if (!resolved) { resolved = true; backgroundVideo.removeEventListener('seeked', done); r(null); } };
          if (backgroundVideo.readyState >= 2) setTimeout(done, 10);
          else { backgroundVideo.addEventListener('seeked', done); setTimeout(done, 150); }
        });
        drawCover(backgroundVideo, backgroundVideo.videoWidth, backgroundVideo.videoHeight);
      }

      // Desenhar Sobreposição (Overlay)
      ctx.drawImage(overlayCanvas, 0, 0, width, height);
      
      const frameData = dataURLToUint8Array(outputCanvas.toDataURL('image/png', 0.8));
      await ff.writeFile(`frame${i}.png`, frameData);

      if (i % 12 === 0) {
          const progress = Math.round((i / frameCount) * 100);
          if (onProgress) onProgress(progress);
          toast({ title: 'Exportando vídeo...', description: `Progresso: ${progress}% (${i}/${frameCount})` });
      }
    } catch (err) {}
  }

  if (onProgress) onProgress(100);
  
  toast({ title: 'Finalizando...', description: `Salvando arquivo ${format.toUpperCase()} final.` });
  try {
    const bitrate = options?.bitrateMbps ? `${options.bitrateMbps}M` : '5M';
    let vcodec = 'libx264';
    let ext = 'mp4';
    let ffArgs = [];

    if (format === 'webm') {
        ext = 'webm';
        vcodec = 'libvpx-vp9';
        ffArgs = [
          '-framerate', `${fps}`, 
          '-i', 'frame%d.png', 
          '-c:v', vcodec,
          '-b:v', bitrate,
          '-quality', 'realtime', // Good for webm speed
          'output.webm'
        ];
    } else if (format === 'gif') {
        ext = 'gif';
        ffArgs = [
          '-framerate', `${Math.min(fps, 15)}`, // GIFs don't need 60fps usually
          '-i', 'frame%d.png',
          '-vf', 'split[s0][s1];[s0]palettegen[p];[s1][p]paletteuse',
          'output.gif'
        ];
    } else {
        // default MP4
        ffArgs = [
          '-framerate', `${fps}`, 
          '-i', 'frame%d.png', 
          '-c:v', vcodec, 
          '-pix_fmt', 'yuv420p', 
          '-preset', 'ultrafast',
          '-b:v', bitrate,
          '-crf', '30',
          'output.mp4'
        ];
    }

    await ff.exec(ffArgs);
    const data = await ff.readFile(`output.${ext}`);
    // Limpeza em lote (opcional: ff.deleteFile em loop pode ser lento mas evita crash)
    for (let i = 0; i < frameCount; i++) { try { await ff.deleteFile(`frame${i}.png`); } catch(e) {} }
    
    const mimeType = format === 'gif' ? 'image/gif' : `video/${format}`;
    return { blob: new Blob([(data as any).buffer], { type: mimeType }) };
  } catch (err: any) {
    return { blob: null, error: `Erro na finalização: ${err.message}` };
  }
};

