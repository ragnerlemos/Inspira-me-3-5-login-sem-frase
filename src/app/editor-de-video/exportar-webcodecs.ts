import * as Mp4Muxer from 'mp4-muxer';

export interface WebCodecsExportOptions {
  width: number;
  height: number;
  fps: number;
  duration: number;
  bitrateMbps?: number;
  useWorker?: boolean;
  signal?: AbortSignal;
  onProgress?: (p: number) => void;
  renderFrame: (ctx: CanvasRenderingContext2D, time: number, frameIndex: number) => Promise<void>;
}

export async function exportWithWebCodecs(options: WebCodecsExportOptions): Promise<Blob> {
  if (typeof window === 'undefined' || !('VideoEncoder' in window)) {
    throw new Error('WebCodecs (VideoEncoder) não é suportado neste navegador.');
  }

  const { width, height, fps, duration, bitrateMbps = 8, useWorker = false, signal, onProgress, renderFrame } = options;

  // Garantir estritamente dimensões pares para H.264
  const evenWidth = Math.floor(width / 2) * 2;
  const evenHeight = Math.floor(height / 2) * 2;

  if (evenWidth <= 0 || evenHeight <= 0) {
    throw new Error(`Dimensões inválidas para exportação GPU: ${evenWidth}x${evenHeight}`);
  }

  const canvas = document.createElement('canvas');
  canvas.width = evenWidth;
  canvas.height = evenHeight;
  const ctx = canvas.getContext('2d', { alpha: false, willReadFrequently: false });
  if (!ctx) throw new Error('Falha ao obter contexto 2D para GPU WebCodecs.');

  const totalFrames = Math.max(1, Math.round(duration * fps));

  // Tentar via Worker se solicitado e suportado
  if (useWorker && typeof Worker !== 'undefined') {
    try {
      return await exportWithWorker(canvas, ctx, totalFrames, options);
    } catch (workerErr) {
      console.warn('[WebCodecs Worker] Falha ao executar via Worker, fallback para Main Thread:', workerErr);
    }
  }

  const muxer = new Mp4Muxer.Muxer({
    target: new Mp4Muxer.ArrayBufferTarget(),
    video: {
      codec: 'avc',
      width: evenWidth,
      height: evenHeight,
    },
    fastStart: 'in-memory',
  });

  let encoderError: Error | null = null;

  const encoder = new VideoEncoder({
    output: (chunk, meta) => {
      try {
        muxer.addVideoChunk(chunk, meta);
      } catch (err) {
        console.error('[WebCodecs Muxer Error]', err);
      }
    },
    error: (e) => {
      console.error('[WebCodecs Encoder Error]', e);
      encoderError = e instanceof Error ? e : new Error(String(e));
    },
  });

  const config: VideoEncoderConfig = {
    codec: 'avc1.42E01E', // H.264 Baseline/Main
    width: evenWidth,
    height: evenHeight,
    bitrate: (bitrateMbps || 8) * 1_000_000,
    framerate: fps,
  };

  const support = await VideoEncoder.isConfigSupported(config);
  if (!support.supported) {
    config.codec = 'avc1.640028'; // High Profile
    const support2 = await VideoEncoder.isConfigSupported(config);
    if (!support2.supported) {
      throw new Error('Configuração H.264 GPU não suportada por este dispositivo.');
    }
  }

  encoder.configure(config);

  const frameDurationUs = Math.round(1_000_000 / fps);

  console.log(`[WebCodecs GPU Export] Renderizando ${totalFrames} quadros offline a ${fps} FPS (${evenWidth}x${evenHeight})...`);

  try {
    for (let i = 0; i < totalFrames; i++) {
      if (signal?.aborted) {
        encoder.close();
        throw new Error('Exportação cancelada pelo usuário.');
      }
      if (encoderError) {
        throw encoderError;
      }

      const time = i / fps;
      const timestampUs = Math.round(i * frameDurationUs);

      await renderFrame(ctx, time, i);

      const videoFrame = new VideoFrame(canvas, {
        timestamp: timestampUs,
        duration: frameDurationUs,
      });

      const isKeyFrame = i % (fps * 2) === 0 || i === 0;
      encoder.encode(videoFrame, { keyFrame: isKeyFrame });
      videoFrame.close();

      if (onProgress && (i % 5 === 0 || i === totalFrames - 1)) {
        onProgress(Math.round(((i + 1) / totalFrames) * 100));
      }

      if (i % 10 === 0) {
        await new Promise((r) => setTimeout(r, 0));
      }
    }

    await encoder.flush();
    muxer.finalize();

    const { buffer } = muxer.target;
    return new Blob([buffer], { type: 'video/mp4' });
  } catch (err: any) {
    console.error('[WebCodecs Pipeline Error]', err);
    try { encoder.close(); } catch(e) {}
    throw err;
  }
}

async function exportWithWorker(
  canvas: HTMLCanvasElement,
  ctx: CanvasRenderingContext2D,
  totalFrames: number,
  options: WebCodecsExportOptions
): Promise<Blob> {
  const { width, height, fps, duration, bitrateMbps = 8, signal, onProgress, renderFrame } = options;

  return new Promise((resolve, reject) => {
    const worker = new Worker(new URL('./export-worker.ts', import.meta.url), { type: 'module' });

    let isFinished = false;

    const cleanup = () => {
      isFinished = true;
      worker.terminate();
    };

    if (signal) {
      signal.addEventListener('abort', () => {
        worker.postMessage({ type: 'cancel' });
        cleanup();
        reject(new Error('Exportação cancelada pelo usuário.'));
      });
    }

    worker.onmessage = async (e) => {
      const { type, buffer, error, frameIndex } = e.data;

      if (type === 'error') {
        cleanup();
        reject(new Error(`Worker Error: ${error}`));
        return;
      }

      if (type === 'initialized') {
        // Enviar os frames sequencialmente em ritmo desacoplado
        try {
          for (let i = 0; i < totalFrames; i++) {
            if (isFinished || signal?.aborted) break;

            const time = i / fps;
            await renderFrame(ctx, time, i);

            const bitmap = await createImageBitmap(canvas);

            worker.postMessage(
              {
                type: 'frame',
                frameIndex: i,
                imageBitmap: bitmap,
              },
              [bitmap] // Transferable para zero cópias em memória
            );

            if (onProgress && (i % 5 === 0 || i === totalFrames - 1)) {
              onProgress(Math.round(((i + 1) / totalFrames) * 100));
            }

            // Evita bloquear o loop de mensagens dando micro-vazão
            if (i % 15 === 0) {
              await new Promise((r) => setTimeout(r, 0));
            }
          }

          if (!isFinished) {
            worker.postMessage({ type: 'finish' });
          }
        } catch (err) {
          cleanup();
          reject(err);
        }
      }

      if (type === 'complete' && buffer) {
        cleanup();
        resolve(new Blob([buffer], { type: 'video/mp4' }));
      }
    };

    worker.onerror = (err) => {
      cleanup();
      reject(new Error(`Erro fatal no Worker: ${err.message}`));
    };

    worker.postMessage({
      type: 'init',
      config: { width, height, fps, duration, bitrateMbps },
    });
  });
}


