/**
 * AVEMS Digital PDF Invoice Extraction (Phase 2)
 *
 * Client-side, text-based PDF extraction using pdfjs-dist. Works for digitally
 * generated invoices (e.g. GST e-invoices) where the PDF contains a real text
 * layer. Scanned / image-only PDFs yield little/no text — those need OCR
 * (Phase 3, not implemented yet); see `isLikelyScanned`.
 *
 * All values are best-effort. The user reviews and edits before saving.
 */

import * as pdfjsLib from 'pdfjs-dist';
import workerUrl from 'pdfjs-dist/build/pdf.worker.min.mjs?url';

pdfjsLib.GlobalWorkerOptions.workerSrc = workerUrl;

export interface ExtractedInvoiceFields {
  invoiceNumber?: string;
  invoiceDate?: string; // ISO yyyy-mm-dd
  gstNumber?: string;
  roomCharges?: number;
  foodCharges?: number;
  hallCharges?: number;
  otherCharges?: number;
  subtotalAmount?: number;
  cgstAmount?: number;
  sgstAmount?: number;
  igstAmount?: number;
  invoiceAmount?: number;
}

export interface ExtractionMetrics {
  source: 'digital-pdf' | 'scanned-pdf';
  fieldsDetected: string[];
  fieldsMissing: string[];
  detectedCount: number;
  totalFields: number;
  textLength: number;
  durationMs: number;
  timestamp: string;
}

export interface ExtractionResult {
  fields: ExtractedInvoiceFields;
  /** Number of fields successfully extracted. */
  extractedCount: number;
  /** Total characters of text recovered from the PDF. */
  textLength: number;
  /** True when the PDF has almost no text layer (likely a scan needing OCR). */
  isLikelyScanned: boolean;
  rawText: string;
  metrics: ExtractionMetrics;
}

const FIELD_KEYS: (keyof ExtractedInvoiceFields)[] = [
  'invoiceNumber', 'invoiceDate', 'gstNumber',
  'roomCharges', 'foodCharges', 'hallCharges', 'otherCharges',
  'subtotalAmount', 'cgstAmount', 'sgstAmount', 'igstAmount', 'invoiceAmount',
];

// ── Helpers ──────────────────────────────────────────────────────────────────

/** Parse Indian-formatted numbers like "3,41,964.00" → 341964. */
function parseAmount(raw: string | undefined | null): number | undefined {
  if (!raw) return undefined;
  const cleaned = raw.replace(/[,\s₹]/g, '');
  const n = Number.parseFloat(cleaned);
  return Number.isFinite(n) ? n : undefined;
}

/** Convert dd-mm-yyyy or dd/mm/yyyy to ISO yyyy-mm-dd. */
function toIsoDate(raw: string | undefined): string | undefined {
  if (!raw) return undefined;
  const m = raw.match(/(\d{1,2})[-/](\d{1,2})[-/](\d{4})/);
  if (!m) return undefined;
  const [, d, mo, y] = m;
  return `${y}-${mo.padStart(2, '0')}-${d.padStart(2, '0')}`;
}

function firstMatch(text: string, re: RegExp): string | undefined {
  const m = text.match(re);
  return m ? m[1] : undefined;
}

// ── Field extractors (label-anchored, resilient to spacing) ─────────────────

function extractFields(text: string): ExtractedInvoiceFields {
  const fields: ExtractedInvoiceFields = {};

  // Invoice / document number, e.g. "Document No. : BN-26/1060" or "Bill No BN-26/1060"
  fields.invoiceNumber =
    firstMatch(text, /Document\s*No\.?\s*:?\s*([A-Z0-9][A-Z0-9\-/]+)/i) ??
    firstMatch(text, /Bill\s*No\.?\s*:?\s*([A-Z0-9][A-Z0-9\-/]+)/i) ??
    firstMatch(text, /\b(BN-?\d+\/\d+)\b/);

  // Document date
  fields.invoiceDate =
    toIsoDate(firstMatch(text, /Document\s*Date\s*:?\s*(\d{1,2}[-/]\d{1,2}[-/]\d{4})/i)) ??
    toIsoDate(firstMatch(text, /Date\s*of\s*Departure\s*:?\s*(\d{1,2}[-/]\d{1,2}[-/]\d{4})/i)) ??
    toIsoDate(firstMatch(text, /Invoice\s*Date\s*:?\s*(\d{1,2}[-/]\d{1,2}[-/]\d{4})/i));

  // GSTIN (15 chars). Picks the first valid GSTIN found.
  fields.gstNumber = firstMatch(text, /\b(\d{2}[A-Z]{5}\d{4}[A-Z]\d[A-Z\d]Z[A-Z\d])\b/);

  // Labeled tax/total summary (from GST e-invoice footer row)
  fields.subtotalAmount =
    parseAmount(firstMatch(text, /Tax['’]?ble\s*Amt\.?\s*:?\s*([\d,]+\.?\d*)/i)) ??
    parseAmount(firstMatch(text, /Taxable\s*Amount\s*:?\s*([\d,]+\.?\d*)/i)) ??
    parseAmount(firstMatch(text, /Total\s*Charges\s*:?\s*([\d,]+\.?\d*)/i));

  fields.cgstAmount = parseAmount(firstMatch(text, /CGST\s*(?:Amt|Amount)?\.?\s*:?\s*([\d,]+\.?\d*)/i));
  fields.sgstAmount = parseAmount(firstMatch(text, /SGST\s*(?:Amt|Amount)?\.?\s*:?\s*([\d,]+\.?\d*)/i));
  fields.igstAmount = parseAmount(firstMatch(text, /IGST\s*(?:Amt|Amount)?\.?\s*:?\s*([\d,]+\.?\d*)/i));

  fields.invoiceAmount =
    parseAmount(firstMatch(text, /Tot\.?\s*Inv\.?\s*Amt\.?\s*:?\s*([\d,]+\.?\d*)/i)) ??
    parseAmount(firstMatch(text, /Grand\s*Total\s*:?\s*([\d,]+\.?\d*)/i)) ??
    parseAmount(firstMatch(text, /Total\s*Payable\s*:?\s*([\d,]+\.?\d*)/i));

  // Charge categories (best-effort; cover-letter labels are tax-INCLUSIVE so
  // left undefined here to avoid corrupting taxable reconciliation — the user
  // enters/edits these. Hooks kept for future per-HSN summation.)
  fields.otherCharges = parseAmount(firstMatch(text, /Other\s*charges?\s*[:\-]?\s*(?:[A-Z0-9\-/]+\s*)?([\d,]+\.?\d*)/i));

  return fields;
}

// ── Public API ───────────────────────────────────────────────────────────────

export async function extractInvoiceFromPdf(file: File): Promise<ExtractionResult> {
  const startedAt = performance.now();
  const buffer = await file.arrayBuffer();
  const pdf = await pdfjsLib.getDocument({ data: buffer }).promise;

  let fullText = '';
  for (let pageNum = 1; pageNum <= pdf.numPages; pageNum++) {
    const page = await pdf.getPage(pageNum);
    const content = await page.getTextContent();
    const pageText = content.items.map((item: any) => ('str' in item ? item.str : '')).join(' ');
    fullText += pageText + '\n';
  }

  const textLength = fullText.replace(/\s/g, '').length;
  const isLikelyScanned = textLength < 40; // near-empty text layer ⇒ scanned

  const fields = isLikelyScanned ? {} : extractFields(fullText);

  const fieldsDetected = FIELD_KEYS.filter((k) => fields[k] !== undefined && fields[k] !== '');
  const fieldsMissing = FIELD_KEYS.filter((k) => !fieldsDetected.includes(k));
  const extractedCount = fieldsDetected.length;

  const metrics: ExtractionMetrics = {
    source: isLikelyScanned ? 'scanned-pdf' : 'digital-pdf',
    fieldsDetected: fieldsDetected as string[],
    fieldsMissing: fieldsMissing as string[],
    detectedCount: extractedCount,
    totalFields: FIELD_KEYS.length,
    textLength,
    durationMs: Math.round(performance.now() - startedAt),
    timestamp: new Date().toISOString(),
  };

  // Lightweight reporting (console only for now — informs OCR need later).
  console.info('[AVEMS] Invoice PDF extraction metrics:', metrics);

  return { fields, extractedCount, textLength, isLikelyScanned, rawText: fullText, metrics };
}
