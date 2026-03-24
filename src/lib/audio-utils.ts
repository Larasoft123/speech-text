import { execFile } from "node:child_process";
import { promisify } from "node:util";
import { writeFile, unlink } from "node:fs/promises";
import { join } from "node:path";
import { tmpdir } from "node:os";
import { randomUUID } from "node:crypto";

const execFileAsync = promisify(execFile);

/**
 * Decode any audio to 16kHz mono PCM via ffmpeg.
 * Supports ALL formats ffmpeg can decode: WAV, MP3, OGG, WebM/Opus, FLAC, AAC, M4A, AIFF, AMR, WMA, ALAC, QOA, etc.
 * FFMPEG auto-detects the input format from content — no need to specify it.
 *
 * @param buffer  - Raw audio file as ArrayBuffer
 * @param fileName - Original filename with extension (e.g. "audio.mp3") for temp file extension
 * @returns Float32Array at 16kHz mono, normalized to [-1.0, 1.0]
 */
async function ffmpegDecode(
  buffer: ArrayBuffer,
  fileName = "audio.wav",
): Promise<Float32Array> {
  const ext = fileName.split(".").pop()?.toLowerCase() ?? "wav";
  const inputPath = join(tmpdir(), `${randomUUID()}.${ext}`);
  await writeFile(inputPath, Buffer.from(buffer));

  try {
    const { stdout } = await execFileAsync(
      "ffmpeg",
      [
        "-y",          // overwrite output
        "-hide_banner",
        "-loglevel",   "error",
        "-i",          inputPath, // ffmpeg auto-detects format from content
        "-f",          "s16le",   // output: signed 16-bit LE PCM
        "-ac",         "1",       // mono
        "-ar",         "16000",   // 16kHz
        "-",
      ],
      {
        encoding: null,
        maxBuffer: 500 * 1024 * 1024, // 500MB
      },
    );

    // s16le = Int16Array PCM [-32768, 32767] → Float32 [-1.0, 1.0]
    const uint8 = new Uint8Array(stdout as Buffer);
    const int16 = new Int16Array(uint8.buffer, uint8.byteOffset, uint8.byteLength / 2);
    const float32 = new Float32Array(int16.length);
    for (let i = 0; i < int16.length; i++) {
      float32[i] = int16[i] / 32768;
    }

    return float32;
  } finally {
    await unlink(inputPath).catch(() => {});
  }
}

/**
 * Full pipeline: decode any audio → 16kHz mono Float32Array.
 * Returns Float32Array ready for Whisper input.
 */
export async function prepareAudioForWhisper(
  buffer: ArrayBuffer,
  fileName = "audio.wav",
): Promise<Float32Array> {
  return ffmpegDecode(buffer, fileName);
}
