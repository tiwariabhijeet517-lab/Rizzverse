"use client";

import { ButtonHTMLAttributes, forwardRef } from "react";

interface SubmitButtonProps extends ButtonHTMLAttributes<HTMLButtonElement> {
  isLoading?: boolean;
}

const SubmitButton = forwardRef<HTMLButtonElement, SubmitButtonProps>(
  ({ isLoading = false, children, className = "", disabled, ...rest }, ref) => {
    return (
      <button
        ref={ref}
        disabled={disabled || isLoading}
        className={`
          w-full py-3.5 px-6 rounded-xl font-bold text-lg
          bg-gradient-to-r from-rizz-primary via-rizz-accent to-rizz-secondary
          text-white shadow-lg shadow-rizz-primary/30
          hover:shadow-xl hover:shadow-rizz-primary/40 hover:scale-[1.02]
          active:scale-[0.98]
          focus:outline-none focus:ring-4 focus:ring-rizz-primary/30
          disabled:opacity-70 disabled:cursor-not-allowed disabled:hover:scale-100
          transition-all duration-200
          flex items-center justify-center gap-2
          ${className}
        `}
        {...rest}
      >
        {isLoading && (
          <svg
            className="animate-spin h-5 w-5 text-white"
            xmlns="http://www.w3.org/2000/svg"
            fill="none"
            viewBox="0 0 24 24"
          >
            <circle
              className="opacity-25"
              cx="12"
              cy="12"
              r="10"
              stroke="currentColor"
              strokeWidth="4"
            ></circle>
            <path
              className="opacity-75"
              fill="currentColor"
              d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
            ></path>
          </svg>
        )}
        {children}
      </button>
    );
  }
);

SubmitButton.displayName = "SubmitButton";

export default SubmitButton;
