/**
 * AVEMS Digital PDF & Scanned PDF OCR Invoice Extraction
 *
 * Client-side extraction using pdfjs-dist and tesseract.js.
 * Works for digitally generated invoices (fast text extraction) and
 * scanned/image-only PDFs (OCR extraction).
 *
 * All values are best-effort. The user reviews and edits before saving.
 */

import * as pdfjsLib from 'pdfjs-dist';
import workerUrl from 'pdfjs-dist/build/pdf.worker.min.mjs?url';
import Tesseract from 'tesseract.js';

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
  source: 'digital-pdf' | 'scanned-pdf' | 'image';
  fieldsDetected: string[];
  fieldsMissing: string[];
  detectedCount: number;
  totalFields: number;
  textLength: number;
  durationMs: number;
  timestamp: string;
}

export interface OcrWord {
  text: string;
  confidence: number;
  x0: number;
  y0: number;
  x1: number;
  y1: number;
  yCenter: number;
}

export interface OcrRow {
  words: OcrWord[];
  text: string;
  yCenter: number;
  pageNumber: number;
}

export type InvoicePageType = 'CoverLetter' | 'TaxInvoice' | 'RoomingReport' | 'ChemistBill' | 'DebitVoucher' | 'Unknown';

export interface OcrPage {
  pageNumber: number;
  pageType: InvoicePageType;
  text: string;
  words: OcrWord[];
  rows: OcrRow[];
}

export interface ExtractionResult {
  fields: ExtractedInvoiceFields;
  /** Number of fields successfully extracted. */
  extractedCount: number;
  /** Total characters of text recovered from the PDF. */
  textLength: number;
  /** True when the PDF has almost no text layer, thus processed via OCR. */
  isLikelyScanned: boolean;
  rawText: string;
  ocrPages?: OcrPage[];
  metrics: ExtractionMetrics;
  validationMismatch?: boolean;
  validationMessage?: string;
  fieldConfidences: Record<string, number>;
  suggestedFields: string[];
  financialSourceMode?: 'Cover Letter' | 'Tax Invoice';
}

const FIELD_KEYS: (keyof ExtractedInvoiceFields)[] = [
  'invoiceNumber', 'invoiceDate', 'gstNumber',
  'roomCharges', 'foodCharges', 'hallCharges', 'otherCharges',
  'subtotalAmount', 'cgstAmount', 'sgstAmount', 'igstAmount', 'invoiceAmount',
];

// ── Helpers ──────────────────────────────────────────────────────────────────

/** Parse Indian-formatted numbers like "3,41,964.00" → 341964. Includes lenient OCR noise removal. */
function parseAmount(raw: string | undefined | null): number | undefined {
  if (!raw) return undefined;
  // Remove spaces first so separated digits/commas merge
  const noSpace = raw.replace(/\s+/g, '');
  const m = noSpace.match(/[\d,]+\.?\d*/);
  if (!m) return undefined;
  const cleaned = m[0].replace(/,/g, '');
  let n = Number.parseFloat(cleaned);
  
  if (Number.isFinite(n)) {
    // OCR often drops decimal points for Indian currency ending in .00 or .50
    // If it's a huge number (> 100,000) and has no decimal, it almost certainly missed the dot.
    // Even smaller numbers like "49500" -> "495.00" can be safely inferred if they end in 00/50/75.
    if (!m[0].includes('.') && cleaned.length >= 4) {
      const lastTwo = cleaned.slice(-2);
      if (['00', '50', '25', '75'].includes(lastTwo)) {
        // If it's > 50000 (i.e. 500.00), or if we explicitly see a trailing typical decimal pattern
        // dividing by 100 is far safer than returning an outrageous hotel charge of ₹34,196,400.
        n = n / 100;
      }
    }
    return n;
  }
  return undefined;
}

/** Convert dd-mm-yyyy or dd/mm/yyyy to ISO yyyy-mm-dd. */
function toIsoDate(raw: string | undefined): string | undefined {
  if (!raw) return undefined;
  const m = raw.match(/(\d{1,2})[-/\s]+(\d{1,2})[-/\s]+(\d{4})/);
  if (!m) return undefined;
  const [, d, mo, y] = m;
  return `${y}-${mo.padStart(2, '0')}-${d.padStart(2, '0')}`;
}

function firstMatch(text: string, re: RegExp): string | undefined {
  const m = text.match(re);
  return m ? m[1] : undefined;
}

export type ReOcrCallback = (pageNum: number, bbox: { x0: number, y0: number, x1: number, y1: number }) => Promise<{ text: string, confidence: number }>;

/** 
 * Robustly extracts the final amount for a given label in an invoice table.
 * It finds the line with the label, and takes the *last* number on that line,
 * which is almost always the line total, ignoring intermediate OCR noise.
 */
async function extractAmountForLabel(
  text: string, 
  labelRegex: RegExp, 
  rows?: OcrRow[],
  reOcr?: ReOcrCallback,
  searchDirection: 'top-down' | 'bottom-up' = 'top-down'
): Promise<{ value: number | undefined, confidence: number, suggested: boolean }> {
  // If we have coordinate-based rows, use them and DO NOT fallback to raw text 
  // (because raw text might contain excluded pages like Rooming Reports).
  if (rows && rows.length > 0) {
    const start = searchDirection === 'top-down' ? 0 : rows.length - 1;
    const end = searchDirection === 'top-down' ? rows.length : -1;
    const step = searchDirection === 'top-down' ? 1 : -1;
    for (let i = start; i !== end; i += step) {
      if (labelRegex.test(rows[i].text)) {
        let rowToSearch = rows[i].text;
        // If no numbers in this row, try appending the next row
        if (!/\d/.test(rowToSearch) && i + 1 < rows.length) {
          rowToSearch += ' ' + rows[i + 1].text;
        }
        
        rowToSearch = rowToSearch.replace(/\s*,\s*/g, ',').replace(/\s*\.\s*/g, '.');
        const numberMatches = rowToSearch.match(/\d+(?:[,\.]+\d+)*/g);
        if (numberMatches && numberMatches.length > 0) {
          const amtStr = numberMatches[numberMatches.length - 1];
          const amt = parseAmount(amtStr);
          
          // Hybrid Extraction: Determine confidence
          // Check if the last word on the row corresponds to this amount
          const lastWord = rows[i].words.length > 0 ? rows[i].words[rows[i].words.length - 1] : undefined;
          let confidence = lastWord ? lastWord.confidence : 50;
          let suggested = false;
          let finalValue = amt;

          // If the parsed amount is noisy (e.g., lost decimals > 1000000) or confidence is low, and we have a reOcr callback
          if (reOcr && lastWord && (confidence < 80 || (amt && amt > 1000000 && !amtStr.includes('.')))) {
            console.info(`[AVEMS-DEBUG] Triggering Two-Pass OCR for low confidence/noisy value: "${lastWord.text}" (conf: ${confidence})`);
            try {
              // Expand the bounding box slightly to capture full characters
              const padding = 10;
              const bbox = {
                x0: Math.max(0, lastWord.x0 - padding),
                y0: Math.max(0, lastWord.y0 - padding),
                x1: lastWord.x1 + padding,
                y1: lastWord.y1 + padding
              };
              
              const reOcrResult = await reOcr(rows[i].pageNumber, bbox);
              if (reOcrResult) {
                const reOcrAmt = parseAmount(reOcrResult.text);
                if (reOcrAmt !== undefined) {
                   finalValue = reOcrAmt;
                   confidence = reOcrResult.confidence;
                   suggested = false; // Fresh high-res extraction!
                   console.info(`[AVEMS-DEBUG] Two-Pass OCR Success: "${reOcrResult.text}" -> ${finalValue}`);
                }
              }
            } catch (err) {
              console.warn("[AVEMS-DEBUG] Two-Pass OCR failed, using original value.");
            }
          }

          if (finalValue && finalValue > 100000 && !amtStr.includes('.')) {
             // If we had to divide by 100 due to missed decimal, mark it suggested
             suggested = true;
          }

          console.info(`[AVEMS-DEBUG] extractAmountForLabel Match! Regex: ${labelRegex.source} | Row: "${rows[i].text}" | Parsed: ${finalValue} | Conf: ${confidence}`);
          return { value: finalValue, confidence, suggested };
        }
      }
    }
    console.info(`[AVEMS-DEBUG] extractAmountForLabel FAILED! Regex: ${labelRegex.source} | Checked ${rows.length} rows.`);
  }

  // Fallback to text matching (for digital PDFs or failed row clustering)
  const lines = text.split(/\r?\n/);
  const start = searchDirection === 'top-down' ? 0 : lines.length - 1;
  const end = searchDirection === 'top-down' ? lines.length : -1;
  const step = searchDirection === 'top-down' ? 1 : -1;

  for (let i = start; i !== end; i += step) {
    if (labelRegex.test(lines[i])) {
      let lineToSearch = lines[i];
      // If no numbers on this line, append the next line
      if (!/\d/.test(lineToSearch) && searchDirection === 'top-down' && i + 1 < lines.length) {
        lineToSearch += ' ' + lines[i + 1];
      } else if (!/\d/.test(lineToSearch) && searchDirection === 'bottom-up' && i - 1 >= 0) {
        lineToSearch = lines[i - 1] + ' ' + lineToSearch;
      }
      
      // Fix OCR spaces around commas and dots (e.g. "123 , 456 . 00" -> "123,456.00")
      lineToSearch = lineToSearch.replace(/\s*,\s*/g, ',').replace(/\s*\.\s*/g, '.');
      
      const numberMatches = lineToSearch.match(/\d+(?:[,\.]+\d+)*/g);
      if (numberMatches && numberMatches.length > 0) {
        const lastNumStr = numberMatches[numberMatches.length - 1];
        const amt = parseAmount(lastNumStr);
        let suggested = false;
        if (amt && amt > 100000 && !lastNumStr.includes('.')) suggested = true;
        
        return { value: amt, confidence: 60, suggested };
      }
    }
  }
  return { value: undefined, confidence: 0, suggested: false };
}

function classifyPage(text: string): InvoicePageType {
  // Positive identifiers (Evaluate first so they aren't overridden by weak negative keywords)
  if (/Tax\s*Invoice|Original\s*for\s*Recipient/i.test(text)) return 'TaxInvoice';
  if (/Cover\s*Letter|Pleasant\s*Greetings|details\s*of\s*the\s*bill/i.test(text)) return 'CoverLetter';
  
  // Negative identifiers
  // (Removed Check[- ]in because "Check-in: [Date]" appears on almost all valid hotel invoices)
  if (/Rooming\s*List|Occupancy\s*Report|Guest\s*List/i.test(text)) return 'RoomingReport';
  if (/Pharmacy|Chemist|Medicines?/i.test(text)) return 'ChemistBill';
  if (/Debit\s*Voucher|Voucher/i.test(text)) return 'DebitVoucher';
  
  return 'Unknown';
}

// ── Field extractors (label-anchored, resilient to spacing and OCR noise) ──

async function extractFields(
  text: string, 
  pages?: OcrPage[],
  reOcr?: ReOcrCallback
): Promise<{ fields: ExtractedInvoiceFields, validationMismatch: boolean, validationMessage: string, fieldConfidences: Record<string, number>, suggestedFields: string[], financialSourceMode: 'Cover Letter' | 'Tax Invoice' }> {
  const fields: ExtractedInvoiceFields = {};
  const fieldConfidences: Record<string, number> = {};
  const suggestedFields: string[] = [];
  let financialSourceMode: 'Cover Letter' | 'Tax Invoice' = 'Tax Invoice';

  let financialText = text;
  let financialRows: OcrRow[] | undefined = undefined;
  
  let taxText = text;
  let taxRows: OcrRow[] | undefined = undefined;

  if (pages) {
    console.info(`[AVEMS-DEBUG] Classifying ${pages.length} pages...`);
    pages.forEach(p => console.info(`[AVEMS-DEBUG] Page ${p.pageNumber}: ${p.pageType} (${p.rows.length} rows)`));

    // Exclude Rooming Reports, Chemist Bills, and Debit Vouchers from all extraction
    const validPages = pages.filter(p => !['RoomingReport', 'ChemistBill', 'DebitVoucher'].includes(p.pageType));
    
    // Financial strictly prefers Cover Letter
    const coverLetterPages = validPages.filter(p => p.pageType === 'CoverLetter');
    const financialSourcePages = coverLetterPages.length > 0 ? coverLetterPages : validPages;
    financialText = financialSourcePages.map(p => p.text).join('\n\n');
    financialRows = financialSourcePages.flatMap(p => p.rows);
    console.info(`[AVEMS-DEBUG] Valid Pages for Financial: ${financialSourcePages.length}. Total Financial Rows: ${financialRows.length}`);

    // GST specifically prefers Tax Invoice pages
    const taxInvoicePages = validPages.filter(p => p.pageType === 'TaxInvoice');
    const taxSourcePages = taxInvoicePages.length > 0 ? taxInvoicePages : validPages;
    taxText = taxSourcePages.map(p => p.text).join('\n\n');
    taxRows = taxSourcePages.flatMap(p => p.rows);
  }

  // Invoice / document number
  fields.invoiceNumber =
    firstMatch(taxText, /Invoice\s*No\.?\s*[:\-]?\s*([A-Z0-9][A-Z0-9\-/]+)/i) ??
    firstMatch(taxText, /Document\s*No\.?\s*[:\-]?\s*([A-Z0-9][A-Z0-9\-/]+)/i) ??
    firstMatch(taxText, /Bill\s*No\.?\s*[:\-]?\s*([A-Z0-9][A-Z0-9\-/]+)/i) ??
    firstMatch(taxText, /\b([A-Z]+-?\d+\/\d+)\b/i) ??
    firstMatch(financialText, /Invoice\s*No\.?\s*[:\-]?\s*([A-Z0-9][A-Z0-9\-/]+)/i);

  // Document date
  fields.invoiceDate =
    toIsoDate(firstMatch(taxText, /Invoice\s*Date\s*[:\-]?\s*(\d{1,2}[-/\s]\d{1,2}[-/\s]\d{4})/i)) ??
    toIsoDate(firstMatch(taxText, /Document\s*Date\s*[:\-]?\s*(\d{1,2}[-/\s]\d{1,2}[-/\s]\d{4})/i)) ??
    toIsoDate(firstMatch(taxText, /Date\s*of\s*Departure\s*[:\-]?\s*(\d{1,2}[-/\s]\d{1,2}[-/\s]\d{4})/i)) ??
    toIsoDate(firstMatch(taxText, /Date\s*[:\-]?\s*(\d{1,2}[-/\s]\d{1,2}[-/\s]\d{4})/i)) ??
    toIsoDate(firstMatch(financialText, /Date\s*[:\-]?\s*(\d{1,2}[-/\s]\d{1,2}[-/\s]\d{4})/i));

  // GSTIN (15 chars)
  fields.gstNumber = 
    firstMatch(taxText, /\b(\d{2}[A-Z]{5}\d{4}[A-Z]\d[A-Z\d]Z[A-Z\d])\b/i) ??
    firstMatch(taxText, /GSTIN\s*(?:(?:UIN)?)\s*[:\-]?\s*([A-Z0-9]{15})\b/i) ??
    firstMatch(financialText, /\b(\d{2}[A-Z]{5}\d{4}[A-Z]\d[A-Z\d]Z[A-Z\d])\b/i);

  // Charge Categories
  const rc = await extractAmountForLabel(financialText, /Room\s*Charges?|Accommodation|Room\s*Revenue|Lodging|Room\s*Rent|Stay\s*Charges?/i, financialRows, reOcr);
  const hc = await extractAmountForLabel(financialText, /Hall\s*Charges?|Banquet(?:\s*Charges?)?|Conference\s*Hall|Meeting\s*Hall|Hall\s*Rental/i, financialRows, reOcr);
  const fc = await extractAmountForLabel(financialText, /Food\s*(?:&|and)?\s*(?:Beverages?|Service)|F\s*&\s*B|Restaurant|Food\s*Charges?|Catering/i, financialRows, reOcr);
  const oc = await extractAmountForLabel(financialText, /Other\s*charges?|Miscellaneous|Service\s*Charges?/i, financialRows, reOcr);

  fields.roomCharges = rc.value; fieldConfidences.roomCharges = rc.confidence; if (rc.suggested) suggestedFields.push('roomCharges');
  fields.hallCharges = hc.value; fieldConfidences.hallCharges = hc.confidence; if (hc.suggested) suggestedFields.push('hallCharges');
  fields.foodCharges = fc.value; fieldConfidences.foodCharges = fc.confidence; if (fc.suggested) suggestedFields.push('foodCharges');
  fields.otherCharges = oc.value; fieldConfidences.otherCharges = oc.confidence; if (oc.suggested) suggestedFields.push('otherCharges');

  // Cross-Validation for Other Charges (Cover Letter vs Tax Invoice)
  const ocTax = await extractAmountForLabel(taxText, /Other\s*charges?|Miscellaneous|Service\s*Charges?/i, taxRows, reOcr);
  if (ocTax.value !== undefined && ocTax.value !== fields.otherCharges) {
    // We will let the full reconciliation engine decide which one fits best later, 
    // but default to Tax Invoice value if Cover Letter value is significantly smaller (e.g. 400 vs 495)
    // as line-items are often more precise than cover letters.
    if (!fields.otherCharges || (ocTax.value > fields.otherCharges && ocTax.value < 100000)) {
       fields.otherCharges = ocTax.value;
       fieldConfidences.otherCharges = ocTax.confidence;
       if (ocTax.suggested) suggestedFields.push('otherCharges');
    }
  }

  // Labeled tax/total summary (prioritize bottom of the page)
  const sub = await extractAmountForLabel(financialText, /Taxable\s*Amount|Tax['’]?ble\s*Amt|Sub\s*[-]?\s*Total|Total\s*Charges?/i, financialRows, reOcr, 'bottom-up');
  const cgst = await extractAmountForLabel(taxText, /CGST/i, taxRows, reOcr, 'bottom-up');
  // For SGST, strictly ensure it's not a date match like "2026". The bottom-up scan already prioritizes the summary, 
  // but we enforce that the line actually contains the explicit letters SGST to prevent cross-contamination.
  const sgst = await extractAmountForLabel(taxText, /\bSGST\b|State\s*Tax/i, taxRows, reOcr, 'bottom-up');
  const igst = await extractAmountForLabel(taxText, /\bIGST\b|Integrated\s*Tax/i, taxRows, reOcr, 'bottom-up');
  const invAmt = await extractAmountForLabel(financialText, /Grand\s*Total|Tot\.?\s*Inv\.?\s*Amt|Total\s*Payable|Total\s*Amount|Invoice\s*Total/i, financialRows, reOcr, 'bottom-up');

  fields.subtotalAmount = sub.value; fieldConfidences.subtotalAmount = sub.confidence; if (sub.suggested) suggestedFields.push('subtotalAmount');
  fields.cgstAmount = cgst.value; fieldConfidences.cgstAmount = cgst.confidence; if (cgst.suggested) suggestedFields.push('cgstAmount');
  fields.sgstAmount = sgst.value; fieldConfidences.sgstAmount = sgst.confidence; if (sgst.suggested) suggestedFields.push('sgstAmount');
  fields.igstAmount = igst.value; fieldConfidences.igstAmount = igst.confidence; if (igst.suggested) suggestedFields.push('igstAmount');
  fields.invoiceAmount = invAmt.value; fieldConfidences.invoiceAmount = invAmt.confidence; if (invAmt.suggested) suggestedFields.push('invoiceAmount');

  // SGST Symmetrical Inference Rule
  // If CGST exists, SGST is missing, IGST is 0 (or missing), and state prefixes match
  const gstNumbers = Array.from(text.matchAll(/\b(\d{2}[A-Z]{5}\d{4}[A-Z]\d[A-Z\d]Z[A-Z\d])\b/gi)).map(m => m[1]);
  // If all GSTINs found start with the same 2 digits, it's intra-state. If there are none, we can't be sure, but we'll assume intra-state if cgst exists.
  const isIntraState = gstNumbers.length === 0 || gstNumbers.every(g => g.substring(0, 2) === gstNumbers[0].substring(0, 2));
  
  if (fields.cgstAmount && !fields.sgstAmount && !fields.igstAmount && isIntraState) {
    fields.sgstAmount = fields.cgstAmount;
    fieldConfidences.sgstAmount = fieldConfidences.cgstAmount;
    suggestedFields.push('sgstAmount');
  }

  // Same logic in reverse just in case
  if (fields.sgstAmount && !fields.cgstAmount && !fields.igstAmount && isIntraState) {
    fields.cgstAmount = fields.sgstAmount;
    fieldConfidences.cgstAmount = fieldConfidences.sgstAmount;
    suggestedFields.push('cgstAmount');
  }

  // Field Confidences for text fields
  fieldConfidences.invoiceNumber = fields.invoiceNumber ? 90 : 0;
  fieldConfidences.invoiceDate = fields.invoiceDate ? 90 : 0;
  fieldConfidences.gstNumber = fields.gstNumber ? 100 : 0;

  // --- FINANCIAL SANITY & DECIMAL RECOVERY LAYER ---
  const tC = fields.cgstAmount || 0;
  const tS = fields.sgstAmount || 0;
  const tI = fields.igstAmount || 0;
  const totalTax = tC + tS + tI;
  const grandTotal = fields.invoiceAmount || 0;
  const extSubtotal = fields.subtotalAmount || 0;

  // Attempt recovery on charge fields if they are implausibly large compared to Grand Total
  const chargeFields: Array<keyof ExtractedInvoiceFields> = ['roomCharges', 'foodCharges', 'hallCharges', 'otherCharges'];
  
  for (const field of chargeFields) {
    const rawVal = fields[field] as number | undefined;
    if (rawVal && grandTotal > 0 && rawVal > grandTotal) {
      console.info(`[AVEMS-DEBUG] Decimal Recovery triggered for ${field}: ${rawVal} > ${grandTotal}`);
      
      // Generate candidates
      const candidates = [
        rawVal,
        rawVal / 10,
        rawVal / 100,
        rawVal / 1000
      ];
      
      let bestCandidate = rawVal;
      let bestScore = -999999;

      for (const cand of candidates) {
        let score = 0;
        
        // Temporarily slot the candidate to test math
        const testSubtotal = 
          (field === 'roomCharges' ? cand : (fields.roomCharges || 0)) +
          (field === 'foodCharges' ? cand : (fields.foodCharges || 0)) +
          (field === 'hallCharges' ? cand : (fields.hallCharges || 0)) +
          (field === 'otherCharges' ? cand : (fields.otherCharges || 0));

        // Score against Extracted Subtotal (Strong signal)
        if (extSubtotal > 0) {
          if (Math.abs(testSubtotal - extSubtotal) <= 2) score += 100;
          else score -= Math.abs(testSubtotal - extSubtotal);
        }

        // Score against Grand Total (Strong signal)
        const testGrandTotal = testSubtotal + totalTax;
        if (Math.abs(testGrandTotal - grandTotal) <= 2) score += 100;
        else score -= Math.abs(testGrandTotal - grandTotal);
        
        // Operational Reality check bounds
        if (cand > 1000000) score -= 50; // Assume 10L+ for a single line item is unlikely unless it matches total

        if (score > bestScore) {
          bestScore = score;
          bestCandidate = cand;
        }
      }

      if (bestCandidate !== rawVal) {
        console.info(`[AVEMS-DEBUG] Recovered ${field}: ${rawVal} -> ${bestCandidate} (Score: ${bestScore})`);
        (fields as any)[field] = bestCandidate;
        suggestedFields.push(field);
      }
    }
  }
  // Full Reconciliation Engine (Defect #3)
  const calculateSubtotal = () => (fields.roomCharges || 0) + (fields.foodCharges || 0) + (fields.hallCharges || 0) + (fields.otherCharges || 0);
  const calculateTaxes = () => (fields.cgstAmount || 0) + (fields.sgstAmount || 0) + (fields.igstAmount || 0);
  
  const isMathBalanced = () => {
    const s = calculateSubtotal();
    const t = calculateTaxes();
    const g = fields.invoiceAmount || 0;
    return g > 0 && Math.abs((s + t) - g) <= 2;
  };

  // Financial Source Consistency Enforcement (Model A vs Model B)
  if (grandTotal > 0) {
    const s = calculateSubtotal();
    if (Math.abs(s - grandTotal) <= 2) {
      // Model A - Cover Letter Mode: Charges already reconcile to Grand Total. Taxes are inclusive.
      console.info(`[AVEMS-DEBUG] Model A Engaged: Subtotal equals Grand Total. Zeroing taxes to prevent double-counting.`);
      financialSourceMode = 'Cover Letter';
      fields.cgstAmount = 0;
      fields.sgstAmount = 0;
      fields.igstAmount = 0;
      suggestedFields.push('cgstAmount', 'sgstAmount', 'igstAmount');
    }
  }

  if (!isMathBalanced() && grandTotal > 0) {
    console.info(`[AVEMS-DEBUG] Math unbalanced. Running Full Reconciliation Engine...`);
    
    // 1. Try SGST = CGST if SGST is low confidence or weird (Tax Summary Block Fix)
    if (fields.cgstAmount && fields.cgstAmount > 0) {
      const originalSgst = fields.sgstAmount;
      fields.sgstAmount = fields.cgstAmount;
      if (isMathBalanced()) {
        console.info(`[AVEMS-DEBUG] Reconciliation SUCCESS by setting SGST = CGST (${fields.cgstAmount})`);
        suggestedFields.push('sgstAmount');
      } else {
        fields.sgstAmount = originalSgst; // revert
      }
    }

    // 2. Try falling back to Cover Letter Other Charges if we picked Tax Invoice earlier
    if (!isMathBalanced() && oc.value !== undefined && ocTax.value !== undefined && oc.value !== ocTax.value) {
      const originalOc = fields.otherCharges;
      fields.otherCharges = oc.value; // Try cover letter
      if (isMathBalanced()) {
        console.info(`[AVEMS-DEBUG] Reconciliation SUCCESS by reverting Other Charges to Cover Letter (${oc.value})`);
        suggestedFields.push('otherCharges');
      } else {
        fields.otherCharges = originalOc; // revert
      }
    }
    
    // 3. Try re-scoring low confidence charge fields
    if (!isMathBalanced()) {
       for (const field of chargeFields) {
         if (fieldConfidences[field] < 80) {
            const raw = fields[field] as number || 0;
            const alts = [raw / 10, raw / 100, raw / 1000, raw * 10, raw * 100];
            for (const alt of alts) {
              if (alt > 0 && alt < grandTotal) {
                fields[field] = alt;
                if (isMathBalanced()) {
                   console.info(`[AVEMS-DEBUG] Reconciliation SUCCESS by shifting decimal on ${field} to ${alt}`);
                   suggestedFields.push(field);
                   break;
                }
              }
            }
            if (isMathBalanced()) break;
            fields[field] = raw; // revert if didn't help
         }
       }
    }
  }
  // Cross-Field Validation & Rejection
  for (const field of chargeFields) {
    const val = fields[field] as number | undefined;
    // Reality check: > 1 crore is rejected entirely unless subtotal exactly matches grand total.
    if (val && val > 10000000) {
      console.warn(`[AVEMS-DEBUG] Reality Check Reject: ${field} = ${val} exceeds 1Cr operational bound.`);
      (fields as any)[field] = 0; // Clear hallucinated value
    }
  }

  // Final Validation Mismatch Check
  let validationMismatch = false;
  let validationMessage = '';

  const calculatedSub = calculateSubtotal();
  const calculatedGrand = calculatedSub + calculateTaxes();

  if (grandTotal > 0 && Math.abs(calculatedGrand - grandTotal) > 2) {
    validationMismatch = true;
    validationMessage = `Total mismatch: Extracted grand total is ₹${grandTotal}, but line items calculate to ₹${calculatedGrand}.`;
  } else if (extSubtotal && Math.abs(calculatedSub - extSubtotal) > 2 && Math.abs(calculatedGrand - grandTotal) > 2) {
    // Only throw subtotal mismatch if Grand Total also fails to reconcile
    validationMismatch = true;
    validationMessage = `Subtotal mismatch: Extracted subtotal is ₹${extSubtotal}, but charges calculate to ₹${calculatedSub}.`;
  }

  return { fields, validationMismatch, validationMessage, fieldConfidences, suggestedFields, financialSourceMode };
}

// ── Public API ───────────────────────────────────────────────────────────────

export interface ExtractionOptions {
  onProgress?: (info: { status: string; progress: number; page?: number; totalPages?: number }) => void;
  maxOcrPages?: number; // Limit OCR to first N pages to save time
}

export async function extractInvoiceFromPdf(file: File, options: ExtractionOptions = {}): Promise<ExtractionResult> {
  const startedAt = performance.now();
  
  // If it's a direct image file, just OCR it directly
  if (file.type.startsWith('image/')) {
    options.onProgress?.({ status: 'Initializing OCR...', progress: 0 });
    const { data } = await Tesseract.recognize(file, 'eng', {
      logger: m => {
        if (m.status === 'recognizing text') {
          options.onProgress?.({ status: 'Running OCR...', progress: m.progress, page: 1, totalPages: 1 });
        } else {
          options.onProgress?.({ status: m.status, progress: 0 });
        }
      }
    });
    
    const words: OcrWord[] = (data.words || []).map((w: any) => ({
      text: w.text,
      confidence: w.confidence,
      x0: w.bbox.x0,
      y0: w.bbox.y0,
      x1: w.bbox.x1,
      y1: w.bbox.y1,
      yCenter: (w.bbox.y0 + w.bbox.y1) / 2
    }));

    const rows = buildRows(words);
    const ocrPages: OcrPage[] = [{
      pageNumber: 1,
      pageType: classifyPage(data.text),
      text: data.text,
      words,
      rows: buildRows(words, 1) // Provide pageNum 1 for image
    }];
      
    return await buildResult(data.text, true, 'image', startedAt, ocrPages);
  }

  // PDF Processing
  const buffer = await file.arrayBuffer();
  options.onProgress?.({ status: 'Loading PDF...', progress: 0 });
  const pdf = await pdfjsLib.getDocument({ data: buffer }).promise;

  let fullText = '';
  options.onProgress?.({ status: 'Checking for text layer...', progress: 0 });
  
  for (let pageNum = 1; pageNum <= pdf.numPages; pageNum++) {
    const page = await pdf.getPage(pageNum);
    const content = await page.getTextContent();
    const pageText = content.items.map((item: any) => ('str' in item ? item.str : '')).join(' ');
    fullText += pageText + '\n';
  }

  const textLength = fullText.replace(/\s/g, '').length;
  const isLikelyScanned = textLength < 40; // near-empty text layer ⇒ scanned

  if (isLikelyScanned) {
    // Perform OCR on PDF pages
    fullText = '';
    const pagesToProcess = Math.min(pdf.numPages, options.maxOcrPages || 4); // Bumped default to 4 for packages
    
    const ocrPages: OcrPage[] = [];

    for (let pageNum = 1; pageNum <= pagesToProcess; pageNum++) {
      options.onProgress?.({ status: `Rendering page ${pageNum}...`, progress: 0, page: pageNum, totalPages: pagesToProcess });
      
      const page = await pdf.getPage(pageNum);
      // Scale 3.0 ensures reliable word-level bounding box generation without LSTM size limit chokes.
      // (Two-pass OCR handles the upscaling to 6.0 dynamically for specific noisy cells)
      const viewport = page.getViewport({ scale: 3.0 }); 
      
      const canvas = document.createElement('canvas');
      const context = canvas.getContext('2d')!;
      canvas.height = viewport.height;
      canvas.width = viewport.width;
      
      await page.render({ canvasContext: context, viewport }).promise;
      
      options.onProgress?.({ status: `Recognizing text...`, progress: 0, page: pageNum, totalPages: pagesToProcess });
      
      const { data } = await Tesseract.recognize(canvas, 'eng', {
        logger: m => {
          if (m.status === 'recognizing text') {
            options.onProgress?.({ 
              status: `Running OCR (Page ${pageNum})...`, 
              progress: m.progress
            });
          }
        }
      });
      fullText += data.text + '\n\n';

      const pageWords: OcrWord[] = (data.words || []).map((w: any) => {
        return {
          text: w.text,
          confidence: w.confidence,
          x0: w.bbox.x0,
          y0: w.bbox.y0,
          x1: w.bbox.x1,
          y1: w.bbox.y1,
          yCenter: (w.bbox.y0 + w.bbox.y1) / 2
        };
      });

      const pageType = classifyPage(data.text);
      const rows = buildRows(pageWords, pageNum);

      ocrPages.push({
        pageNumber: pageNum,
        pageType,
        text: data.text,
        words: pageWords,
        rows
      });
    }

    const reOcr: ReOcrCallback = async (pageNum, bbox) => {
      try {
        const page = await pdf.getPage(pageNum);
        const scale = 6.0;
        const viewport = page.getViewport({ scale });
        
        // Bbox is from the original 4.0 scale coords? No, bbox was from words at 4.0 scale!
        // We need to scale the bbox to 6.0.
        const ratio = 6.0 / 4.0;
        const sx = bbox.x0 * ratio;
        const sy = bbox.y0 * ratio;
        const sw = (bbox.x1 - bbox.x0) * ratio;
        const sh = (bbox.y1 - bbox.y0) * ratio;

        const canvas = document.createElement('canvas');
        const context = canvas.getContext('2d')!;
        
        // We only render the exact crop we need to save memory
        canvas.width = sw;
        canvas.height = sh;
        
        // Apply translation to crop
        const transform = [scale, 0, 0, scale, -sx, -sy];
        
        await page.render({
          canvasContext: context,
          transform: transform,
          viewport: page.getViewport({ scale: 1.0 }) // Base viewport, transform scales it
        }).promise;

        const { data } = await Tesseract.recognize(canvas, 'eng');
        // Calculate average confidence of the returned words
        const conf = data.words && data.words.length > 0 
          ? data.words.reduce((sum, w) => sum + w.confidence, 0) / data.words.length 
          : 0;

        return { text: data.text.trim(), confidence: conf };
      } catch (e) {
        console.error("Two-Pass OCR Error:", e);
        return undefined;
      }
    };

    return await buildResult(fullText, true, 'scanned-pdf', startedAt, ocrPages, reOcr);
  }

  return await buildResult(fullText, isLikelyScanned, 'digital-pdf', startedAt);
}

function buildRows(words: OcrWord[], pageNumber: number): OcrRow[] {
  // Sort all words by vertical center
  const sortedWords = [...words].sort((a, b) => a.yCenter - b.yCenter);

  const rows: OcrRow[] = [];
  let currentRow: OcrRow | null = null;
  // At scale 4.0 (300 DPI), vertical distances between words on the same line are larger.
  // 35px tolerance ensures words on the same line are correctly clustered into a single row.
  const Y_TOLERANCE = 35; 

  for (const w of sortedWords) {
    if (!currentRow) {
      currentRow = { words: [w], yCenter: w.yCenter, text: '', pageNumber };
      rows.push(currentRow);
    } else {
      // If word's center is within tolerance of row's center, append to row
      if (Math.abs(w.yCenter - currentRow.yCenter) <= Y_TOLERANCE) {
        currentRow.words.push(w);
        // Recalculate moving average of row center
        currentRow.yCenter = currentRow.words.reduce((sum, cw) => sum + cw.yCenter, 0) / currentRow.words.length;
      } else {
        // Start a new row
        currentRow = { words: [w], yCenter: w.yCenter, text: '', pageNumber };
        rows.push(currentRow);
      }
    }
  }

  // Finalize rows: sort words by X coordinate and generate text
  for (const row of rows) {
    row.words.sort((a, b) => a.x0 - b.x0);
    row.text = row.words.map(w => w.text).join(' ');
  }

  return rows;
}

async function buildResult(
  fullText: string, 
  isLikelyScanned: boolean, 
  source: 'digital-pdf' | 'scanned-pdf' | 'image', 
  startedAt: number, 
  ocrPages?: OcrPage[],
  reOcr?: ReOcrCallback
): Promise<ExtractionResult> {
  const extracted = await extractFields(fullText, ocrPages, reOcr);
  const fields = extracted.fields;

  const fieldsDetected = FIELD_KEYS.filter((k) => fields[k] !== undefined && fields[k] !== '');
  const fieldsMissing = FIELD_KEYS.filter((k) => !fieldsDetected.includes(k));
  const extractedCount = fieldsDetected.length;
  const textLength = fullText.replace(/\s/g, '').length;

  const metrics: ExtractionMetrics = {
    source,
    fieldsDetected: fieldsDetected as string[],
    fieldsMissing: fieldsMissing as string[],
    detectedCount: extractedCount,
    totalFields: FIELD_KEYS.length,
    textLength,
    durationMs: Math.round(performance.now() - startedAt),
    timestamp: new Date().toISOString(),
  };

  console.info('[AVEMS] Invoice extraction metrics:', JSON.stringify(metrics, null, 2));
  console.info('[AVEMS] OCR RAW TEXT:\n', fullText);
  console.info('[AVEMS] EXTRACTED FIELDS:', JSON.stringify(fields, null, 2));
  if (ocrPages) {
    console.info(`[AVEMS] BUILT ${ocrPages.length} COORDINATE PAGES.`);
  }

  return { 
    fields, 
    extractedCount, 
    textLength, 
    isLikelyScanned, 
    rawText: fullText, 
    ocrPages, 
    metrics, 
    validationMismatch: extracted.validationMismatch, 
    validationMessage: extracted.validationMessage, 
    fieldConfidences: extracted.fieldConfidences, 
    suggestedFields: extracted.suggestedFields,
    financialSourceMode: extracted.financialSourceMode
  };
}
