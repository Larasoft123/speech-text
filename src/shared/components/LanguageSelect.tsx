import { LANGUAGES } from "@/lib/types";

type LanguageCode = keyof typeof LANGUAGES;

interface LanguageSelectProps {
  languages: LanguageCode[];
  value: LanguageCode;
  onChange: (language: LanguageCode) => void;
  disabled?: boolean;
}

export function LanguageSelect({ languages, value, onChange, disabled }: LanguageSelectProps) {
  const isSingleLanguage = languages.length <= 1;

  return (
    <div className="space-y-2">
      <label className="text-xs font-medium text-on-surface-variant uppercase tracking-wider">
        Language
      </label>
      <div className="relative">
        <span className="material-symbols-outlined absolute left-3 top-1/2 -translate-y-1/2 text-base text-outline pointer-events-none">
          translate
        </span>
        <select
          value={value}
          onChange={(e) => onChange(e.target.value as LanguageCode)}
          disabled={disabled || isSingleLanguage}
          className={`w-full pl-10 pr-4 py-3 bg-surface-container-lowest rounded-xl text-sm text-on-surface appearance-none focus:outline-none focus:ring-2 focus:ring-primary/30 hover:bg-surface-container transition-colors disabled:opacity-50 disabled:cursor-not-allowed ${isSingleLanguage ? "cursor-default" : "cursor-pointer"}`}
        >
          {languages.map((code) => (
            <option key={code} value={code}>
              {LANGUAGES[code]}
            </option>
          ))}
        </select>
        {isSingleLanguage && (
          <span className="absolute right-3 top-1/2 -translate-y-1/2 text-[10px] text-outline-variant uppercase tracking-wider pointer-events-none">
            Only
          </span>
        )}
      </div>
    </div>
  );
}

export type { LanguageCode };
