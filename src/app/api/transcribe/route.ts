import { NextResponse } from "next/server";
import { prepareAudioForWhisper } from "@/lib/audio-utils";
import { transcribeAudio, type TranscriptionOptions } from "@/lib/transcriber";

export async function POST(request: Request) {
  try {
    const formData = await request.formData();
    const audioFile = formData.get("audio");
    const optionsJson = formData.get("options");

    if (!audioFile || !(audioFile instanceof File)) {
      return NextResponse.json(
        { error: "Missing 'audio' field. Send a file via multipart/form-data." },
        { status: 400 },
      );
    }

    const arrayBuffer = await audioFile.arrayBuffer();

    if (arrayBuffer.byteLength === 0) {
      return NextResponse.json(
        { error: "Audio file is empty." },
        { status: 400 },
      );
    }

    // Parse optional transcription options
    let options: TranscriptionOptions = {};
    if (optionsJson && typeof optionsJson === "string") {
      try {
        options = JSON.parse(optionsJson);
      } catch {
        return NextResponse.json(
          { error: "Invalid 'options' JSON." },
          { status: 400 },
        );
      }
    }

    const fileName = audioFile.name || "audio.wav";
    const pcm16k = await prepareAudioForWhisper(arrayBuffer, fileName);
    const result = await transcribeAudio(pcm16k, options);

    return NextResponse.json(result);
  } catch (error) {
    console.error("[transcribe] Error:", error);

    const message = error instanceof Error ? error.message : "Unknown error";

    if (
      message.includes("ffmpeg") ||
      message.includes("Invalid data") ||
      message.includes("Unsupported")
    ) {
      return NextResponse.json(
        { error: `Unsupported audio format: ${message}` },
        { status: 415 },
      );
    }

    return NextResponse.json(
      { error: `Transcription failed: ${message}` },
      { status: 500 },
    );
  }
}
