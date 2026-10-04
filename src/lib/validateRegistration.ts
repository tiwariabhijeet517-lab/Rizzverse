import type { RegistrationFormData, FormErrors } from "@/types/registration";

export function validateRegistrationForm(
  data: RegistrationFormData
): FormErrors {
  const errors: FormErrors = {};

  if (!data.fullName.trim()) {
    errors.fullName = "Full name is required";
  } else if (data.fullName.trim().length < 2) {
    errors.fullName = "Name must be at least 2 characters";
  }

  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  if (!data.collegeEmail.trim()) {
    errors.collegeEmail = "College email is required";
  } else if (!emailRegex.test(data.collegeEmail.trim())) {
    errors.collegeEmail = "Please enter a valid email address";
  }

  const phoneRegex = /^[6-9]\d{9}$/;
  if (!data.mobileNumber.trim()) {
    errors.mobileNumber = "Mobile number is required";
  } else if (!/^\d{10}$/.test(data.mobileNumber.trim())) {
    errors.mobileNumber = "Mobile number must be exactly 10 digits";
  } else if (!phoneRegex.test(data.mobileNumber.trim())) {
    errors.mobileNumber = "Please enter a valid Indian mobile number";
  }

  if (!data.rollNumber.trim()) {
    errors.rollNumber = "Roll number is required";
  } else if (data.rollNumber.trim().length < 2) {
    errors.rollNumber = "Please enter a valid roll number";
  }

  if (!data.department) {
    errors.department = "Please select your department";
  }

  if (!data.yearOfStudy) {
    errors.yearOfStudy = "Please select your year of study";
  }

  const utr = data.upiTransactionId.trim();
  if (!utr) {
    errors.upiTransactionId = "UTR / UPI Transaction ID is required";
  } else if (utr.length < 6) {
    errors.upiTransactionId =
      "UTR seems too short — please enter the full UPI Transaction ID / UTR";
  }

  return errors;
}
