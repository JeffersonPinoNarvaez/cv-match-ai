import { logger } from "./logger";

export interface FileValidationResult {
  valid: boolean;
  error?: string;
  sanitizedBuffer?: Buffer;
}

const MAX_PDF_SIZE_BYTES = 2 * 1024 * 1024; // 2MB
const PDF_MAGIC_BYTES = [0x25, 0x50, 0x44, 0x46]; // %PDF

const FILENAME_REGEX = /^[a-zA-Z0-9\s\-_.]{1,200}$/;

/**
 * Perform low-level validation of an uploaded PDF buffer.
 * This is intentionally conservative and does not attempt to fully
 * parse the PDF structure (that is delegated to the pdf-parse based
 * extraction pipeline).
 */
export async function validatePDFFile(
  buffer: Buffer,
  filename: string,
  declaredSize: number
): Promise<FileValidationResult> {
  // CHECK 1 — Size validation (trust the actual buffer length)
  if (buffer.length > MAX_PDF_SIZE_BYTES || declaredSize > MAX_PDF_SIZE_BYTES) {
    return { valid: false, error: "File is larger than 2MB limit." };
  }

  // CHECK 2 — Magic bytes verification (%PDF at start)
  if (buffer.length < PDF_MAGIC_BYTES.length) {
    return { valid: false, error: "Invalid file format (too small to be a PDF)." };
  }
  for (let i = 0; i < PDF_MAGIC_BYTES.length; i++) {
    if (buffer[i] !== PDF_MAGIC_BYTES[i]) {
      return { valid: false, error: "Invalid file format (PDF signature mismatch)." };
    }
  }

  // CHECK 3 — PDF header version check
  const header = buffer.toString("ascii", 0, 20);
  const match = header.match(/%PDF-(\d\.\d)/);
  if (!match) {
    return { valid: false, error: "Invalid PDF header version." };
  }
  const version = parseFloat(match[1]);
  if (isNaN(version) || version < 1.0 || version > 2.0) {
    return { valid: false, error: "Unsupported PDF version." };
  }

  // CHECK 4 — Filename sanitization
  const justName = (filename || "cv.pdf").replace(/\\/g, "/").split("/").pop() || "cv.pdf";
  const noNull = justName.replace(/\x00/g, "");
  if (!FILENAME_REGEX.test(noNull)) {
    return { valid: false, error: "Invalid filename for uploaded PDF." };
  }

  // CHECK 6 — PDF JavaScript detection (best-effort scan)
  try {
    const sample = buffer.toString("latin1");
    const jsPattern = /\/(JavaScript|JS\s|AA\s|OpenAction)/i;
    if (jsPattern.test(sample)) {
      // We do not reject the file, but log a warning server-side for operators.
      logger.warn("[PDF] Potential embedded JavaScript detected in PDF. Proceeding with caution.");
    }
  } catch {
    // If decoding fails, we still allow the file — extraction pipeline will handle it.
  }

  return { valid: true, sanitizedBuffer: buffer };
}

