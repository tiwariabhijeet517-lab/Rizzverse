import { NextResponse } from "next/server";
import {
  createServiceRoleClient,
  getConfigDiagnostics,
} from "@/lib/supabase/server";
import {
  type Department,
  type YearOfStudy,
  DEPARTMENTS,
  YEARS_OF_STUDY,
} from "@/types/registration";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

const DEPARTMENT_SET = new Set<string>(DEPARTMENTS);
const YEAR_SET = new Set<string>(YEARS_OF_STUDY);

interface FieldErrors {
  [key: string]: string;
}

function fieldErrorsToResponse(errors: FieldErrors, status = 400) {
  return NextResponse.json(
    { ok: false, error: "Validation failed", errors },
    { status }
  );
}

function validatePayload(form: {
  fullName: FormDataEntryValue | null;
  collegeEmail: FormDataEntryValue | null;
  mobileNumber: FormDataEntryValue | null;
  rollNumber: FormDataEntryValue | null;
  department: FormDataEntryValue | null;
  yearOfStudy: FormDataEntryValue | null;
  upiTransactionId: FormDataEntryValue | null;
}): FieldErrors {
  const errors: FieldErrors = {};

  const fullName = String(form.fullName ?? "").trim();
  const collegeEmail = String(form.collegeEmail ?? "").trim();
  const mobileNumber = String(form.mobileNumber ?? "").trim();
  const rollNumber = String(form.rollNumber ?? "").trim();
  const department = String(form.department ?? "").trim();
  const yearOfStudy = String(form.yearOfStudy ?? "").trim();
  const upiTransactionId = String(form.upiTransactionId ?? "").trim();

  if (!fullName) {
    errors.fullName = "Full name is required";
  } else if (fullName.length < 2) {
    errors.fullName = "Name must be at least 2 characters";
  }

  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  if (!collegeEmail) {
    errors.collegeEmail = "College email is required";
  } else if (!emailRegex.test(collegeEmail)) {
    errors.collegeEmail = "Please enter a valid email address";
  }

  const phoneRegex = /^[6-9]\d{9}$/;
  if (!mobileNumber) {
    errors.mobileNumber = "Mobile number is required";
  } else if (!/^\d{10}$/.test(mobileNumber)) {
    errors.mobileNumber = "Mobile number must be exactly 10 digits";
  } else if (!phoneRegex.test(mobileNumber)) {
    errors.mobileNumber = "Please enter a valid Indian mobile number";
  }

  if (!rollNumber) {
    errors.rollNumber = "Roll number is required";
  } else if (rollNumber.length < 2) {
    errors.rollNumber = "Please enter a valid roll number";
  }

  if (!department) {
    errors.department = "Please select your department";
  } else if (!DEPARTMENT_SET.has(department)) {
    errors.department = "Invalid department";
  }

  if (!yearOfStudy) {
    errors.yearOfStudy = "Please select your year of study";
  } else if (!YEAR_SET.has(yearOfStudy)) {
    errors.yearOfStudy = "Invalid year of study";
  }

  if (!upiTransactionId) {
    errors.upiTransactionId = "UTR / UPI Transaction ID is required";
  } else if (upiTransactionId.length < 6) {
    errors.upiTransactionId =
      "UTR seems too short — please enter the full UPI Transaction ID / UTR";
  }

  return errors;
}

export async function POST(req: Request) {
  try {
    if (
      !process.env.NEXT_PUBLIC_SUPABASE_URL ||
      !process.env.SUPABASE_SERVICE_ROLE_KEY
    ) {
      console.error(
        "[Register 500] Missing Supabase env vars. Status:",
        getConfigDiagnostics()
      );
      return NextResponse.json(
        {
          ok: false,
          error:
            "Supabase is not configured yet. The organizer must set NEXT_PUBLIC_SUPABASE_URL / SUPABASE_SERVICE_ROLE_KEY / NEXT_PUBLIC_SUPABASE_ANON_KEY in .env.local (project root) and restart the dev server.",
        },
        { status: 503 }
      );
    }

    const contentType = req.headers.get("content-type") || "";
    if (!contentType.toLowerCase().includes("multipart/form-data")) {
      return NextResponse.json(
        { ok: false, error: "Request must be multipart/form-data." },
        { status: 400 }
      );
    }

    const formData = await req.formData();

    const extracted = {
      fullName: formData.get("fullName"),
      collegeEmail: formData.get("collegeEmail"),
      mobileNumber: formData.get("mobileNumber"),
      rollNumber: formData.get("rollNumber"),
      department: formData.get("department"),
      yearOfStudy: formData.get("yearOfStudy"),
      upiTransactionId: formData.get("upiTransactionId"),
    };

    const errors = validatePayload(extracted);

    if (Object.keys(errors).length > 0) {
      return fieldErrorsToResponse(errors, 400);
    }

    let supabase;
    try {
      supabase = createServiceRoleClient();
    } catch (cfgErr) {
      console.error(
        "[Register 503] Supabase server client failed to initialize:",
        cfgErr instanceof Error ? cfgErr.message : cfgErr
      );
      return NextResponse.json(
        {
          ok: false,
          error:
            "Supabase is not configured yet. The organizer must set NEXT_PUBLIC_SUPABASE_URL / SUPABASE_SERVICE_ROLE_KEY / NEXT_PUBLIC_SUPABASE_ANON_KEY in .env.local (project root) and restart the dev server.",
        },
        { status: 503 }
      );
    }

    const fullName = String(extracted.fullName!).trim();
    const collegeEmail = String(extracted.collegeEmail!).trim();
    const mobileNumber = String(extracted.mobileNumber!).trim();
    const rollNumber = String(extracted.rollNumber!).trim();
    const department = String(extracted.department!).trim() as Department;
    const yearOfStudy = String(extracted.yearOfStudy!).trim() as YearOfStudy;
    const upiTransactionId = String(extracted.upiTransactionId!).trim();

    const existingConflict = await supabase
      .from("registrations")
      .select("college_email, roll_number", { count: "exact", head: false })
      .or(
        `college_email.ilike.${collegeEmail},roll_number.ilike.${rollNumber}`
      )
      .limit(1);

    if (existingConflict.data && existingConflict.data.length > 0) {
      const row = existingConflict.data[0] as {
        college_email: string;
        roll_number: string;
      };
      const dupErrors: FieldErrors = {};
      if (row.college_email.toLowerCase() === collegeEmail.toLowerCase()) {
        dupErrors.collegeEmail =
          "This college email is already registered. Contact the organizers if you think this is an error.";
      }
      if (row.roll_number.toUpperCase() === rollNumber.toUpperCase()) {
        dupErrors.rollNumber =
          "This roll number is already registered. Contact the organizers if you think this is an error.";
      }
      return fieldErrorsToResponse(dupErrors, 409);
    }

    const insertRes = await supabase
      .from("registrations")
      .insert({
        full_name: fullName,
        college_email: collegeEmail,
        mobile_number: mobileNumber,
        roll_number: rollNumber,
        department,
        year_of_study: yearOfStudy,
        upi_transaction_id: upiTransactionId,
        payment_proof_path: "none",
        confirm_payment: true,
      })
      .select("id, created_at")
      .single();

    if (insertRes.error) {
      console.error("Supabase DB insert error:", insertRes.error);
      const code = insertRes.error.code;
      if (code === "23505") {
        const msg = insertRes.error.message || "";
        const dupErrors: FieldErrors = {};
        if (msg.toLowerCase().includes("college_email")) {
          dupErrors.collegeEmail = "This college email is already registered.";
        }
        if (msg.toLowerCase().includes("roll_number")) {
          dupErrors.rollNumber = "This roll number is already registered.";
        }
        if (Object.keys(dupErrors).length > 0) {
          return fieldErrorsToResponse(dupErrors, 409);
        }
      }

      return NextResponse.json(
        {
          ok: false,
          error:
            "We couldn't save your registration at this time. Please try again in a moment.",
        },
        { status: 500 }
      );
    }

    return NextResponse.json(
      {
        ok: true,
        registrationId: insertRes.data.id,
        createdAt: insertRes.data.created_at,
        message: "Registration saved successfully.",
      },
      { status: 201 }
    );
  } catch (err) {
    console.error("Unexpected registration API error:", err);
    return NextResponse.json(
      {
        ok: false,
        error:
          "An unexpected error occurred while submitting your registration. Please try again.",
      },
      { status: 500 }
    );
  }
}
