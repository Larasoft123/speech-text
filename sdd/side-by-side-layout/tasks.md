# Tasks: Side-by-Side UI for Client-Transcribe

## Phase 1: Hook Infrastructure

- [x] 1.1 Add `autoInit: boolean = false` parameter to `useTranscription` in `src/client/hooks/useTranscription.ts`
- [x] 1.2 Implement `initWorker()` function inside `useTranscription` that creates and initializes worker
- [x] 1.3 Modify worker creation useEffect to run only when `autoInit` is true
- [x] 1.4 Add `initWorker` to hook return values
- [x] 1.5 Repeat steps 1.1-1.4 for `useAudioGeneration` in `src/client/hooks/useAudioGeneration.ts`
- [x] 1.6 Create `StatusIndicator` component in `src/client/components/StatusIndicator.tsx` with state/progress props

## Phase 2: Column Components

- [x] 2.1 Create `TranscriptionColumn` component in `src/client/components/TranscriptionColumn.tsx`
- [x] 2.2 Implement first interaction detection (click, focus, keydown) with `onFirstInteraction` callback
- [x] 2.3 Integrate `useTranscription` with `autoInit=false` and call `initWorker` on first interaction
- [x] 2.4 Add status indicator showing model loading/ready state
- [x] 2.5 Create `GenerationColumn` component in `src/client/components/GenerationColumn.tsx` with same pattern
- [x] 2.6 Implement error boundary for each column to isolate failures

## Phase 3: Layout Restructuring

- [x] 3.1 Remove tab state (`activeTab`, `setActiveTab`) from `ClientTranscribe.tsx`
- [x] 3.2 Remove tab buttons and tab container from JSX
- [x] 3.3 Replace main content area with CSS Grid: `grid grid-cols-1 lg:grid-cols-2 gap-8`
- [x] 3.4 Render `TranscriptionColumn` and `GenerationColumn` side by side
- [x] 3.5 Update header to show both icons/titles (no longer tab-dependent)
- [x] 3.6 Remove `isTranscribeTab` conditional logic

## Phase 4: Card Simplification

- [x] 4.1 Compress info card in `TranscriptionColumn` to single line with collapsible details
- [x] 4.2 Simplify settings card layout: horizontal arrangement for model/language/timestamp selectors
- [x] 4.3 Reduce padding/margins in recording card for compact 50% width
- [x] 4.4 Adapt `AudioGeneratorPanel` for narrower width: stack settings vertically if needed
- [x] 4.5 Ensure all buttons remain accessible at smaller sizes

## Phase 5: Integration & Polish

- [x] 5.1 Add debounced interaction handler (500ms) to prevent simultaneous model loading
- [x] 5.2 Implement proper worker cleanup in column component unmount
- [x] 5.3 Add loading skeleton while workers initialize
- [ ] 5.4 Test responsive behavior at mobile (<1024px) and desktop breakpoints
- [ ] 5.5 Verify all existing recording/upload/generation flows work unchanged
- [x] 5.6 Add feature flag `ENABLE_SIDE_BY_SIDE_UI` for gradual rollout

## Phase 6: Testing (Skipped - No Testing Framework)

*Note: Project lacks testing framework (Jest, Vitest, etc.). Tests should be added when framework is set up.*

- [ ] 6.1 Write unit tests for `useTranscription` with `autoInit` parameter
- [ ] 6.2 Write unit tests for `useAudioGeneration` with `autoInit` parameter
- [ ] 6.3 Write integration tests for column components interaction detection
- [ ] 6.4 Write E2E test: record audio in left column, verify transcription appears
- [ ] 6.5 Write E2E test: generate audio in right column, verify playback works
- [ ] 6.6 Write test for mobile layout stacking

## Phase 7: Cleanup

- [x] 7.1 Remove unused tab-related CSS classes (`TAB_ACTIVE_CLASS`, `TAB_INACTIVE_CLASS`)
- [x] 7.2 Remove tab button click handlers
- [x] 7.3 Update any references to tab state in comments
- [x] 7.4 Add documentation for new lazy loading behavior in code comments
- [ ] 7.5 Optional: Add "sync" button to copy transcription to generation textarea (pending decision)