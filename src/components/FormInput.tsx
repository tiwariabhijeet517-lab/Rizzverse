"use client";

import { InputHTMLAttributes, forwardRef } from "react";

interface FormInputProps extends InputHTMLAttributes<HTMLInputElement> {
  label: string;
  error?: string;
}

const FormInput = forwardRef<HTMLInputElement, FormInputProps>(
  ({ label, error, id, className = "", ...rest }, ref) => {
    return (
      <div className="w-full">
        <label
          htmlFor={id}
          className="block text-sm font-semibold text-gray-200 mb-1.5"
        >
          {label} <span className="text-rizz-secondary">*</span>
        </label>
        <input
          ref={ref}
          id={id}
          className={`
            w-full px-4 py-3 rounded-xl
            bg-slate-800/60 border border-slate-600
            text-white placeholder-slate-400
            focus:outline-none focus:ring-2 focus:ring-rizz-primary focus:border-transparent
            transition-all duration-200
            ${error ? "border-red-400 focus:ring-red-400 bg-red-500/10" : ""}
            ${className}
          `}
          {...rest}
        />
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

FormInput.displayName = "FormInput";

export default FormInput;
