export const MAX_DEMO_UPLOAD_BYTES = 10 * 1024 * 1024;

type UploadCandidate = { name: string; size: number; type: string };
export type UploadValidation = { ok: true } | { ok: false; message: string };

const allowedTypes: Record<string, readonly string[]> = {
  pdf: ["application/pdf"],
  csv: ["text/csv", "application/csv", "application/vnd.ms-excel"],
  txt: ["text/plain"],
  png: ["image/png"],
  jpg: ["image/jpeg"],
  jpeg: ["image/jpeg"],
};

export function validateDemoUpload(file: UploadCandidate): UploadValidation {
  if (!Number.isFinite(file.size) || file.size <= 0) {
    return { ok: false, message: "This file is empty. Choose a document that contains data." };
  }
  if (file.size > MAX_DEMO_UPLOAD_BYTES) {
    return { ok: false, message: "That file is larger than 10 MB. Please choose a smaller document." };
  }

  const extension = file.name.trim().toLowerCase().split(".").pop() ?? "";
  const expectedTypes = allowedTypes[extension];
  if (!expectedTypes) {
    return { ok: false, message: "Unsupported file type. Choose a PDF, CSV, TXT, PNG, or JPG file." };
  }

  const mimeType = file.type.trim().toLowerCase();
  if (mimeType && !expectedTypes.includes(mimeType)) {
    return { ok: false, message: "The file content type does not match its extension." };
  }
  return { ok: true };
}
