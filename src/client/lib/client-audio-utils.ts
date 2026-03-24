/**
 * Client-side audio utilities using browser Web Audio API.
 * No external dependencies — uses AudioContext.decodeAudioData() natively.
 *
 * Supported audio formats (browser-dependent):
 * WAV, MP3, OGG, FLAC, WebM/Opus, AAC, M4A.
 *
 * Video formats are automatically processed:
 * MP4, WebM, MOV, AVI — audio track is extracted client-side.
 */

export interface DecodedAudio {
  channelData: Float32Array[];
  sampleRate: number;
}

/**
 * MIME types for audio that browsers can decode natively.
 */
const AUDIO_MIME_TYPES = [
  "audio/wav",
  "audio/wave",
  "audio/x-wav",
  "audio/mp3",
  "audio/mpeg",
  "audio/ogg",
  "audio/flac",
  "audio/webm",
  "audio/aac",
  "audio/x-m4a",
  "audio/mp4",
];

/**
 * MIME types for video containers with audio tracks.
 */
const VIDEO_MIME_TYPES = [
  "video/mp4",
  "video/webm",
  "video/quicktime",
  "video/x-msvideo",
  "video/avi",
];

const VIDEO_EXTENSIONS = [".mp4", ".webm", ".mov", ".avi", ".mkv", ".m4v"];

/**
 * Check if a file is a video based on MIME type or extension.
 */
export function isVideoFile(file: File): boolean {
  if (VIDEO_MIME_TYPES.includes(file.type)) return true;
  const ext = file.name.toLowerCase().match(/\.[^.]+$/)?.[0];
  return ext ? VIDEO_EXTENSIONS.includes(ext) : false;
}

/**
 * Extract audio from a video file using video element + MediaRecorder.
 * This bypasses AudioContext.decodeAudioData() which has limited
 * support for video container formats.
 *
 * @param videoBlob - The video file as Blob
 * @param mimeType - Optional MIME type hint (e.g., "video/mp4")
 * @returns Promise<ArrayBuffer> containing audio data
 */
async function extractAudioFromVideo(
  videoBlob: Blob,
  mimeType?: string,
): Promise<ArrayBuffer> {
  return new Promise((resolve, reject) => {
    const video = document.createElement("video");
    const videoUrl = URL.createObjectURL(videoBlob);
    video.src = videoUrl;

    // Ensure video metadata is loaded before capturing
    video.preload = "metadata";

    video.onloadedmetadata = () => {
      // Create a MediaStream from the video element's audio track
      // captureStream() exists on HTMLMediaElement but TypeScript types are incomplete
      const stream = (video as HTMLVideoElement & { captureStream: () => MediaStream }).captureStream();

      // Find the audio track
      const audioTrack = stream.getAudioTracks()[0];
      if (!audioTrack) {
        URL.revokeObjectURL(videoUrl);
        reject(
          new Error(
            "No audio track found in video. The video may not contain an audio stream.",
          ),
        );
        return;
      }

      // Create audio-only stream
      const audioStream = new MediaStream([audioTrack]);

      // Determine best audio MIME type supported by the browser
      const audioMimeTypes = [
        "audio/webm;codecs=opus",
        "audio/webm",
        "audio/mp4",
        "audio/aac",
      ];

      let selectedMimeType = "";
      for (const mime of audioMimeTypes) {
        if (MediaRecorder.isTypeSupported(mime)) {
          selectedMimeType = mime;
          break;
        }
      }

      if (!selectedMimeType) {
        URL.revokeObjectURL(videoUrl);
        reject(new Error("No supported audio MIME type for MediaRecorder."));
        return;
      }

      try {
        const mediaRecorder = new MediaRecorder(audioStream, {
          mimeType: selectedMimeType,
        });
        const chunks: Blob[] = [];

        mediaRecorder.ondataavailable = (e) => {
          if (e.data.size > 0) {
            chunks.push(e.data);
          }
        };

        mediaRecorder.onerror = (e) => {
          URL.revokeObjectURL(videoUrl);
          reject(
            new Error(`MediaRecorder error: ${(e as Event).type}`),
          );
        };

        mediaRecorder.onstop = () => {
          const audioBlob = new Blob(chunks, { type: selectedMimeType });
          audioBlob.arrayBuffer().then((arrayBuffer) => {
            URL.revokeObjectURL(videoUrl);
            resolve(arrayBuffer);
          }).catch((err) => {
            URL.revokeObjectURL(videoUrl);
            reject(err);
          });
        };

        // Start recording and play video to capture audio
        mediaRecorder.start();
        video.play().catch(() => {
          // Play might fail due to autoplay policies, but that's ok
          // The audio track should still be captured
        });

        // Stop when video ends
        video.onended = () => {
          mediaRecorder.stop();
          audioTrack.stop();
        };

        // Safety timeout: stop after video duration + 1 second
        const timeoutId = window.setTimeout(() => {
          if (mediaRecorder.state === "recording") {
            mediaRecorder.stop();
            audioTrack.stop();
          }
          URL.revokeObjectURL(videoUrl);
        }, (video.duration || 30) * 1000 + 1000);

        // Ensure cleanup on stop
        const originalOnstop = mediaRecorder.onstop;
        mediaRecorder.onstop = () => {
          window.clearTimeout(timeoutId);
          if (originalOnstop) {
            originalOnstop.call(mediaRecorder, new Event("stop"));
          }
        };
      } catch (err) {
        URL.revokeObjectURL(videoUrl);
        reject(err);
      }
    };

    video.onerror = () => {
      URL.revokeObjectURL(videoUrl);
      reject(new Error("Failed to load video file. The format may be unsupported."));
    };

    // Load the video
    video.load();
  });
}

/**
 * Decode audio ArrayBuffer to raw channel data + sampleRate.
 * Uses the browser's native AudioContext.decodeAudioData().
 */
export async function decodeAudio(buffer: ArrayBuffer): Promise<DecodedAudio> {
  const audioContext = new AudioContext();
  try {
    const audioBuffer = await audioContext.decodeAudioData(buffer);
    const channelData: Float32Array[] = [];
    for (let i = 0; i < audioBuffer.numberOfChannels; i++) {
      channelData.push(audioBuffer.getChannelData(i));
    }
    return {
      channelData,
      sampleRate: audioBuffer.sampleRate,
    };
  } finally {
    audioContext.close();
  }
}

/**
 * Convert decoded audio to 16kHz mono Float32Array via linear interpolation.
 * Whisper models expect: Float32Array, 16kHz sample rate, single channel.
 */
export function resampleTo16kMono(
  channelData: Float32Array[],
  sampleRate: number,
): Float32Array {
  const numChannels = channelData.length;

  // Downmix to mono (average channels)
  const length = channelData[0].length;
  let mono: Float32Array;
  if (numChannels === 1) {
    mono = channelData[0];
  } else {
    mono = new Float32Array(length);
    for (let i = 0; i < length; i++) {
      let sum = 0;
      for (let ch = 0; ch < numChannels; ch++) {
        sum += channelData[ch][i];
      }
      mono[i] = sum / numChannels;
    }
  }

  // No resampling needed if already 16kHz
  if (sampleRate === 16000) {
    return mono;
  }

  // Linear interpolation resampling
  const ratio = sampleRate / 16000;
  const outputLength = Math.round(mono.length / ratio);
  const output = new Float32Array(outputLength);

  for (let i = 0; i < outputLength; i++) {
    const srcIndex = i * ratio;
    const srcIndexFloor = Math.floor(srcIndex);
    const srcIndexCeil = Math.min(srcIndexFloor + 1, mono.length - 1);
    const t = srcIndex - srcIndexFloor;
    output[i] = mono[srcIndexFloor] * (1 - t) + mono[srcIndexCeil] * t;
  }

  return output;
}

/**
 * Full pipeline: file → decode/resample → 16kHz mono Float32Array.
 * Handles both audio and video files automatically.
 *
 * For video files, extracts the audio track using MediaRecorder + captureStream().
 * For audio files, uses AudioContext.decodeAudioData() directly.
 *
 * @param file - The File object (audio or video)
 * @returns Float32Array ready for Whisper input
 */
export async function prepareAudioForWhisper(
  file: File,
): Promise<Float32Array> {
  let audioBuffer: ArrayBuffer;

  if (isVideoFile(file)) {
    console.log(`[audio-utils] Extracting audio from video: ${file.name}`);
    audioBuffer = await extractAudioFromVideo(file);
  } else {
    audioBuffer = await file.arrayBuffer();
  }

  const { channelData, sampleRate } = await decodeAudio(audioBuffer);
  return resampleTo16kMono(channelData, sampleRate);
}

// ============================================================================
// System Audio Capture Utilities
// ============================================================================

/**
 * Capture system or tab audio using the Screen Capture API.
 * The user must manually check "Share Audio" in the dialog.
 * Returns the full MediaStream. The caller MUST handle stopping all tracks
 * (including video) when finished recording to close the screen share session.
 */
export async function getSystemAudioStream(): Promise<MediaStream> {
  let stream: MediaStream;
  try {
    stream = await navigator.mediaDevices.getDisplayMedia({
      video: true, // Video MUST be true for getDisplayMedia
      audio: true, 
    });
  } catch (err) {
    throw new Error("Screen share was cancelled or denied by the user.");
  }

  const audioTracks = stream.getAudioTracks();
  if (audioTracks.length === 0) {
    stream.getTracks().forEach((t) => t.stop());
    throw new Error(
      "No audio track found. Please make sure to check 'Share audio' when selecting a tab or screen.",
    );
  }

  // We DO NOT stop the video track here.
  // Stopping the video track immediately kills the entire Screen Share session
  // in most modern browsers, preventing audio capture.
  return stream;
}

// ============================================================================
// TTS Audio Utilities - Convert generated audio to playable formats
// ============================================================================

/**
 * Convert Float32Array audio data to a Blob URL for HTML audio playback.
 * Creates a WAV file in memory.
 */
export function audioToBlobUrl(audio: Float32Array, samplingRate: number): string {
  const wavData = createWavFile(audio, samplingRate);
  const blob = new Blob([wavData], { type: "audio/wav" });
  return URL.createObjectURL(blob);
}

/**
 * Create a WAV file from Float32Array audio data.
 */
function createWavFile(audio: Float32Array, samplingRate: number): ArrayBuffer {
  const numChannels = 1;
  const bitsPerSample = 32;
  const bytesPerSample = bitsPerSample / 8;
  const blockAlign = numChannels * bytesPerSample;
  const byteRate = samplingRate * blockAlign;
  const dataSize = audio.length * bytesPerSample;
  const bufferSize = 44 + dataSize;

  const buffer = new ArrayBuffer(bufferSize);
  const view = new DataView(buffer);

  // RIFF header
  writeString(view, 0, "RIFF");
  view.setUint32(4, 36 + dataSize, true);
  writeString(view, 8, "WAVE");

  // fmt chunk
  writeString(view, 12, "fmt ");
  view.setUint32(16, 16, true); // chunk size
  view.setUint16(20, 3, true); // audio format (3 = IEEE float)
  view.setUint16(22, numChannels, true);
  view.setUint32(24, samplingRate, true);
  view.setUint32(28, byteRate, true);
  view.setUint16(32, blockAlign, true);
  view.setUint16(34, bitsPerSample, true);

  // data chunk
  writeString(view, 36, "data");
  view.setUint32(40, dataSize, true);

  // Write audio samples
  const offset = 44;
  for (let i = 0; i < audio.length; i++) {
    view.setFloat32(offset + i * 4, audio[i], true);
  }

  return buffer;
}

/**
 * Write ASCII string to DataView
 */
function writeString(view: DataView, offset: number, str: string): void {
  for (let i = 0; i < str.length; i++) {
    view.setUint8(offset + i, str.charCodeAt(i));
  }
}

/**
 * Calculate duration of audio in seconds
 */
export function calculateAudioDuration(audio: Float32Array, samplingRate: number): number {
  return audio.length / samplingRate;
}

/**
 * Format duration in seconds to MM:SS format
 */
export function formatDuration(seconds: number): string {
  const mins = Math.floor(seconds / 60);
  const secs = Math.floor(seconds % 60);
  return `${mins}:${secs.toString().padStart(2, "0")}`;
}

/**
 * Download audio as WAV file
 */
export function downloadAudio(audio: Float32Array, samplingRate: number, filename = "audio.wav"): void {
  const wavData = createWavFile(audio, samplingRate);
  const blob = new Blob([wavData], { type: "audio/wav" });
  const url = URL.createObjectURL(blob);
  
  const a = document.createElement("a");
  a.href = url;
  a.download = filename;
  document.body.appendChild(a);
  a.click();
  document.body.removeChild(a);
  URL.revokeObjectURL(url);
}

/**
 * Clean up audio blob URL to prevent memory leaks
 */
export function revokeAudioUrl(url: string): void {
  if (url && url.startsWith("blob:")) {
    URL.revokeObjectURL(url);
  }
}
