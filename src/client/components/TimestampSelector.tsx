import type { TimestampGranularity } from "@/client/lib/client-transcriber";


interface TimestampSelectorProps {
    timestampGranularity: TimestampGranularity;
    setTimestampGranularity: (timestampGranularity: TimestampGranularity) => void;
    isProcessing: boolean;
    availableGranularities: TimestampGranularity[];
}

const GRANULARITY_ACTIVE_CLASS = "bg-primary/10 border-primary/30 text-primary";
const GRANULARITY_INACTIVE_CLASS = "bg-surface-container-lowest text-on-surface-variant hover:text-on-surface hover:bg-surface-container";

export function TimestampSelector({ timestampGranularity, setTimestampGranularity, isProcessing, availableGranularities }: TimestampSelectorProps) {


    return (
        <div className="space-y-2">
            <label className="text-xs font-medium text-on-surface-variant uppercase tracking-wider">
                Timestamp Granularity
            </label>
            <div className="grid grid-cols-2 gap-2">


                {
                    availableGranularities.map((granularity) => {
                        return (
                            <button
                                key={granularity}
                                onClick={() => setTimestampGranularity(granularity)}
                                disabled={isProcessing}
                                className={`py-3 px-4 rounded-xl text-xs font-semibold transition-all border disabled:opacity-50 disabled:cursor-not-allowed ${timestampGranularity === granularity ? GRANULARITY_ACTIVE_CLASS : GRANULARITY_INACTIVE_CLASS}`}
                            >
                                <span className="material-symbols-outlined text-base block mb-1">text_fields</span>
                                {granularity}
                            </button>

                        )
                    })
                }


            </div>
        </div>


    );
}