"use client";

interface ConfirmCheckboxProps {
  id: string;
  label: string;
  checked: boolean;
  error?: string;
  disabled?: boolean;
  onChange: (checked: boolean) => void;
}

export default function ConfirmCheckbox({
  id,
  label,
  checked,
  error,
  disabled,
  onChange,
}: ConfirmCheckboxProps) {
  return (
    <div className="w-full">
      <label
        htmlFor={id}
        className={`
          flex items-start gap-3 p-4 rounded-xl cursor-pointer select-none
          bg-slate-800/60 border transition-all duration-200
          ${
            error
              ? "border-red-400 bg-red-500/10"
              : checked
              ? "border-rizz-primary bg-rizz-primary/10"
              : "border-slate-600 hover:border-slate-500"
          }
          ${disabled ? "opacity-60 cursor-not-allowed" : ""}
        `}
      >
        <div className="flex-shrink-0 mt-0.5">
          <div
            className={`
              w-5 h-5 rounded-md flex items-center justify-center border-2 transition-all
              ${
                checked
                  ? "bg-gradient-to-br from-rizz-primary to-rizz-secondary border-transparent"
                  : "bg-slate-700 border-slate-500"
              }
            `}
          >
            {checked && (
              <svg
                className="w-3.5 h-3.5 text-white"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={3.5}
                  d="M5 13l4 4L19 7"
                />
              </svg>
            )}
          </div>
          <input
            id={id}
            type="checkbox"
            className="sr-only"
            checked={checked}
            disabled={disabled}
            onChange={(e) => onChange(e.target.checked)}
          />
        </div>
        <span className="text-sm text-gray-200 leading-relaxed">{label}</span>
      </label>
      {error && (
        <p className="mt-1.5 text-sm text-red-400 flex items-center gap-1">
          <svg
            className="w-4 h-4 flex-shrink-0"
            fill="currentColor"
            viewBox="0 0 20 20"
          >
            <path
              fillRule="evenodd"
              d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7 4a1 1 0 11-2 0 1 1 0 012 0zm-1-9a1 1 0 00-1 1v4a1 1 0 102 0V6a1 1 0 00-1-1z"
              clipRule="evenodd"
            />
          </svg>
          {error}
        </p>
      )}
    </div>
  );
}
