'use client';

import { toCanvas } from 'html-to-image';
import { FFmpeg } from '@ffmpeg/ffmpeg';
import { toBlobURL } from '@ffmpeg/util';
import { exportWithWebCodecs } from './exportar-webcodecs';
import { mixAudioTracksToBuffer } from './utils/audio-mixer';
import type { EditorState, EstiloTexto } from './tipos';
import type { ProfileData } from '@/hooks/use-profile';
import type { ExportOptions } from './components/export-modal';
import { getApiUrl } from '@/lib/api-client';
import { Capacitor } from '@capacitor/core';
import { saveFileToAppFolder } from '@/lib/file-storage';
import { generateFilename } from '@/lib/utils';

interface ToastProps {
    variant?: "default" | "destructive" | null | undefined,
    title: string;
    description: string;
}
type ToastFn = (props: ToastProps) => void;

// Helper function to apply filters to a canvas context
const applyFiltersToCtx = (ctx: CanvasRenderingContext2D, bg: any) => {
    if (!bg) return;
    const filterParts = [
        bg.blur ? `blur(${bg.blur}px)` : '',
        bg.brightness !== undefined ? `brightness(${bg.brightness}%)` : '',
        bg.contrast !== undefined ? `contrast(${bg.contrast}%)` : '',
        bg.grayscale ? `grayscale(${bg.grayscale}%)` : '',
        bg.sepia ? `sepia(${bg.sepia}%)` : '',
        bg.hueRotate ? `hue-rotate(${bg.hueRotate}deg)` : '',
    ].filter(Boolean).join(' ');
    ctx.filter = filterParts || 'none';
};

const getEditorExportMetadata = () => {
    if (typeof window === 'undefined') {
        return { category: undefined, subCategory: undefined };
    }
    const params = new URLSearchParams(window.location.search);
    return {
        category: params.get('category') || undefined,
        subCategory: params.get('subCategory') || undefined,
    };
};

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
        const width = previewElement.offsetWidth;
        const height = previewElement.offsetHeight;
        const outputWidth = width * 2;
        const outputHeight = height * 2;

        const canvas = document.createElement('canvas');
        canvas.width = outputWidth;
        canvas.height = outputHeight;
        const ctx = canvas.getContext('2d', { alpha: false });

        if (!ctx) throw new Error("Falha ao criar canvas.");

        const backgroundVideo = previewElement.querySelector('video') as HTMLVideoElement | null;
        const backgroundImageElement = previewElement.querySelector('img[alt="Background"]') as HTMLImageElement | null;

        ctx.fillStyle = '#000';
        ctx.fillRect(0, 0, outputWidth, outputHeight);

        // Apply filters for background
        applyFiltersToCtx(ctx, state.backgroundStyle);

        if (state.backgroundStyle?.type === 'gradient') {
            ctx.fillStyle = state.backgroundStyle.value || '#000';
            ctx.fillRect(0, 0, outputWidth, outputHeight);
        } else if (state.backgroundStyle?.type === 'solid') {
            ctx.fillStyle = state.backgroundStyle.value || '#000';
            ctx.fillRect(0, 0, outputWidth, outputHeight);
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
                ctx.drawImage(bgImg, 0, 0, outputWidth, outputHeight);
            } catch (e) {
                console.warn("[Export] Falha ao carregar fundo de imagem:", e);
            }
        }

        if (backgroundVideo) {
            try {
                ctx.drawImage(backgroundVideo, 0, 0, outputWidth, outputHeight);
            } catch (e) {
                console.warn("[Export] Falha ao capturar frame do vídeo.");
            }
        }
        
        // Reset filters for overlay
        ctx.filter = 'none';

        const clone = previewElement.cloneNode(true) as HTMLElement;
        clone.style.width = `${width}px`;
        clone.style.height = `${height}px`;
        clone.style.transform = 'none';
        clone.style.position = 'relative';
        clone.style.left = '0';
        clone.style.top = '0';

        const offscreenRoot = document.createElement('div');
        offscreenRoot.style.position = 'fixed';
        offscreenRoot.style.left = '-9999px';
        offscreenRoot.style.top = '0';
        offscreenRoot.style.width = `${width}px`;
        offscreenRoot.style.height = `${height}px`;
        offscreenRoot.style.overflow = 'hidden';
        offscreenRoot.style.zIndex = '-1';
        offscreenRoot.appendChild(clone);
        document.body.appendChild(offscreenRoot);

        const overlayCanvas = await toCanvas(clone, {
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

        document.body.removeChild(offscreenRoot);

        ctx.drawImage(overlayCanvas, 0, 0, outputWidth, outputHeight);
        
        const quality = format === 'jpeg' ? 1.0 : undefined;
        const dataUrl = canvas.toDataURL(`image/${format}`, quality);
        
        const quoteMetadata = getEditorExportMetadata();
        const filename = generateFilename(quoteMetadata, format === 'jpeg' ? 'jpg' : format);

        if (Capacitor.isNativePlatform()) {
            const base64Data = dataUrl.split('base64,')[1];
            if (base64Data) {
                try {
                    await saveFileToAppFolder(base64Data, filename, quoteMetadata.category, quoteMetadata.subCategory);
                    toast({ title: 'Sucesso!', description: `Arquivo salvo com sucesso em Downloads/InspireMe/${quoteMetadata.category || 'Geral'}/${quoteMetadata.subCategory || 'Geral'}.` });
                } catch (err) {
                    console.error("Erro ao salvar imagem nativamente:", err);
                    toast({ variant: 'destructive', title: 'Erro de exportação', description: 'Não foi possível salvar a imagem.' });
                }
            }
            return;
        }

        const link = document.createElement('a');
        link.href = dataUrl;
        link.download = filename;
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);

        toast({ title: 'Sucesso!', description: `Imagem exportada com sucesso.` });

    } catch (error: any) {
        console.error('Erro na exportação:', error);
        toast({ variant: 'destructive', title: 'Erro de Exportação', description: error.message });
    }
};

export const captureThumbnail = async (
    toast: ToastFn,
    state: EditorState,
    profile: ProfileData,
    baseTextStyle: EstiloTexto,
    textEffectsStyle: EstiloTexto,
    dropShadowStyle: EstiloTexto,
    width = 400,
    height = 400,
): Promise<string | null> => {
    const previewElement = document.getElementById('editor-preview-content');
    if (!previewElement) return null;
  
    await document.fonts.ready;
    try {
         const canvas = document.createElement('canvas');
         canvas.width = width;
         canvas.height = height;
         const ctx = canvas.getContext('2d');
         if (!ctx) return null;

         const video = previewElement.querySelector('video') as HTMLVideoElement | null;
         if (video) {
             try { ctx.drawImage(video, 0, 0, width, height); } catch {}
         }

         const videoStyle = video?.style.getPropertyValue('display') || '';
         if (video) video.style.display = 'none';
     
         const overlayCanvas = await toCanvas(previewElement, {
                pixelRatio: 1,
                width,
                height,
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

const getCustomWorkerBlobURL = (): string => {
    const workerCode = `
        let ffmpeg;
        const FFMessageType = {
            LOAD: "LOAD", EXEC: "EXEC", FFPROBE: "FFPROBE", WRITE_FILE: "WRITE_FILE",
            READ_FILE: "READ_FILE", DELETE_FILE: "DELETE_FILE", RENAME: "RENAME",
            CREATE_DIR: "CREATE_DIR", LIST_DIR: "LIST_DIR", DELETE_DIR: "DELETE_DIR",
            ERROR: "ERROR", DOWNLOAD: "DOWNLOAD", PROGRESS: "PROGRESS", LOG: "LOG",
            MOUNT: "MOUNT", UNMOUNT: "UNMOUNT"
        };

        const load = async ({ coreURL, wasmURL, workerURL }) => {
            const first = !ffmpeg;
            try {
                if (!self.createFFmpegCore) {
                    const dynamicImport = new Function('url', 'return import(url)');
                    const mod = await dynamicImport(coreURL);
                    self.createFFmpegCore = mod.default || mod;
                }
            } catch (e) {
                console.error('Worker core import error:', e);
                throw e;
            }

            const _wasmURL = wasmURL ? wasmURL : coreURL.replace(/\\.js$/g, ".wasm");
            const _workerURL = workerURL ? workerURL : coreURL.replace(/\\.js$/g, ".worker.js");

            ffmpeg = await self.createFFmpegCore({
                mainScriptUrlOrBlob: \`\${coreURL}#\${btoa(JSON.stringify({ wasmURL: _wasmURL, workerURL: _workerURL }))}\`,
            });

            ffmpeg.setLogger((data) => self.postMessage({ type: FFMessageType.LOG, data }));
            ffmpeg.setProgress((data) => self.postMessage({ type: FFMessageType.PROGRESS, data }));
            return first;
        };

        const exec = ({ args, timeout = -1 }) => {
            ffmpeg.setTimeout(timeout);
            ffmpeg.exec(...args);
            const ret = ffmpeg.ret;
            ffmpeg.reset();
            return ret;
        };

        const writeFile = ({ path, data }) => {
            ffmpeg.FS.writeFile(path, data);
            return true;
        };

        const readFile = ({ path, encoding }) => ffmpeg.FS.readFile(path, { encoding });
        const deleteFile = ({ path }) => { ffmpeg.FS.unlink(path); return true; };
        const rename = ({ oldPath, newPath }) => { ffmpeg.FS.rename(oldPath, newPath); return true; };
        const createDir = ({ path }) => { ffmpeg.FS.mkdir(path); return true; };
        const listDir = ({ path }) => {
            const names = ffmpeg.FS.readdir(path);
            const nodes = [];
            for (const name of names) {
                const stat = ffmpeg.FS.stat(\`\${path}/\${name}\`);
                const isDir = ffmpeg.FS.isDir(stat.mode);
                nodes.push({ name, isDir });
            }
            return nodes;
        };
        const deleteDir = ({ path }) => { ffmpeg.FS.rmdir(path); return true; };

        self.onmessage = async ({ data: { id, type, data: _data } }) => {
            const trans = [];
            let data;
            try {
                if (type !== FFMessageType.LOAD && !ffmpeg) throw new Error("FFmpeg não inicializado");
                switch (type) {
                    case FFMessageType.LOAD: data = await load(_data); break;
                    case FFMessageType.EXEC: data = exec(_data); break;
                    case FFMessageType.WRITE_FILE: data = writeFile(_data); break;
                    case FFMessageType.READ_FILE: data = readFile(_data); break;
                    case FFMessageType.DELETE_FILE: data = deleteFile(_data); break;
                    case FFMessageType.RENAME: data = rename(_data); break;
                    case FFMessageType.CREATE_DIR: data = createDir(_data); break;
                    case FFMessageType.LIST_DIR: data = listDir(_data); break;
                    case FFMessageType.DELETE_DIR: data = deleteDir(_data); break;
                    default: throw new Error("Tipo de mensagem desconhecido: " + type);
                }
            } catch (e) {
                self.postMessage({ id, type: FFMessageType.ERROR, data: e.toString() });
                return;
            }
            if (data instanceof Uint8Array) {
                trans.push(data.buffer);
            }
            self.postMessage({ id, type, data }, trans);
        };
    `;
    const blob = new Blob([workerCode], { type: 'text/javascript' });
    return URL.createObjectURL(blob);
};

const loadFFmpeg = async (toast: ToastFn) => {
    if (ffmpeg) return ffmpeg;
    
    const cdns = [
        'https://cdn.jsdelivr.net/npm/@ffmpeg/core@0.12.6/dist/esm',
        'https://unpkg.com/@ffmpeg/core@0.12.6/dist/esm'
    ];

    try {
        const instance = new FFmpeg();

        let loaded = false;
        let lastError: any = null;
        const classWorkerURL = getCustomWorkerBlobURL();

        for (const baseURL of cdns) {
            try {
                const coreURL = await toBlobURL(`${baseURL}/ffmpeg-core.js`, 'text/javascript');
                const wasmURL = await toBlobURL(`${baseURL}/ffmpeg-core.wasm`, 'application/wasm');

                await instance.load({ classWorkerURL, coreURL, wasmURL });
                loaded = true;
                break;
            } catch (err) {
                console.warn(`Falha ao carregar FFmpeg via ${baseURL}, tentando próximo CDN...`, err);
                lastError = err;
            }
        }

        if (!loaded) {
            throw lastError || new Error('Não foi possível carregar o FFmpeg de nenhuma CDN.');
        }

        ffmpeg = instance;
        return ffmpeg;
    } catch (err: any) {
        console.error('Erro ao inicializar FFmpeg:', err);
        toast({ variant: 'destructive', title: 'Erro de Motor', description: `Falha ao carregar motor FFmpeg: ${err?.message || 'Erro de conexão'}` });
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

  const fps = (options?.exportMode === 'gpu_native' || options?.exportMode === 'ffmpeg_fast')
    ? Math.min(options?.fps || 30, 30)
    : (options?.fps || 30);
  const scale = options?.renderScale || 1.5;
  const format = options?.format || 'mp4';

  const logicalWidth = previewElement.clientWidth;
  const logicalHeight = previewElement.clientHeight;

  // Garantir dimensões pares obrigatórias (H.264 / GPU exige largura e altura pares)
  const width = Math.floor((logicalWidth * scale) / 2) * 2;
  const height = Math.floor((logicalHeight * scale) / 2) * 2;

  if (width <= 0 || height <= 0) {
    return { blob: null, error: 'Dimensões do vídeo inválidas.' };
  }

  const outputCanvas = document.createElement('canvas');
  outputCanvas.width = width;
  outputCanvas.height = height;
  const ctx = outputCanvas.getContext('2d', { alpha: false });
  if (!ctx) return { blob: null, error: 'Falha ao criar canvas de saída.' };

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

  // Ocultar mídias temporariamente para captura limpa das camadas de texto/overlay
  const videoStyle = backgroundVideo?.style.getPropertyValue('display') || '';
  const imgStyle = backgroundImageElement?.style.getPropertyValue('display') || '';
  if (backgroundVideo) backgroundVideo.style.display = 'none';
  if (backgroundImageElement) backgroundImageElement.style.display = 'none';

  // Neutralizar CORS em imagens/avatares
  const allImages = Array.from(previewElement.querySelectorAll('img'));
  const originalSources = new Map<HTMLImageElement, string>();
  for (const img of allImages) {
    if (img === backgroundImageElement) continue; 
    originalSources.set(img, img.src);
    try { img.src = await imgToBase64(img.src); } catch (e) {}
  }

  let overlayCanvas: HTMLCanvasElement;
  try {
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
    return { blob: null, error: `Erro visual na sobreposição: ${err?.message || 'Erro CORS'}` };
  }

  // Restaurar estado visual do DOM
  for (const [img, src] of originalSources) img.src = src;
  if (backgroundVideo) {
    backgroundVideo.style.display = videoStyle;
    backgroundVideo.pause();
    backgroundVideo.muted = true;
  }
  if (backgroundImageElement) backgroundImageElement.style.display = imgStyle;

  // Função Auxiliar de Enquadramento
  const drawCoverOn = (targetCtx: CanvasRenderingContext2D, image: CanvasImageSource, sWidth: number, sHeight: number, tWidth: number, tHeight: number) => {
    const s = Math.max(tWidth / sWidth, tHeight / sHeight);
    const x = (tWidth - sWidth * s) / 2;
    const y = (tHeight - sHeight * s) / 2;
    targetCtx.drawImage(image, x, y, sWidth * s, sHeight * s);
  };

  // Funcao Unificada de Renderizacao de Quadro (Fusao de video + filtros + overlays de texto)
  const renderFrameToCanvas = async (drawCtx: CanvasRenderingContext2D, time: number, tWidth: number, tHeight: number) => {
    drawCtx.fillStyle = '#000';
    drawCtx.fillRect(0, 0, tWidth, tHeight);

    applyFiltersToCtx(drawCtx, state.backgroundStyle);

    if (state.backgroundStyle?.type === 'gradient' || state.backgroundStyle?.type === 'solid') {
      drawCtx.fillStyle = state.backgroundStyle.value || '#000';
      drawCtx.fillRect(0, 0, tWidth, tHeight);
    }

    if (bgImageInMem) {
      drawCoverOn(drawCtx, bgImageInMem, bgImageInMem.width, bgImageInMem.height, tWidth, tHeight);
    }

    if (backgroundVideo) {
      if (!backgroundVideo.crossOrigin) {
        try { backgroundVideo.crossOrigin = 'anonymous'; } catch (e) {}
      }

      // Sincronização estrita de frame do vídeo via evento seeked
      await new Promise<void>((resolve) => {
        if (Math.abs(backgroundVideo.currentTime - time) < 0.015 && !backgroundVideo.seeking) {
          resolve();
          return;
        }

        let isDone = false;
        const handleSeeked = () => {
          if (!isDone) {
            isDone = true;
            backgroundVideo.removeEventListener('seeked', handleSeeked);
            resolve();
          }
        };

        backgroundVideo.addEventListener('seeked', handleSeeked, { once: true });
        backgroundVideo.currentTime = time;

        // Fallback de tempo para navegadores sem evento seeked garantido
        setTimeout(() => {
          if (!isDone) {
            isDone = true;
            backgroundVideo.removeEventListener('seeked', handleSeeked);
            resolve();
          }
        }, 250);
      });

      if (backgroundVideo.videoWidth > 0 && backgroundVideo.videoHeight > 0) {
        drawCoverOn(drawCtx, backgroundVideo, backgroundVideo.videoWidth, backgroundVideo.videoHeight, tWidth, tHeight);
      }
    }

    drawCtx.filter = 'none';
    drawCtx.drawImage(overlayCanvas, 0, 0, tWidth, tHeight);
  };

  // 1. MODO ULTRA WORKER OU GPU (WebCodecs Off-thread / Offscreen)
  if (options?.exportMode === 'gpu_worker' || options?.exportMode === 'gpu_native' || (!options?.exportMode && typeof window !== 'undefined' && 'VideoEncoder' in window)) {
    const isWorker = options?.exportMode === 'gpu_worker';
    toast({ 
      title: isWorker ? '⚡ Exportando via Worker GPU...' : '⚡ Exportando via GPU...', 
      description: isWorker ? 'Renderização isolada da Thread Principal ativada.' : 'Aceleração de hardware ativada.' 
    });
    try {
      const wcBlob = await exportWithWebCodecs({
        width,
        height,
        fps,
        duration: finalDuration,
        bitrateMbps: options?.bitrateMbps || 8,
        useWorker: isWorker,
        signal: options?.signal,
        onProgress,
        renderFrame: async (wcCtx, t) => {
          await renderFrameToCanvas(wcCtx, t, width, height);
        }
      });
      if (onProgress) onProgress(100);
      toast({ title: 'Sucesso! ⚡', description: isWorker ? 'Vídeo exportado com sucesso via Web Worker GPU.' : 'Vídeo exportado com aceleração de GPU.' });
      return { blob: wcBlob };
    } catch (gpuErr: any) {
      console.error('[GPU WebCodecs Error]', gpuErr);
      toast({ title: 'Aviso', description: `GPU offline falhou (${gpuErr?.message || 'Erro'}). Alternando para motor FFmpeg otimizado...` });
    }
  }

  // 2. MOTOR FFMPEG (Passthrough / Fast / Quality)
  const ff = await loadFFmpeg(toast);
  if (!ff) return { blob: null, error: 'Falha ao carregar motor de vídeo.' };

  await document.fonts.ready;

  // VERIFICAÇÃO DE PASSTHROUGH (Stream Copy): Apenas se não houver NENHUM overlay visual, texto ou filtro
  const hasVisualOverlays = Boolean(
    (state.text && state.text.trim().length > 0) || 
    (state.texts && state.texts.length > 0) || 
    (state.stickers && state.stickers.length > 0) || 
    state.showProfileSignature || 
    state.showLogo || 
    (state.backgroundStyle && (state.backgroundStyle.type !== 'media' || state.backgroundStyle.blur || state.backgroundStyle.brightness !== undefined || state.backgroundStyle.contrast !== undefined || state.backgroundStyle.grayscale || state.backgroundStyle.sepia || state.backgroundStyle.hueRotate)) ||
    (state.filmOpacity && state.filmOpacity > 0) ||
    (state.vignette && state.vignette.enabled)
  );

  if (!hasVisualOverlays && backgroundVideo && backgroundVideo.src) {
    try {
      toast({ title: '⚡ Passthrough Direto...', description: 'Copiando fluxo de vídeo original (2 seg).' });
      const response = await fetch(backgroundVideo.src);
      const videoBuffer = await response.arrayBuffer();
      await ff.writeFile('input_pass.mp4', new Uint8Array(videoBuffer));
      await ff.exec(['-i', 'input_pass.mp4', '-c', 'copy', 'output_pass.mp4']);
      const passData = await ff.readFile('output_pass.mp4');
      try { await ff.deleteFile('input_pass.mp4'); await ff.deleteFile('output_pass.mp4'); } catch(e) {}
      if (onProgress) onProgress(100);
      return { blob: new Blob([(passData as any).buffer], { type: 'video/mp4' }) };
    } catch (passErr) {
      console.warn('[Passthrough Fail, Fallback to frame render]', passErr);
    }
  }

  const frameCount = Math.round(finalDuration * fps);
  const frameTime = 1 / fps;

  toast({ title: 'Renderizando...', description: `Processando ${frameCount} quadros com composição completa.` });

  for (let i = 0; i < frameCount; i++) {
    if (options?.signal?.aborted) {
      for (let j = 0; j < i; j++) { try { await ff.deleteFile(`frame${j}.jpg`); } catch(e) {} }
      return { blob: null, error: 'Exportação cancelada pelo usuário.' };
    }
    try {
      await renderFrameToCanvas(ctx, i * frameTime, width, height);

      const frameData = dataURLToUint8Array(outputCanvas.toDataURL('image/jpeg', 0.85));
      await ff.writeFile(`frame${i}.jpg`, frameData);

      if (i % 5 === 0 || i === frameCount - 1) {
        if (onProgress) onProgress(Math.round(((i + 1) / frameCount) * 100));
      }
    } catch (err: any) {
      console.error(`[FFmpeg Frame ${i} Error]`, err);
    }
  }

  if (options?.signal?.aborted) {
    for (let j = 0; j < frameCount; j++) { try { await ff.deleteFile(`frame${j}.jpg`); } catch(e) {} }
    return { blob: null, error: 'Exportação cancelada pelo usuário.' };
  }

  if (onProgress) onProgress(100);
  
  toast({ title: 'Finalizando...', description: `Compilando vídeo ${format.toUpperCase()} final com mixagem de áudio.` });
  try {
    const bitrate = options?.bitrateMbps ? `${options.bitrateMbps}M` : '5M';
    const preset = options?.exportMode === 'ffmpeg_quality' ? 'medium' : 'ultrafast';
    const crf = options?.exportMode === 'ffmpeg_quality' ? '20' : '28';

    // Processamento da Trilha Sonora / Mixagem de Áudio
    let hasAudioFile = false;
    if (state.audioTracks && state.audioTracks.length > 0) {
      try {
        const audioBlob = await mixAudioTracksToBuffer(state.audioTracks, finalDuration);
        if (audioBlob) {
          const audioArrayBuffer = await audioBlob.arrayBuffer();
          await ff.writeFile('audio_mix.wav', new Uint8Array(audioArrayBuffer));
          hasAudioFile = true;
        }
      } catch (audioErr) {
        console.warn('[Exportar] Falha ao mixar áudio para FFmpeg:', audioErr);
      }
    }

    let ffArgs: string[] = [];
    if (format === 'webm') {
      ffArgs = [
        '-framerate', `${fps}`,
        '-i', 'frame%d.jpg',
      ];
      if (hasAudioFile) {
        ffArgs.push('-i', 'audio_mix.wav', '-c:a', 'libopus', '-b:a', '128k');
      }
      ffArgs.push(
        '-c:v', 'libvpx-vp9',
        '-b:v', bitrate,
        '-quality', 'realtime',
        '-cpu-used', '8',
        'output.webm'
      );
    } else if (format === 'gif') {
      ffArgs = [
        '-framerate', `${Math.min(fps, 15)}`,
        '-i', 'frame%d.jpg',
        '-vf', 'split[s0][s1];[s0]palettegen[p];[s1][p]paletteuse',
        'output.gif'
      ];
    } else {
      ffArgs = [
        '-framerate', `${fps}`,
        '-i', 'frame%d.jpg',
      ];
      if (hasAudioFile) {
        ffArgs.push('-i', 'audio_mix.wav', '-c:a', 'aac', '-b:a', '192k', '-shortest');
      }
      ffArgs.push(
        '-c:v', 'libx264',
        '-pix_fmt', 'yuv420p',
        '-preset', preset,
        '-tune', 'zerolatency',
        '-b:v', bitrate,
        '-crf', crf,
        'output.mp4'
      );
    }

    if (options?.signal?.aborted) {
      for (let j = 0; j < frameCount; j++) { try { await ff.deleteFile(`frame${j}.jpg`); } catch(e) {} }
      return { blob: null, error: 'Exportação cancelada pelo usuário.' };
    }

    await ff.exec(ffArgs);

    const ext = format === 'webm' ? 'webm' : format === 'gif' ? 'gif' : 'mp4';
    const data = await ff.readFile(`output.${ext}`);
    
    // Limpeza de arquivos temporários
    for (let i = 0; i < frameCount; i++) { try { await ff.deleteFile(`frame${i}.jpg`); } catch(e) {} }
    try { await ff.deleteFile('audio_mix.wav'); } catch(e) {}
    try { await ff.deleteFile(`output.${ext}`); } catch(e) {}

    const mimeType = format === 'gif' ? 'image/gif' : `video/${format}`;
    return { blob: new Blob([(data as any).buffer], { type: mimeType }) };
  } catch (err: any) {
    for (let i = 0; i < frameCount; i++) { try { await ff.deleteFile(`frame${i}.jpg`); } catch(e) {} }
    return { blob: null, error: `Erro na finalização: ${err?.message || 'Erro FFmpeg'}` };
  }
};


