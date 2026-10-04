"use client";

import Image from "next/image";
import { ENTRY_FEE } from "@/types/registration";

const instructions = [
  "Scan the UPI QR code using any UPI app (PhonePe, Google Pay, Paytm, etc.).",
  `Pay exactly ₹${ENTRY_FEE.toLocaleString("en-IN")} entry fee.`,
  "After a successful payment, copy your UPI transaction ID (UTR).",
  "Upload a clear screenshot of the payment confirmation.",
  "Review and submit your registration for verification.",
];

export default function PaymentSection() {
  return (
    <section className="w-full space-y-6">
      <div className="text-center space-y-2">
        <h3 className="text-2xl md:text-3xl font-extrabold bg-gradient-to-r from-rizz-primary via-rizz-accent to-rizz-secondary bg-clip-text text-transparent">
          Complete Your Payment
        </h3>
        <p className="text-gray-300 text-sm md:text-base">
          Scan the QR, pay the entry fee, then submit your payment details below.
        </p>
      </div>

      <div className="rounded-2xl bg-gradient-to-br from-rizz-primary/15 via-rizz-accent/10 to-rizz-secondary/15 border border-rizz-primary/30 p-5 md:p-6 text-center shadow-lg">
        <p className="text-xs uppercase tracking-widest text-gray-400 font-semibold mb-2">
          Entry Fee
        </p>
        <p className="text-4xl md:text-5xl font-extrabold text-white">
          ₹
          <span className="bg-gradient-to-r from-rizz-primary via-rizz-accent to-rizz-secondary bg-clip-text text-transparent">
            {ENTRY_FEE.toLocaleString("en-IN")}
          </span>
        </p>
        <p className="text-sm text-gray-400 mt-2">per student</p>
      </div>

      <div className="flex flex-col md:flex-row gap-6 items-start">
        <div className="w-full md:w-1/2">
          <div className="rounded-2xl bg-white p-4 md:p-5 shadow-2xl border border-gray-100 mx-auto max-w-xs">
            <div className="aspect-square w-full rounded-xl overflow-hidden bg-white border border-gray-200 relative">
              <Image
                src="/rizzverse-qr.png"
                alt={`UPI QR code — pay ₹${ENTRY_FEE.toLocaleString(
                  "en-IN"
                )}`}
                fill
                sizes="(max-width: 768px) 60vw, 20vw"
                className="object-contain"
                priority={false}
              />
            </div>
            <p className="mt-4 text-xs md:text-sm text-center text-gray-600 font-medium">
              Scan to pay ₹{ENTRY_FEE.toLocaleString("en-IN")}
            </p>
          </div>
        </div>

        <div className="w-full md:w-1/2">
          <div className="rounded-2xl bg-slate-800/60 border border-slate-700 p-5 md:p-6">
            <h4 className="font-bold text-white text-lg mb-4 flex items-center gap-2">
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
                  d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"
                />
              </svg>
              Payment Instructions
            </h4>
            <ol className="space-y-3.5">
              {instructions.map((step, idx) => (
                <li key={idx} className="flex gap-3">
                  <span className="flex-shrink-0 w-6 h-6 rounded-full bg-gradient-to-br from-rizz-primary to-rizz-secondary text-white text-xs font-bold flex items-center justify-center shadow">
                    {idx + 1}
                  </span>
                  <span className="text-sm text-gray-300 leading-relaxed pt-0.5">
                    {step}
                  </span>
                </li>
              ))}
            </ol>
          </div>
        </div>
      </div>
    </section>
  );
}
