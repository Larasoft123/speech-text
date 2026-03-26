/**
 * Encapsulates the MediaRecorder-based audio capture logic.
 * Provides a promise-based start/stop API that returns a Blob of audio/webm.
 */
export class AudioCapturer {
  private mediaRecorder: MediaRecorder | null = null;
  private stream: MediaStream | null = null;
  private readonly chunks: Blob[] = [];
  private resolveBlob: ((blob: Blob) => void) | null = null;
  private rejectBlob: ((err: Error) => void) | null = null;

  /**
   * Returns true if the browser supports MediaRecorder and getUserMedia.
   */
  public static isAvailable(): boolean {
    return !!(
      navigator.mediaDevices &&
      typeof navigator.mediaDevices.getUserMedia === 'function' &&
      typeof window.MediaRecorder !== 'undefined'
    );
  }

  /**
   * Starts audio capture.
   * @returns Promise that resolves when the recorder has been initialized.
   * The actual Blob is obtained via stop().
   */
  public start(): Promise<void> {
    return new Promise((resolve, reject) => {
      // If already started, reject
      if (this.mediaRecorder) {
        reject(new Error("AudioCapturer already started"));
        return;
      }

      navigator.mediaDevices
        .getUserMedia({
          audio: {
            channelCount: 1,
            sampleRate: 16000,
            echoCancellation: true,
            noiseSuppression: true,
          },
        })
        .then((stream) => {
          this.stream = stream;
          this.mediaRecorder = new MediaRecorder(stream, {
            mimeType: "audio/webm;codecs=opus",
          });

          this.mediaRecorder.ondataavailable = (e) => {
            if (e.data.size > 0) {
              this.chunks.push(e.data);
            }
          };

          this.mediaRecorder.onstop = () => {
            // Stop all tracks
            if (this.stream) {
              this.stream.getTracks().forEach((track) => track.stop());
              this.stream = null;
            }
            // Create blob and resolve
            const blob = new Blob(this.chunks, { type: "audio/webm" });
            this.chunks.length = 0;
            if (this.resolveBlob) {
              this.resolveBlob(blob);
              this.resolveBlob = null;
              this.rejectBlob = null;
            }
          };

          this.mediaRecorder.onerror = (e) => {
            const msg = `MediaRecorder error: ${e.error}`;
            if (this.rejectBlob) {
              this.rejectBlob(new Error(msg));
              this.resolveBlob = null;
              this.rejectBlob = null;
            } else {
              console.error(msg);
            }
          };

          this.mediaRecorder.start(1000);
          resolve();
        })
        .catch((err) => {
          reject(
            err instanceof Error
              ? err
              : new Error("Failed to access microphone")
          );
        });
    });
  }

  /**
   * Stops recording and returns a Blob with the captured audio.
   * @returns Promise that resolves with the audio Blob.
   */
  public stop(): Promise<Blob> {
    return new Promise((resolve, reject) => {
      if (!this.mediaRecorder) {
        reject(new Error("AudioCapturer not started"));
        return;
      }
      this.resolveBlob = resolve;
      this.rejectBlob = reject;
      try {
        this.mediaRecorder.stop();
      } catch (err) {
        reject(
          err instanceof Error
            ? err
            : new Error("Failed to stop MediaRecorder")
        );
        this.resolveBlob = null;
        this.rejectBlob = null;
      }
    });
  }

  /**
   * Forcefully releases any held resources.
   * Should be called if the component unmounts before stop().
   */
  public destroy(): void {
    if (this.mediaRecorder) {
      try {
        this.mediaRecorder.stop();
      } catch {
        // ignore
      }
      this.mediaRecorder = null;
    }
    if (this.stream) {
      this.stream.getTracks().forEach((track) => track.stop());
      this.stream = null;
    }
    this.chunks.length = 0;
    this.resolveBlob = null;
    this.rejectBlob = null;
  }
}