# Proposal: Side-by-Side UI for Client-Transcribe

## Intent

Replace tab-based UI with simultaneous side-by-side display of transcription and audio generation panels. This allows users to work with both features without context switching, improving workflow efficiency for power users while maintaining simplicity for beginners.

## Scope

### In Scope
- Layout restructuring from tabs to 50/50 grid (desktop) with mobile stacking
- Lazy loading of ML models (Whisper/TTS) triggered by first user interaction per column
- Simplified card designs for each column (compact info/settings cards)
- Per-column status indicators (model loading, ready, processing, error)
- Responsive design with mobile-first approach
- Maintain all existing functionality

### Out of Scope
- Changing underlying ML model behavior or performance
- Adding new transcription/generation features
- Modifying design system tokens or global styling
- Desktop-only optimizations (mobile experience is priority)

## Approach

1. **Layout Restructuring**: Replace tab logic with CSS Grid (`grid-cols-1 lg:grid-cols-2`)
2. **Lazy Loading**: Modify `useTranscription` and `useAudioGeneration` hooks to accept `autoInit` parameter (default false). Initialize worker only when user first interacts with column (click, focus, typing).
3. **Card Simplification**: Compress info/settings cards using horizontal layouts and smaller typography
4. **State Management**: Add column-specific loading states and indicators
5. **Responsive Design**: Ensure mobile stacking maintains full functionality

## Affected Areas

| Area | Impact | Description |
|------|--------|-------------|
| `src/client/components/ClientTranscribe.tsx` | Modified | Remove tabs, add grid layout, integrate lazy loading |
| `src/client/hooks/useTranscription.ts` | Modified | Add `autoInit` parameter, defer worker creation |
| `src/client/hooks/useAudioGeneration.ts` | Modified | Add `autoInit` parameter, defer worker creation |
| `src/client/components/TranscriptionDisplay.tsx` | Modified | Potentially simplify for compact layout |
| `src/client/components/AudioGeneratorPanel.tsx` | Modified | Adapt for 50% width, add interaction trigger |
| New: `src/client/components/TranscriptionColumn.tsx` | Created | Wrapper for transcription panel with status indicators |
| New: `src/client/components/GenerationColumn.tsx` | Created | Wrapper for audio generation panel with status indicators |

## Risks

| Risk | Likelihood | Mitigation |
|------|------------|------------|
| Both models load simultaneously on fast interaction | Medium | Add slight debounce (500ms) between column activations |
| Mobile layout feels cramped | High | Thorough mobile testing, consider collapsible sections |
| Workers not properly disposed on unmount | Low | Add cleanup in useEffect return |
| Existing functionality breaks | Medium | Comprehensive testing of all recording/generation flows |

## Rollback Plan

1. Revert to previous commit: `git revert --no-commit HEAD`
2. Restore tab-based layout by reverting changes to `ClientTranscribe.tsx`
3. Revert hook changes to restore immediate worker initialization
4. Run existing tests to verify functionality

## Dependencies

- No external dependencies
- Requires React 18+ (already in use)
- Requires modern browser with Web Worker support

## Success Criteria

- [ ] Both panels visible simultaneously on desktop (50/50 split)
- [ ] Mobile layout stacks vertically with full functionality
- [ ] Transcription worker loads only when user interacts with left column
- [ ] Audio generation worker loads only when user interacts with right column
- [ ] All existing recording/upload/generation flows work unchanged
- [ ] Performance: No degradation in initial page load time
- [ ] User testing: Positive feedback from power users