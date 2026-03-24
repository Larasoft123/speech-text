import { useState  } from "react";

export interface UseStreamingResult {
  /** El texto que se está acumulando en vivo */
  streamingText: string;
  /** Indica si se está recibiendo activamente un stream */
  isStreaming: boolean;
  /** Añade un nuevo fragmento (token) al stream activo */
  appendChunk: (text: string) => void;
  /** Inicia una nueva sesión de stream, borrando lo anterior */
  startStream: () => void;
  /** Termina la sesión de stream activa y devuelve opcionalmente el texto final acumulado */
  stopStream: () => string;
  /** Limpia el estado de streaming completamente */
  clearStream: () => void;
}

/**
 * Hook reutilizable para gestionar el estado de un stream de texto en tiempo real
 * útil para IA conversacional, ASR en vivo (Whisper Streaming), TTS y LLMs.
 */
export function useStreaming(): UseStreamingResult {
  const [streamingText, setStreamingText] = useState("");
  const [isStreaming, setIsStreaming] = useState(false);

  const startStream = () => {
    setStreamingText("");
    setIsStreaming(true);
  };

  const appendChunk = (text: string) => {
    setStreamingText((prev) => prev + text);
  };

  const stopStream = () => {
    setIsStreaming(false);
    return streamingText; 
  };

  const clearStream = () => {
    setStreamingText("");
    setIsStreaming(false);
  };

  return {
    streamingText,
    isStreaming,
    appendChunk,
    startStream,
    stopStream,
    clearStream,
  };
}
