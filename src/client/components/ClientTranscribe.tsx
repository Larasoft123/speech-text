"use client";

import { TranscriptionColumn } from "@/client/components/TranscriptionColumn";
import { GenerationColumn } from "@/client/components/GenerationColumn";





export function ClientTranscribe() {

  return (
    <>
      <div className="relative pt-32 bg-surface flex flex-col">


        {/* Main content - Side by side columns */}
        <main className="flex-1 grid grid-cols-1 lg:grid-cols-2 gap-8 p-8">
          {/* Left column: Transcription */}
          <TranscriptionColumn />

          {/* Right column: Audio Generation */}
          <GenerationColumn />
        </main>
      </div>
    </>
  );
}