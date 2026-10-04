export const ENTRY_FEE = 1400;
export const MAX_FILE_SIZE_BYTES = 5 * 1024 * 1024;
export const ACCEPTED_FILE_TYPES = [
  "image/jpeg",
  "image/jpg",
  "image/png",
  "application/pdf",
];
export const ACCEPTED_FILE_ATTR = ".jpg,.jpeg,.png,image/jpeg,image/png,application/pdf";

export type Department =
  | "Information Technology"
  

export type YearOfStudy = "1st Year" | "2nd Year" ;

export type PaymentStatus = "Success" | "Verified" | "Rejected";

export interface RegistrationFormData {
  fullName: string;
  collegeEmail: string;
  mobileNumber: string;
  rollNumber: string;
  department: Department | "";
  yearOfStudy: YearOfStudy | "";
  upiTransactionId: string;
}

export interface FormErrors {
  fullName?: string;
  collegeEmail?: string;
  mobileNumber?: string;
  rollNumber?: string;
  department?: string;
  yearOfStudy?: string;
  upiTransactionId?: string;
}

export const DEPARTMENTS: Department[] = [
  "Information Technology",
];

export const YEARS_OF_STUDY: YearOfStudy[] = [
  "1st Year",
  "2nd Year",
];
