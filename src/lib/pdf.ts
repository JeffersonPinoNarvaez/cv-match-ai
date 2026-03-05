import { validatePDFFile } from "./validation";
import { sanitizeText, truncateText } from "./sanitize";
import { logger } from "./logger";

// privacy: no disk writes

const MAX_PDF_SIZE_BYTES = 2 * 1024 * 1024; // 2MB
const MIN_TEXT_LENGTH = 100;
const MAX_TEXT_CHARS = 4000;

const PDF_MAGIC_BYTES = [0x25, 0x50, 0x44, 0x46, 0x2d]; // %PDF-

export type ExtractedPDF = {
  text: string;
  truncatedText: string;
  tooShort: boolean;
};

export async function validateAndExtractPDF(
  file: File
): Promise<ExtractedPDF | { error: string }> {
  try {
    logger.log("[PDF] Starting validation for file:", file.name, "size:", file.size);
    
    if (file.size > MAX_PDF_SIZE_BYTES) {
      logger.log("[PDF] File too large:", file.size);
      return { error: "File is larger than 2MB limit." };
    }

    logger.log("[PDF] Converting file to ArrayBuffer...");
    const arrayBuffer = await file.arrayBuffer();
    logger.log("[PDF] ArrayBuffer size:", arrayBuffer.byteLength);
    
    const buffer = Buffer.from(arrayBuffer);
    // Additional low-level validation (version, filename, JS markers)
    const validation = await validatePDFFile(buffer, file.name, file.size);
    if (!validation.valid) {
      logger.log("[PDF] Validation failed:", validation.error);
      return { error: validation.error || "Invalid PDF file." };
    }
    logger.log("[PDF] Buffer created, length:", buffer.length);

    // Validate magic bytes server-side: check buffer starts with %PDF-
    logger.log("[PDF] Validating magic bytes...");
    for (let i = 0; i < PDF_MAGIC_BYTES.length; i++) {
      if (buffer[i] !== PDF_MAGIC_BYTES[i]) {
        logger.log("[PDF] Magic byte mismatch at index", i, "expected", PDF_MAGIC_BYTES[i], "got", buffer[i]);
        return { error: "File is not a valid PDF (failed signature check)." };
      }
    }
    logger.log("[PDF] Magic bytes validated successfully");

    // Use dynamic import to load pdf-parse
    // pdf-parse is excluded from webpack bundling via next.config.mjs
    logger.log("[PDF] Importing pdf-parse module...");
    const { PDFParse } = await import("pdf-parse");
    logger.log("[PDF] PDFParse imported, type:", typeof PDFParse);
    
    if (typeof PDFParse !== 'function') {
      logger.error("[PDF] PDFParse is not a constructor:", PDFParse);
      return { error: "PDFParse is not a constructor - type: " + typeof PDFParse };
    }

    logger.log("[PDF] Creating PDFParse instance with buffer...");
    const parser = new PDFParse({ data: buffer });
    logger.log("[PDF] Parser instance created:", typeof parser);

    // Text extracted from buffer in memory — never written to disk
    logger.log("[PDF] Calling getText()...");
    const textResult = await parser.getText();
    logger.log("[PDF] getText() completed, result type:", typeof textResult);
    logger.log("[PDF] Text length:", textResult?.text?.length || 0);
    
    logger.log("[PDF] Destroying parser...");
    await parser.destroy();
    logger.log("[PDF] Parser destroyed");

    const sanitized = sanitizeText(textResult.text || "");
    const truncatedText = truncateText(sanitized, MAX_TEXT_CHARS);
    const tooShort = truncatedText.length < MIN_TEXT_LENGTH;

    logger.log("[PDF] Final text length:", truncatedText.length, "tooShort:", tooShort);

    if (tooShort) {
      return {
        text: truncatedText,
        truncatedText,
        tooShort: true,
      };
    }

    return {
      text: sanitized,
      truncatedText,
      tooShort: false,
    };
  } catch (error: unknown) {
    logger.error("[PDF] Error during PDF parsing:", error);
    logger.error("[PDF] Error stack:", error instanceof Error ? error.stack : "No stack");
    logger.error("[PDF] Error message:", error instanceof Error ? error.message : String(error));
    return { 
      error: `PDF parsing error: ${error instanceof Error ? error.message : String(error)}` 
    };
  }
}

