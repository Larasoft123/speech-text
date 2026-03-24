/**
 * Custom hook for capturing system audio via Screen Capture API.
 * Handles MediaRecorder lifecycle, chunk collection, and stream cleanup.
 * Returns audio blobs for transcription or other processing.
 */

import { useState, useRef } from "react";
import { getSystemAudioStream } from "@/client/lib/client-audio-utils";

export type SystemRecorderState = "idle" | "recording";

export interface UseSystemAudioRecorderReturn {
  /** Current recording state */
  state: SystemRecorderState;
  /** Error message if capture failed */
  error: string | null;
  /** Start recording system audio. Returns a Promise that resolves with the audio Blob when recording stops. */
  startRecording: () => Promise<Blob>;
  /** Stop recording and trigger blob resolution */
  stopRecording: () => void;
}

export function useSystemAudioRecorder(): UseSystemAudioRecorderReturn {
  const [state, setState] = useState<SystemRecorderState>("idle");
  const [error, setError] = useState<string | null>(null);
  const mediaRecorderRef = useRef<MediaRecorder | null>(null);
  const chunksRef = useRef<Blob[]>([]);
  const streamRef = useRef<MediaStream | null>(null);
  const resolveRef = useRef<((blob: Blob) => void) | null>(null);
  const rejectRef = useRef<((err: Error) => void) | null>(null);

  async function startRecording(): Promise<Blob> {
    setError(null);
    chunksRef.current = [];

    return new Promise<Blob>(async (resolve, reject) => {
      resolveRef.current = resolve;
      rejectRef.current = reject;

      try {
        const stream = await getSystemAudioStream();
        streamRef.current = stream;

        // Create a derived stream with ONLY audio tracks for the MediaRecorder
        const audioOnlyStream = new MediaStream(stream.getAudioTracks());

        const mediaRecorder = new MediaRecorder(audioOnlyStream, {
          mimeType: "audio/webm;codecs=opus",
        });

        mediaRecorderRef.current = mediaRecorder;

        mediaRecorder.ondataavailable = (e) => {
          if (e.data.size > 0) {
            chunksRef.current.push(e.data);
          }
        };

        mediaRecorder.onstop = () => {
          // Stop ALL tracks (audio AND video) of the original stream
          // to end the screen share session properly.
          stream.getTracks().forEach((track: MediaStreamTrack) => track.stop());
          streamRef.current = null;

          const blob = new Blob(chunksRef.current, { type: "audio/webm" });
          chunksRef.current = [];
          setState("idle");
          if (resolveRef.current) {
            resolveRef.current(blob);
            resolveRef.current = null;
            rejectRef.current = null;
          }
        };

        mediaRecorder.start(1000);
        setState("recording");
      } catch (err) {
        const errorMessage =
          err instanceof Error ? err.message : "Failed to capture system audio";
        setError(errorMessage);
        setState("idle");
        if (rejectRef.current) {
          rejectRef.current(new Error(errorMessage));
          resolveRef.current = null;
          rejectRef.current = null;
        }
      }
    });
  }

  function stopRecording() {
    if (mediaRecorderRef.current && mediaRecorderRef.current.state !== "inactive") {
      mediaRecorderRef.current.stop();
    }
  }

  return {
    state,
    error,
    startRecording,
    stopRecording,
  };
}