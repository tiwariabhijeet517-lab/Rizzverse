"use client";

import { SelectHTMLAttributes, forwardRef } from "react";

interface FormSelectProps extends SelectHTMLAttributes<HTMLSelectElement> {
  label: string;
  error?: string;
  options: { value: string; label: string }[];
}

const FormSelect = forwardRef<HTMLSelectElement, FormSelectProps>(
  ({ label, error, id, options, className = "", ...rest }, ref) => {
    return (
      <div className="w-full">
        <label
          htmlFor={id}
          className="block text-sm font-semibold text-gray-200 mb-1.5"
        >
          {label} <span className="text-rizz-secondary">*</span>
        </label>
        <div className="relative">
          <select
            ref={ref}
            id={id}
            className={`
              w-full px-4 py-3 rounded-xl appearance-none pr-10
              bg-slate-800/60 border border-slate-600
              text-white
              focus:outline-none focus:ring-2 focus:ring-rizz-primary focus:border-transparent
              transition-all duration-200
              ${error ? "border-red-400 focus:ring-red-400 bg-red-500/10" : ""}
              ${className}
            `}
            {...rest}
          >
            <option value="" className="bg-slate-800">
              -- Select an option --
            </option>
            {options.map((opt) => (
              <option key={opt.value} value={opt.value} className="bg-slate-800">
                {opt.label}
              </option>
            ))}
          </select>
          <svg
            className="absolute right-3 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-400 pointer-events-none"
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M19 9l-7 7-7-7"
            />
          </svg>
        </div>
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
);

FormSelect.displayName = "FormSelect";

export default FormSelect;
