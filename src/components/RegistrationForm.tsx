"use client";

import Image from "next/image";
import { useState, FormEvent } from "react";
import Link from "next/link";
import FormInput from "@/components/FormInput";
import FormSelect from "@/components/FormSelect";
import SubmitButton from "@/components/SubmitButton";
import { validateRegistrationForm } from "@/lib/validateRegistration";
import type {
  RegistrationFormData,
  FormErrors,
} from "@/types/registration";
import {
  DEPARTMENTS,
  YEARS_OF_STUDY,
  ENTRY_FEE,
} from "@/types/registration";

function formatINR(amount: number): string {
  try {
    return new Intl.NumberFormat("en-IN", {
      style: "currency",
      currency: "INR",
      maximumFractionDigits: 0,
    }).format(amount);
  } catch {
    return `₹${amount.toLocaleString("en-IN")}`;
  }
}

type Status = "idle" | "loading" | "success";

interface ApiResponseBody {
  ok: boolean;
  error?: string;
  errors?: FormErrors;
  registrationId?: string;
  message?: string;
}

export default function RegistrationForm() {
  const [formData, setFormData] = useState<RegistrationFormData>({
    fullName: "",
    collegeEmail: "",
    mobileNumber: "",
    rollNumber: "",
    department: "",
    yearOfStudy: "",
    upiTransactionId: "",
  });

  const [errors, setErrors] = useState<FormErrors>({});
  const [status, setStatus] = useState<Status>("idle");
  const [submitError, setSubmitError] = useState<string | null>(null);

  const handleChange = <K extends keyof RegistrationFormData>(
    field: K,
    value: RegistrationFormData[K]
  ) => {
    setFormData((prev) => ({ ...prev, [field]: value }));
    const errorField = field as keyof FormErrors;
    if (errors[errorField]) {
      setErrors((prev) => ({ ...prev, [errorField]: undefined }));
    }
  };

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();

    const validationErrors = validateRegistrationForm(formData);
    if (Object.keys(validationErrors).length > 0) {
      setErrors(validationErrors);
      setSubmitError(null);
      setTimeout(() => {
        window.scrollTo({ top: 0, behavior: "smooth" });
      }, 50);
      return;
    }

    setErrors({});
    setSubmitError(null);
    setStatus("loading");

    try {
      const body = new FormData();
      body.append("fullName", formData.fullName);
      body.append("collegeEmail", formData.collegeEmail);
      body.append("mobileNumber", formData.mobileNumber);
      body.append("rollNumber", formData.rollNumber);
      body.append("department", formData.department);
      body.append("yearOfStudy", formData.yearOfStudy);
      body.append("upiTransactionId", formData.upiTransactionId);

      const res = await fetch("/api/register", {
        method: "POST",
        body,
      });

      let json: ApiResponseBody | null = null;
      try {
        json = (await res.json()) as ApiResponseBody;
      } catch {
        // Ignore parse errors; we'll check status
      }

      if (!res.ok) {
        if (json?.errors && Object.keys(json.errors).length > 0) {
          setErrors(json.errors);
        }
        const topLevelMessage =
          json?.error ??
          (res.status === 409
            ? "This email or roll number is already registered."
            : `Server error (${res.status}). Please try again in a moment.`);
        setSubmitError(topLevelMessage);
        setStatus("idle");
        setTimeout(() => {
          window.scrollTo({ top: 0, behavior: "smooth" });
        }, 50);
        return;
      }

      setStatus("success");
    } catch (networkErr) {
      console.error("Registration network error:", networkErr);
      setSubmitError(
        "Couldn't reach the server. Check your internet connection and try again."
      );
      setStatus("idle");
    }
  };

  if (status === "success") {
    return (
      <div className="w-full max-w-xl mx-auto bg-slate-900/70 backdrop-blur-md border border-slate-700 rounded-3xl p-8 md:p-10 shadow-2xl text-center space-y-6">
        <div className="w-20 h-20 mx-auto rounded-full bg-gradient-to-br from-rizz-primary via-rizz-accent to-rizz-secondary flex items-center justify-center shadow-lg shadow-rizz-primary/30">
          <svg
            className="w-10 h-10 text-white"
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2.5}
              d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z"
            />
          </svg>
        </div>
        <div className="space-y-2">
          <h2 className="text-3xl font-extrabold text-white">
            Registration Saved
          </h2>
          <p className="text-gray-300 text-lg">
            Thank you,{" "}
            <span className="font-bold text-rizz-secondary">
              {formData.fullName}
            </span>
            !
          </p>
          <p className="text-gray-400 text-sm">
            Your details and UTR number have been recorded successfully.
          </p>
        </div>

        <div className="rounded-2xl bg-emerald-500/10 border border-emerald-400/30 p-4 text-left">
          <div className="flex items-start gap-3">
            <svg
              className="w-6 h-6 text-emerald-400 flex-shrink-0 mt-0.5"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M5 13l4 4L19 7"
              />
            </svg>
            <div>
              <p className="font-bold text-emerald-300">
                You&apos;re all set!
              </p>
              <p className="text-sm text-emerald-200/80 mt-1">
                The organizers will review your registration. You will receive a
                confirmation on your college email.
              </p>
            </div>
          </div>
        </div>

        <div className="bg-slate-800/60 rounded-2xl p-5 text-left space-y-2 border border-slate-700">
          <p className="text-sm text-gray-400">
            <span className="font-semibold text-gray-300">Email:</span>{" "}
            {formData.collegeEmail}
          </p>
          <p className="text-sm text-gray-400">
            <span className="font-semibold text-gray-300">Roll No:</span>{" "}
            {formData.rollNumber}
          </p>
          <p className="text-sm text-gray-400">
            <span className="font-semibold text-gray-300">Department:</span>{" "}
            {formData.department}
          </p>
          <p className="text-sm text-gray-400">
            <span className="font-semibold text-gray-300">Year:</span>{" "}
            {formData.yearOfStudy}
          </p>
          <p className="text-sm text-gray-400">
            <span className="font-semibold text-gray-300">UTR:</span>{" "}
            <span className="font-mono">{formData.upiTransactionId}</span>
          </p>
        </div>

        <Link
          href="/"
          className="inline-block text-rizz-primary hover:text-rizz-secondary font-semibold underline underline-offset-4 transition-colors"
        >
          &larr; Back to Home
        </Link>
      </div>
    );
  }

  return (
    <div className="w-full max-w-xl mx-auto bg-slate-900/70 backdrop-blur-md border border-slate-700 rounded-3xl p-6 md:p-10 shadow-2xl">
      {submitError && (
        <div className="mb-6 rounded-2xl bg-red-500/10 border border-red-500/30 p-4">
          <div className="flex items-start gap-3">
            <svg
              className="w-5 h-5 text-red-400 flex-shrink-0 mt-0.5"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M12 9v2m0 4h.01M21 12a9 9 0 11-18 0 9 0 0118 0z"
              />
            </svg>
            <p className="text-sm text-red-300 leading-relaxed">{submitError}</p>
          </div>
        </div>
      )}

      <div className="text-center mb-8 space-y-2">
        <h2 className="text-3xl md:text-4xl font-extrabold bg-gradient-to-r from-rizz-primary via-rizz-accent to-rizz-secondary bg-clip-text text-transparent">
          Student Registration
        </h2>
        <p className="text-gray-300">
          Fill in your details and UTR number to register for RIZZVERSE&apos;26.
        </p>
      </div>

      <form onSubmit={handleSubmit} className="space-y-5" noValidate>
        <FormInput
          label="Full Name"
          id="fullName"
          type="text"
          placeholder="e.g. Aditya Sharma"
          value={formData.fullName}
          onChange={(e) => handleChange("fullName", e.target.value)}
          error={errors.fullName}
          autoComplete="name"
          disabled={status === "loading"}
        />

        <FormInput
          label="College Email ID"
          id="collegeEmail"
          type="email"
          placeholder="yourname@college.edu.in"
          value={formData.collegeEmail}
          onChange={(e) => handleChange("collegeEmail", e.target.value)}
          error={errors.collegeEmail}
          autoComplete="email"
          disabled={status === "loading"}
        />

        <FormInput
          label="Mobile Number"
          id="mobileNumber"
          type="tel"
          placeholder="10-digit mobile number"
          inputMode="numeric"
          maxLength={10}
          value={formData.mobileNumber}
          onChange={(e) =>
            handleChange(
              "mobileNumber",
              e.target.value.replace(/\D/g, "").slice(0, 10)
            )
          }
          error={errors.mobileNumber}
          autoComplete="tel"
          disabled={status === "loading"}
        />

        <FormInput
          label="Roll Number"
          id="rollNumber"
          type="text"
          placeholder="e.g. IT2026001"
          value={formData.rollNumber}
          onChange={(e) => handleChange("rollNumber", e.target.value)}
          error={errors.rollNumber}
          disabled={status === "loading"}
        />

        <FormSelect
          label="Department"
          id="department"
          value={formData.department}
          onChange={(e) =>
            handleChange(
              "department",
              e.target.value as RegistrationFormData["department"]
            )
          }
          error={errors.department}
          disabled={status === "loading"}
          options={DEPARTMENTS.map((dept) => ({ value: dept, label: dept }))}
        />

        <FormSelect
          label="Year of Study"
          id="yearOfStudy"
          value={formData.yearOfStudy}
          onChange={(e) =>
            handleChange(
              "yearOfStudy",
              e.target.value as RegistrationFormData["yearOfStudy"]
            )
          }
          error={errors.yearOfStudy}
          disabled={status === "loading"}
          options={YEARS_OF_STUDY.map((year) => ({ value: year, label: year }))}
        />

        <div className="rounded-2xl border-2 border-rizz-primary/30 bg-gradient-to-br from-rizz-primary/10 via-rizz-accent/5 to-rizz-secondary/10 p-5 md:p-6 space-y-4 shadow-inner">
          <div className="flex items-center justify-between gap-3">
            <div className="flex items-center gap-2.5">
              <svg
                className="w-6 h-6 text-rizz-secondary"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M12 4v1m6 11h2m-6 0h-2v4m0-11v3m0 0h.01M12 12h4.01M16 20h4M4 12h4m12 0h.01M5 8h2a1 1 0 001-1V5a1 1 0 00-1-1H5a1 1 0 00-1 1v2a1 1 0 001 1zm12 0h2a1 1 0 001-1V5a1 1 0 00-1-1h-2a1 1 0 00-1 1v2a1 1 0 001 1zM5 20h2a1 1 0 001-1v-2a1 1 0 00-1-1H5a1 1 0 00-1 1v2a1 1 0 001 1z"
                />
              </svg>
              <h3 className="text-xl font-extrabold text-white">
                Step 1 · Pay Registration Fee
              </h3>
            </div>
            <div className="text-right flex-shrink-0">
              <p className="text-xs uppercase tracking-wider text-gray-400 font-semibold">
                Entry Fee
              </p>
              <p className="text-2xl md:text-3xl font-extrabold bg-gradient-to-r from-rizz-primary via-rizz-accent to-rizz-secondary bg-clip-text text-transparent tabular-nums">
                {formatINR(ENTRY_FEE)}
              </p>
            </div>
          </div>

          <div className="flex flex-col items-center gap-3 py-2">
            <div className="relative w-full max-w-[240px] aspect-square rounded-2xl bg-white p-3 shadow-2xl shadow-black/40 ring-1 ring-slate-200 overflow-hidden">
              <Image
                src="/rizzverse-qr.png"
                alt="UPI QR code — scan to pay ₹1,200 registration fee"
                fill
                sizes="(max-width: 768px) 100vw, 240px"
                className="object-contain"
                priority
                unoptimized
              />
            </div>

            <p className="text-sm text-gray-300 text-center leading-relaxed">
              Scan the QR code with any UPI app (Google Pay, PhonePe, Paytm,
              BHIM, etc.) and pay{" "}
              <span className="font-bold text-rizz-secondary">
                {formatINR(ENTRY_FEE)}
              </span>
              .
            </p>
            <p className="text-xs text-gray-400 text-center">
              After successful payment, copy the{" "}
              <span className="font-semibold text-gray-200">
                UPI Transaction ID / UTR
              </span>{" "}
              from your payment app and paste it below.
            </p>
          </div>
        </div>

        <div className="rounded-2xl bg-slate-800/40 border border-slate-700 p-5 space-y-3">
          <div className="flex items-center gap-2">
            <svg
              className="w-5 h-5 text-rizz-secondary"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2m-6 9l2 2 4-4"
              />
            </svg>
            <h3 className="text-lg font-bold text-white">Step 2 · Enter Your UTR</h3>
          </div>
          <p className="text-xs text-gray-400 -mt-1">
            Paste the UPI Transaction ID / Unique Transaction Reference (UTR)
            from your payment history.
          </p>
          <FormInput
            label="UPI Transaction ID / UTR"
            id="upiTransactionId"
            type="text"
            placeholder="e.g. 2026092812345678 or 123456789012"
            value={formData.upiTransactionId}
            onChange={(e) => handleChange("upiTransactionId", e.target.value)}
            error={errors.upiTransactionId}
            disabled={status === "loading"}
            autoComplete="off"
          />
        </div>

        <div className="pt-3">
          <SubmitButton type="submit" isLoading={status === "loading"}>
            {status === "loading"
              ? "Saving Registration…"
              : "Submit Registration"}
          </SubmitButton>
        </div>
      </form>
    </div>
  );
}
