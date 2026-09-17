import type { AudioTrack } from "../tipos";

/**
 * Utilitário de Mixagem de Áudio Multi-Faixas via Web Audio API (OfflineAudioContext).
 * Combina todas as faixas ativas (respeitando volume, mudo, fade in/out e tempos) em um único Blob WAV / AAC.
 */
export async function mixAudioTracksToBuffer(
  audioTracks: AudioTrack[],
  totalDuration: number,
  sampleRate = 44100
): Promise<Blob | null> {
  const activeTracks = audioTracks.filter((t) => !t.isMuted && !t.isHidden && t.volume > 0);

  if (activeTracks.length === 0 || totalDuration <= 0) {
    return null;
  }

  const lengthInSamples = Math.ceil(totalDuration * sampleRate);
  const offlineCtx = new (window.OfflineAudioContext || (window as any).webkitOfflineAudioContext)(
    2, // 2 canais (Estéreo)
    lengthInSamples,
    sampleRate
  );

  let addedCount = 0;

  for (const track of activeTracks) {
    try {
      const response = await fetch(track.url);
      const arrayBuffer = await response.arrayBuffer();
      const decodedBuffer = await offlineCtx.decodeAudioData(arrayBuffer);

      const source = offlineCtx.createBufferSource();
      source.buffer = decodedBuffer;

      const gainNode = offlineCtx.createGain();
      const targetGain = Math.min(2.0, Math.max(0, track.volume / 100)); // Volume 0% a 200%

      const startTime = Math.max(0, track.startTime || 0);
      const trackDuration = track.duration || decodedBuffer.duration;
      const endTime = startTime + trackDuration;

      // Configuração de Volume Base
      gainNode.gain.setValueAtTime(targetGain, startTime);

      // Fade In
      if (track.fadeInDuration && track.fadeInDuration > 0) {
        const fadeLength = Math.min(track.fadeInDuration, trackDuration);
        gainNode.gain.setValueAtTime(0.001, startTime);
        gainNode.gain.linearRampToValueAtTime(targetGain, startTime + fadeLength);
      }

      // Fade Out
      if (track.fadeOutDuration && track.fadeOutDuration > 0) {
        const fadeLength = Math.min(track.fadeOutDuration, trackDuration);
        const fadeStart = Math.max(startTime, endTime - fadeLength);
        gainNode.gain.setValueAtTime(targetGain, fadeStart);
        gainNode.gain.linearRampToValueAtTime(0.001, endTime);
      }

      source.connect(gainNode);
      gainNode.connect(offlineCtx.destination);

      source.start(startTime, track.trimStart || 0, trackDuration);
      addedCount++;
    } catch (err) {
      console.warn(`[AudioMixer] Falha ao mixar faixa "${track.name}":`, err);
    }
  }

  if (addedCount === 0) return null;

  try {
    const renderedBuffer = await offlineCtx.startRendering();
    return audioBufferToWavBlob(renderedBuffer);
  } catch (err) {
    console.error("[AudioMixer] Erro ao renderizar contexto offline de áudio:", err);
    return null;
  }
}

// Converte AudioBuffer para WAV Blob
function audioBufferToWavBlob(buffer: AudioBuffer): Blob {
  const numOfChan = buffer.numberOfChannels;
  const length = buffer.length * numOfChan * 2 + 44;
  const out = new DataView(new ArrayBuffer(length));
  let channels: Float32Array[] = [];
  let sampleRate = buffer.sampleRate;
  let offset = 0;
  let pos = 0;

  function writeString(str: string) {
    for (let i = 0; i < str.length; i++) {
      out.setUint8(pos++, str.charCodeAt(i));
    }
  }

  function setUint16(data: number) {
    out.setUint16(pos, data, true);
    pos += 2;
  }

  function setUint32(data: number) {
    out.setUint32(pos, data, true);
    pos += 4;
  }

  writeString("RIFF");
  setUint32(length - 8);
  writeString("WAVE");
  writeString("fmt ");
  setUint32(16);
  setUint16(1); // PCM
  setUint16(numOfChan);
  setUint32(sampleRate);
  setUint32(sampleRate * 2 * numOfChan);
  setUint16(numOfChan * 2);
  setUint16(16);
  writeString("data");
  setUint32(length - pos - 4);

  for (let i = 0; i < buffer.numberOfChannels; i++) {
    channels.push(buffer.getChannelData(i));
  }

  while (offset < buffer.length) {
    for (let i = 0; i < numOfChan; i++) {
      let sample = Math.max(-1, Math.min(1, channels[i][offset]));
      sample = (0.5 + sample < 0 ? sample * 32768 : sample * 32767) | 0;
      out.setInt16(pos, sample, true);
      pos += 2;
    }
    offset++;
  }

  return new Blob([out.buffer], { type: "audio/wav" });
}
