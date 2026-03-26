# Exploration: Side-by-Side Layout for Client-Transcribe

## Current State

The `client-transcribe` page uses a tab-based UI with two tabs: "transcribe" and "generate". Only one panel is visible at a time. Both panels use Web Workers created immediately on component mount, loading ML models (~150MB each) simultaneously.

### Key Files:
- `src/client/components/ClientTranscribe.tsx` — Main component with tab state
- `src/client/components/TranscriptionDisplay.tsx` — Transcription results display
- `src/client/components/AudioGeneratorPanel.tsx` — Audio generation panel
- `src/client/hooks/useTranscription.ts` — Whisper worker hook
- `src/client/hooks/useAudioGeneration.ts` — TTS worker hook

## Affected Areas

- **UI Structure**: Remove tab switching, implement grid layout
- **Worker Initialization**: Change from immediate to lazy loading
- **Card Layout**: Simplify info/settings cards for 50% width
- **Responsive Design**: Mobile stacking vs desktop side-by-side
- **State Management**: Add per-column status indicators

## Approaches

### 1. Interaction-based Lazy Loading
**Description**: Load worker only when user interacts with column (clicks, focuses, types).
- **Pros**: Simple implementation, predictable loading, no unnecessary loading
- **Cons**: Slight delay on first interaction, but acceptable given model size
- **Effort**: Low

### 2. Staggered Loading
**Description**: Load both workers but with 1-second delay between them.
- **Pros**: Reduces simultaneous memory spike, both features eventually ready
- **Cons**: Still loads both models on page load, not truly lazy
- **Effort**: Low

### 3. Visibility-based Lazy Loading
**Description**: Use Intersection Observer to load workers only when column enters viewport.
- **Pros**: Saves memory on initial load, optimal for users who only use one feature
- **Cons**: Adds complexity, both columns always visible in 50/50 layout
- **Effort**: Medium

## Recommendation

**Approach 1 (Interaction-based)** — Load worker when user first interacts with column.

### Rationale:
1. **Performance**: Only loads what's needed when needed
2. **User Experience**: No delay when user focuses on a column
3. **Mobile-friendly**: Works well with vertical stacking
4. **Scalable**: Easy to extend to more columns if needed

## Implementation Plan

### Phase 1: Layout Restructuring
1. Create `TranscriptionColumn` and `GenerationColumn` components
2. Replace tab logic with CSS grid (`grid-cols-1 lg:grid-cols-2`)
3. Simplify info/settings cards (compact layout)
4. Add per-column status indicators

### Phase 2: Lazy Loading
1. Create custom hook `useLazyWorker` with Intersection Observer
2. Modify `useTranscription` and `useAudioGeneration` to accept lazy option
3. Add loading placeholders while workers initialize

### Phase 3: Responsive Polish
1. Mobile: Stack columns, maintain full functionality
2. Tablet: Consider 60/40 split
3. Desktop: 50/50 with proper spacing

## Risks

1. **Complexity**: Lazy loading adds boilerplate
2. **Race Conditions**: Both columns might try to load simultaneously on fast scroll
3. **Memory Management**: Need to properly dispose workers when columns unmount
4. **Backwards Compatibility**: Existing tests might break

## Ready for Proposal

Yes — the approach is clear and feasible. Next step would be to create a detailed technical design with implementation tasks.