import type { FileProgress } from "@/lib/types";


export function Progress({ file, progress }: FileProgress) {

    return (
        <div className="space-y-1" >
            <div className="flex justify-between text-xs text-outline">
                <span className="truncate max-w-xs">{file}</span>
                <span>{progress.toFixed(1)}%</span>
            </div>
            <div className="w-full bg-surface-container-lowest h-1 rounded-full overflow-hidden">
                <div
                    className="h-full bg-gradient-to-r from-secondary to-primary rounded-full transition-all duration-300"
                    style={{ width: `${progress}%` }}
                />
            </div>
        </div >

    )

}