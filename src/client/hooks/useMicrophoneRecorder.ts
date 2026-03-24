/**
 * Custom hook for capturing microphone audio via getUserMedia.
 * Handles MediaRecorder lifecycle, chunk collection, and stream cleanup.
 * Returns audio blobs for transcription or other processing.
 */

import { useState, useRef } from "react";

export type MicrophoneRecorderState = "idle" | "recording";

export interface UseMicrophoneRecorderReturn {
  /** Current recording state */
  state: MicrophoneRecorderState;
  /** Error message if capture failed */
  error: string | null;
  /** Start recording microphone audio. Returns a Promise that resolves with the audio Blob when recording stops. */
  startRecording: () => Promise<Blob>;
  /** Stop recording and trigger blob resolution */
  stopRecording: () => void;
}

export function useMicrophoneRecorder(): UseMicrophoneRecorderReturn {
  const [state, setState] = useState<MicrophoneRecorderState>("idle");
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
        const stream = await navigator.mediaDevices.getUserMedia({
          audio: {
            channelCount: 1,
            sampleRate: 16000,
            echoCancellation: true,
            noiseSuppression: true,
          },
        });
        streamRef.current = stream;

        const mediaRecorder = new MediaRecorder(stream, {
          mimeType: "audio/webm;codecs=opus",
        });

        mediaRecorderRef.current = mediaRecorder;

        mediaRecorder.ondataavailable = (e) => {
          if (e.data.size > 0) {
            chunksRef.current.push(e.data);
          }
        };

        mediaRecorder.onstop = () => {
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
          err instanceof Error ? err.message : "Failed to access microphone";
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