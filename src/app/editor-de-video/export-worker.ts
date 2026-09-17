import * as Mp4Muxer from 'mp4-muxer';

export interface WorkerMessageData {
  type: 'init' | 'frame' | 'finish' | 'cancel';
  config?: {
    width: number;
    height: number;
    fps: number;
    duration: number;
    bitrateMbps?: number;
  };
  frameIndex?: number;
  imageBitmap?: ImageBitmap;
}

let encoder: VideoEncoder | null = null;
let muxer: Mp4Muxer.Muxer<Mp4Muxer.ArrayBufferTarget> | null = null;
let isInitialized = false;
let frameDurationUs = 33333;

self.onmessage = async (e: MessageEvent<WorkerMessageData>) => {
  const { type, config, frameIndex, imageBitmap } = e.data;

  try {
    if (type === 'init' && config) {
      const { width, height, fps, bitrateMbps = 8 } = config;
      const evenWidth = Math.floor(width / 2) * 2;
      const evenHeight = Math.floor(height / 2) * 2;
      frameDurationUs = Math.round(1_000_000 / fps);

      muxer = new Mp4Muxer.Muxer({
        target: new Mp4Muxer.ArrayBufferTarget(),
        video: {
          codec: 'avc',
          width: evenWidth,
          height: evenHeight,
        },
        fastStart: 'in-memory',
      });

      encoder = new VideoEncoder({
        output: (chunk, meta) => {
          if (muxer) {
            muxer.addVideoChunk(chunk, meta);
          }
        },
        error: (err) => {
          self.postMessage({ type: 'error', error: err.message || String(err) });
        },
      });

      const videoConfig: VideoEncoderConfig = {
        codec: 'avc1.42E01E', // H.264 Baseline/Main
        width: evenWidth,
        height: evenHeight,
        bitrate: bitrateMbps * 1_000_000,
        framerate: fps,
      };

      const support = await VideoEncoder.isConfigSupported(videoConfig);
      if (!support.supported) {
        videoConfig.codec = 'avc1.640028'; // High Profile
      }

      encoder.configure(videoConfig);
      isInitialized = true;
      self.postMessage({ type: 'initialized' });
      return;
    }

    if (type === 'frame' && imageBitmap && encoder && isInitialized) {
      const idx = frameIndex || 0;
      const timestampUs = Math.round(idx * frameDurationUs);

      const videoFrame = new VideoFrame(imageBitmap, {
        timestamp: timestampUs,
        duration: frameDurationUs,
      });

      const isKeyFrame = idx % 60 === 0 || idx === 0;
      encoder.encode(videoFrame, { keyFrame: isKeyFrame });
      
      videoFrame.close();
      imageBitmap.close();

      self.postMessage({ type: 'frame_processed', frameIndex: idx });
      return;
    }

    if (type === 'finish' && encoder && muxer) {
      await encoder.flush();
      muxer.finalize();

      const { buffer } = muxer.target;
      self.postMessage({ type: 'complete', buffer }, [buffer]);

      try { encoder.close(); } catch (err) {}
      encoder = null;
      muxer = null;
      isInitialized = false;
      return;
    }

    if (type === 'cancel') {
      if (encoder) {
        try { encoder.close(); } catch (err) {}
      }
      encoder = null;
      muxer = null;
      isInitialized = false;
      self.postMessage({ type: 'cancelled' });
      return;
    }
  } catch (err: any) {
    self.postMessage({ type: 'error', error: err?.message || String(err) });
  }
};
