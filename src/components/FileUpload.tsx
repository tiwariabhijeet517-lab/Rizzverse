"use client";

import { useRef, ChangeEvent } from "react";
import {
  MAX_FILE_SIZE_BYTES,
  ACCEPTED_FILE_TYPES,
  ACCEPTED_FILE_ATTR,
} from "@/types/registration";

interface FileUploadProps {
  label: string;
  file: File | null;
  error?: string;
  disabled?: boolean;
  onFileChange: (file: File | null) => void;
}

function formatFileSize(bytes: number): string {
  if (bytes < 1024) return bytes + " B";
  if (bytes < 1024 * 1024) return (bytes / 1024).toFixed(1) + " KB";
  return (bytes / (1024 * 1024)).toFixed(2) + " MB";
}

function humanizeAcceptedTypes(): string {
  return "JPG, JPEG, PNG, PDF";
}

export default function FileUpload({
  label,
  file,
  error,
  disabled,
  onFileChange,
}: FileUploadProps) {
  const inputRef = useRef<HTMLInputElement>(null);

  const handleSelect = () => {
    if (!disabled) inputRef.current?.click();
  };

  const handleDrop = (e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    if (disabled) return;
    if (e.dataTransfer.files && e.dataTransfer.files.length > 0) {
      validateAndSet(e.dataTransfer.files[0]);
    }
  };

  const handleDragOver = (e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
  };

  const validateAndSet = (candidate: File) => {
    if (!ACCEPTED_FILE_TYPES.includes(candidate.type)) {
      onFileChange(candidate);
      return;
    }
    if (candidate.size > MAX_FILE_SIZE_BYTES) {
      onFileChange(candidate);
      return;
    }
    onFileChange(candidate);
  };

  const handleChange = (e: ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files.length > 0) {
      validateAndSet(e.target.files[0]);
    }
  };

  const handleRemove = (e: React.MouseEvent) => {
    e.stopPropagation();
    onFileChange(null);
    if (inputRef.current) inputRef.current.value = "";
  };

  return (
    <div className="w-full">
      <label className="block text-sm font-semibold text-gray-200 mb-1.5">
        {label} <span className="text-rizz-secondary">*</span>
      </label>

      <div
        onClick={handleSelect}
        onDrop={handleDrop}
        onDragOver={handleDragOver}
        role="button"
        tabIndex={disabled ? -1 : 0}
        aria-disabled={disabled}
        className={`
          w-full px-4 py-5 rounded-xl cursor-pointer select-none
          border-2 border-dashed transition-all duration-200
          bg-slate-800/40
          ${
            error
              ? "border-red-400 bg-red-500/10"
              : file
              ? "border-rizz-primary/60 bg-rizz-primary/10"
              : "border-slate-600 hover:border-rizz-primary hover:bg-slate-800/70"
          }
          ${disabled ? "opacity-60 cursor-not-allowed" : ""}
        `}
      >
        <input
          ref={inputRef}
          type="file"
          accept={ACCEPTED_FILE_ATTR}
          className="hidden"
          onChange={handleChange}
          disabled={disabled}
        />

        {!file ? (
          <div className="flex flex-col items-center justify-center text-center gap-2 py-2">
            <svg
              className="w-10 h-10 text-slate-400"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={1.8}
                d="M7 16a4 4 0 01-.88-7.9 5 5 0 019.9-1A5.5 5.5 0 0118 17H7z"
              />
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={1.8}
                d="M12 11v6m-3-3l3-3 3 3"
              />
            </svg>
            <p className="text-sm text-gray-300 font-medium">
              Click to upload or drag and drop
            </p>
            <p className="text-xs text-gray-500">
              {humanizeAcceptedTypes()} · Max {formatFileSize(MAX_FILE_SIZE_BYTES)}
            </p>
          </div>
        ) : (
          <div className="flex items-center justify-between gap-3">
            <div className="flex items-center gap-3 min-w-0 flex-1">
              <div className="w-11 h-11 flex-shrink-0 rounded-lg bg-slate-700/70 flex items-center justify-center">
                <svg
                  className="w-6 h-6 text-rizz-secondary"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={1.8}
                    d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"
                  />
                </svg>
              </div>
              <div className="min-w-0 flex-1">
                <p className="text-sm font-semibold text-white truncate">
                  {file.name}
                </p>
                <p className="text-xs text-gray-400">
                  {formatFileSize(file.size)}
                </p>
              </div>
            </div>
            <button
              type="button"
              onClick={handleRemove}
              disabled={disabled}
              className="flex-shrink-0 px-3 py-1.5 rounded-lg text-xs font-semibold text-red-400 bg-red-500/10 hover:bg-red-500/20 border border-red-500/30 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
            >
              Remove
            </button>
          </div>
        )}
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
