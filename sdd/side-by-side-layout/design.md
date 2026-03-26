# Design: Side-by-Side UI for Client-Transcribe

## Technical Approach

Transform the tab-based interface into a responsive CSS Grid layout with two columns. Implement interaction-based lazy loading for Web Workers to defer ML model initialization until first user interaction. Simplify card layouts for 50% width display while preserving all functionality.

## Architecture Decisions

### Decision: Lazy Loading Strategy

**Choice**: Interaction-based lazy loading with `autoInit` parameter
**Alternatives considered**: 
- Immediate loading (current) - loads both models simultaneously
- Visibility-based (Intersection Observer) - both columns always visible, unnecessary complexity
- Staggered loading - still loads both models on page load
**Rationale**: User interaction provides clear intent signal, minimal code complexity, optimal memory usage for users who only use one feature.

### Decision: Component Architecture

**Choice**: Extract `TranscriptionColumn` and `GenerationColumn` wrapper components
**Alternatives considered**: 
- Keep everything in `ClientTranscribe.tsx` - would exceed 500 lines
- Single `SideBySidePanel` component - less reusable
**Rationale**: Separate concerns, each column manages its own state and loading indicator, easier to test.

### Decision: Responsive Breakpoints

**Choice**: Mobile-first with `lg:grid-cols-2` at 1024px+
**Alternatives considered**: 
- Custom breakpoints - unnecessary complexity
- Tablet-specific layout (60/40) - deferred as out of scope
**Rationale**: Follows Tailwind defaults, simple mental model, works for most use cases.

## Data Flow

```
┌─────────────────────────────────────────────────────────┐
│                ClientTranscribe Page                    │
├─────────────────────────────────────────────────────────┤
│                                                         │
│  ┌──────────────────────┐  ┌──────────────────────┐   │
│  │  TranscriptionColumn │  │   GenerationColumn   │   │
│  │  • autoInit: false   │  │  • autoInit: false   │   │
│  │  • onInteraction()   │  │  • onInteraction()   │   │
│  └──────────┬───────────┘  └──────────┬───────────┘   │
│             │                         │                │
│             ▼                         ▼                │
│  ┌──────────────────────┐  ┌──────────────────────┐   │
│  │  useTranscription    │  │  useAudioGeneration  │   │
│  │  • initWorker()      │  │  • initWorker()      │   │
│  │  • state management  │  │  • state management  │   │
│  └──────────────────────┘  └──────────────────────┘   │
└─────────────────────────────────────────────────────────┘
```

## File Changes

| File | Action | Description |
|------|--------|-------------|
| `src/client/components/ClientTranscribe.tsx` | Modify | Replace tabs with grid layout, remove tab state, add column wrappers |
| `src/client/hooks/useTranscription.ts` | Modify | Add `autoInit` parameter (default false), defer worker creation until `initWorker()` called |
| `src/client/hooks/useAudioGeneration.ts` | Modify | Add `autoInit` parameter (default false), defer worker creation until `initWorker()` called |
| `src/client/components/TranscriptionColumn.tsx` | Create | Wrapper component with status indicator, handles first interaction |
| `src/client/components/GenerationColumn.tsx` | Create | Wrapper component with status indicator, handles first interaction |
| `src/client/components/TranscriptionDisplay.tsx` | Modify | Minor adaptations for compact layout if needed |

## Interfaces / Contracts

### New Hook Parameters

```typescript
// useTranscription.ts
export function useTranscription(
  model: WhisperModel,
  granularity: TimestampGranularity,
  language: string = "en",
  autoInit: boolean = false  // NEW: if false, worker created on demand
) {
  // Returns new function to manually initialize
  const initWorker = () => {
    if (!workerRef.current) {
      // Create and initialize worker
    }
  };
  
  return {
    // ... existing returns
    initWorker,  // NEW: call on first interaction
  };
}

// useAudioGeneration.ts
export function useAudioGeneration(
  initialModel?: AudioGeneratorModel,
  autoInit: boolean = false  // NEW
) {
  // Same pattern as useTranscription
}
```

### Column Component Interface

```typescript
interface ColumnProps {
  title: string;
  icon: string;
  accentColor: 'primary' | 'secondary';
  onFirstInteraction: () => void;
  children: React.ReactNode;
}

interface StatusIndicatorProps {
  state: 'idle' | 'loading' | 'ready' | 'processing' | 'error';
  model?: string;
  device?: 'webgpu' | 'wasm';
  progress?: number;
}
```

## Testing Strategy

| Layer | What to Test | Approach |
|-------|-------------|----------|
| Unit | Hook `autoInit` parameter | Mock worker, verify initialization deferred |
| Unit | Column component interaction detection | Simulate click/focus, verify `onFirstInteraction` called |
| Integration | Grid layout responsive behavior | Test at different viewport sizes |
| Integration | Worker lifecycle management | Verify proper cleanup on unmount |
| E2E | Complete transcription flow in side-by-side | Record audio, verify transcription appears |
| E2E | Complete generation flow in side-by-side | Generate audio, verify playback works |

## Migration / Rollout

**No migration required** - This is a UI-only change with no data or API changes.

**Rollout Plan**:
1. Feature flag: `ENABLE_SIDE_BY_SIDE_UI` (default: false)
2. Gradual rollout to percentage of users
3. Monitor performance metrics (memory usage, initialization time)
4. Full rollout after validation

## Open Questions

- [ ] Should we add a "sync" button to copy transcription to generation textarea?
- [ ] How to handle error recovery if one worker fails but other succeeds?
- [ ] Should we persist column preferences (which was last used) to localStorage?