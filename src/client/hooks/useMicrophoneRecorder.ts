import { useState, useRef, useEffect } from "react";
import { AudioCapturer } from "@/lib/AudioCapturer";
import { SpeechRecognizer } from "@/lib/SpeechRecognizer";

export type MicrophoneRecorderState = "idle" | "recording";

export interface UseMicrophoneRecorderReturn {
  /** Current recording state */
  state: MicrophoneRecorderState;
  /** Error message if capture failed */
  error: string | null;
  /** 
   * Start recording microphone audio. Returns a Promise that resolves with a Blob when recording stops.
   * The Blob type depends on the availability of the SpeechRecognition API:
   * - If SpeechRecognition is available: Blob of type 'text/plain' containing the transcription.
   * - Otherwise: Blob of type 'audio/webm' containing the raw audio.
   */
  startRecording: () => Promise<Blob>;
  /** Stop recording and trigger blob resolution */
  stopRecording: () => void;
}

export function useMicrophoneRecorder(): UseMicrophoneRecorderReturn {
  const [state, setState] = useState<MicrophoneRecorderState>("idle");
  const [error, setError] = useState<string | null>(null);

  // Holds the active recorder instance (either AudioCapturer or SpeechRecognizer)
  const recognizerRef = useRef<AudioCapturer | SpeechRecognizer | null>(null);
  // Refs to resolve/reject the promise returned by startRecording
  const stopResolveRef = useRef<((blob: Blob) => void) | null>(null);
  const stopRejectRef = useRef<((err: Error) => void) | null>(null);

  // Cleanup on unmount: destroy recognizer if still active (prevents memory/mic leaks)
  useEffect(() => {
    return () => {
      if (recognizerRef.current) {
        recognizerRef.current.destroy();
        recognizerRef.current = null;
        // Reject any pending promise
        if (stopRejectRef.current) {
          stopRejectRef.current(new Error("Component unmounted while recording"));
          stopResolveRef.current = null;
          stopRejectRef.current = null;
        }
      }
    };
  }, []);

  async function startRecording(): Promise<Blob> {
    setError(null);
    // Return a new promise that will be resolved when stopRecording is called
    return new Promise<Blob>((resolve, reject) => {
      stopResolveRef.current = resolve;
      stopRejectRef.current = reject;

      // Choose the recognizer based on availability of SpeechRecognition
      const RecognizerClass = SpeechRecognizer.isAvailable()
        ? SpeechRecognizer
        : AudioCapturer;
      const recognizer = new RecognizerClass();
      recognizerRef.current = recognizer;

      recognizer
        .start()
        .then(() => {
          setState("recording");
        })
        .catch((err: unknown) => {
          // Starting failed (e.g., permission denied)
          const message =
            err instanceof Error ? err.message : "Failed to start recorder";
          setError(message);
          setState("idle");
          // Reject the promise because we cannot proceed to record
          if (stopRejectRef.current) {
            stopRejectRef.current(err as Error);
            stopResolveRef.current = null;
            stopRejectRef.current = null;
          }
          recognizerRef.current = null;
        });
    });
  }

  function stopRecording() {
    const recognizer = recognizerRef.current;
    if (!recognizer) {
      // Nothing to stop
      return;
    }

    recognizer
      .stop()
      .then((blob: Blob) => {
        setState("idle");
        // Resolve the promise from startRecording
        if (stopResolveRef.current) {
          stopResolveRef.current(blob);
          stopResolveRef.current = null;
          stopRejectRef.current = null;
        }
        // Clean up
        recognizer.destroy();
        recognizerRef.current = null;
      })
      .catch((err) => {
        const message =
          err instanceof Error ? err.message : "Unknown error";
        setError(message);
        setState("idle");
        // Reject the promise from startRecording
        if (stopRejectRef.current) {
          stopRejectRef.current(err);
          stopResolveRef.current = null;
          stopRejectRef.current = null;
        }
        // Clean up
        recognizer.destroy();
        recognizerRef.current = null;
      });
  }

  return {
    state,
    error,
    startRecording,
    stopRecording,
  };
}