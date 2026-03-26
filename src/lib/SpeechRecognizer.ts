/**
 * Encapsulates the Web Speech API (SpeechRecognition) logic.
 * Provides a promise-based start/stop API that returns a Blob of text/plain
 * containing the transcription when SpeechRecognition is available.
 */
export class SpeechRecognizer {
  private recognition: any = null;
  private readonly transcriptParts: string[] = [];
  private resolveBlob: ((blob: Blob) => void) | null = null;
  private rejectBlob: ((err: Error) => void) | null = null;
  private lang: string;

  constructor(lang?: string) {
    this.lang = lang ?? (navigator.language ?? 'en-US');
  }

  /**
   * Returns true if the browser supports SpeechRecognition (with or without prefix).
   */
  public static isAvailable(): boolean {
    const SpeechRecognition = (window as any).SpeechRecognition ||
      (window as any).webkitSpeechRecognition;
    return !!SpeechRecognition;
  }

  /**
   * Starts speech recognition.
   * @returns Promise that resolves when recognizer has been initialized.
   * The actual Blob (transcription) is obtained via stop().
   */
  public start(): Promise<void> {
    return new Promise((resolve, reject) => {
      if (this.recognition) {
        reject(new Error("SpeechRecognizer already started"));
        return;
      }

      const SpeechRecognitionCtor = (window as any).SpeechRecognition ||
        (window as any).webkitSpeechRecognition;
      if (!SpeechRecognitionCtor) {
        reject(new Error("SpeechRecognition not supported in this browser"));
        return;
      }

      this.recognition = new SpeechRecognitionCtor();
      this.recognition.lang = this.lang;
      // We only want final results; interim results could be used for streaming later.
      this.recognition.interimResults = false;
      this.recognition.continuous = false;
      this.recognition.maxAlternatives = 1;

      this.recognition.onresult = (event: any) => {
        // event.results is a SpeechRecognitionResultList
        const transcript = event.results[0][0].transcript;
        this.transcriptParts.push(transcript);
      };

      this.recognition.onerror = (event: any) => {
        const msg = `SpeechRecognition error: ${event.error}`;
        if (this.rejectBlob) {
          this.rejectBlob(new Error(msg));
          this.resolveBlob = null;
          this.rejectBlob = null;
        } else {
          console.error(msg);
        }
      };

      this.recognition.onend = () => {
        // When end is fired automatically (e.g., no speech for a while) we treat as stop.
        // However we only resolve via stop() called by the consumer.
        // If onend occurs without stop being called, we still clean up.
        if (this.resolveBlob) {
          const fullText = this.transcriptParts.join(' ');
          const blob = new Blob([fullText], { type: 'text/plain' });
          this.transcriptParts.length = 0;
          this.resolveBlob(blob);
          this.resolveBlob = null;
          this.rejectBlob = null;
        }
        // Clean up recognition object to allow garbage collection
        this.recognition = null;
      };

      try {
        this.recognition.start();
        resolve();
      } catch (err) {
        reject(
          err instanceof Error
            ? err
            : new Error("Failed to start SpeechRecognition")
        );
      }
    });
  }

  /**
   * Stops recognition and returns a Blob with the accumulated transcription.
   * @returns Promise that resolves with the text Blob.
   */
  public stop(): Promise<Blob> {
    return new Promise((resolve, reject) => {
      if (!this.recognition) {
        reject(new Error("SpeechRecognizer not started"));
        return;
      }
      this.resolveBlob = resolve;
      this.rejectBlob = reject;
      try {
        this.recognition.stop();
      } catch (err) {
        reject(
          err instanceof Error
            ? err
            : new Error("Failed to stop SpeechRecognition")
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
    if (this.recognition) {
      try {
        this.recognition.stop();
      } catch {
        // ignore
      }
      this.recognition = null;
    }
    this.transcriptParts.length = 0;
    this.resolveBlob = null;
    this.rejectBlob = null;
  }
}