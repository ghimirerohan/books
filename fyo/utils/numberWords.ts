/**
 * Number-to-words for the South Asian (Nepali / Indian) lakh-crore system.
 *
 * Nepali tax invoices (कर बीजक) must show the amount in words, grouped by
 * thousand / lakh / crore rather than thousand / million / billion. This module
 * is pure (no app dependencies) so it can be unit tested in isolation and used
 * from both the print-template layer and reports.
 */

const ONES = [
  '',
  'One',
  'Two',
  'Three',
  'Four',
  'Five',
  'Six',
  'Seven',
  'Eight',
  'Nine',
  'Ten',
  'Eleven',
  'Twelve',
  'Thirteen',
  'Fourteen',
  'Fifteen',
  'Sixteen',
  'Seventeen',
  'Eighteen',
  'Nineteen',
];

const TENS = [
  '',
  '',
  'Twenty',
  'Thirty',
  'Forty',
  'Fifty',
  'Sixty',
  'Seventy',
  'Eighty',
  'Ninety',
];

/** Spells a number 0-99. Returns '' for 0. */
function twoDigitToWords(n: number): string {
  if (n <= 0) {
    return '';
  }
  if (n < 20) {
    return ONES[n];
  }
  const tens = Math.floor(n / 10);
  const ones = n % 10;
  return TENS[tens] + (ones ? ' ' + ONES[ones] : '');
}

/** Spells a number 0-999. Returns '' for 0. */
function threeDigitToWords(n: number): string {
  const hundred = Math.floor(n / 100);
  const rest = n % 100;
  let result = '';
  if (hundred) {
    result += ONES[hundred] + ' Hundred';
  }
  if (rest) {
    result += (hundred ? ' ' : '') + twoDigitToWords(rest);
  }
  return result;
}

/**
 * Spells a non-negative integer using the lakh-crore grouping
 * (... Crore, Lakh, Thousand, Hundred).
 */
export function integerToWordsIndian(num: number): string {
  num = Math.floor(Math.abs(num));
  if (num === 0) {
    return 'Zero';
  }

  const crore = Math.floor(num / 10_000_000);
  num %= 10_000_000;
  const lakh = Math.floor(num / 100_000);
  num %= 100_000;
  const thousand = Math.floor(num / 1_000);
  const hundred = num % 1_000;

  const parts: string[] = [];
  if (crore) {
    // Recurse so values above 99 crore (arab and beyond) are handled.
    parts.push(integerToWordsIndian(crore) + ' Crore');
  }
  if (lakh) {
    parts.push(twoDigitToWords(lakh) + ' Lakh');
  }
  if (thousand) {
    parts.push(twoDigitToWords(thousand) + ' Thousand');
  }
  if (hundred) {
    parts.push(threeDigitToWords(hundred));
  }

  return parts.join(' ');
}

/**
 * Formats a monetary amount in words using the lakh-crore system, e.g.
 * `Rupees One Lakh Twenty Three Thousand Four Hundred Fifty and Fifty Paisa only`.
 */
export function amountInWordsIndian(
  total: number,
  currency = 'Rupees',
  fraction = 'Paisa'
): string {
  const fixed = Math.abs(total).toFixed(2);
  const [integerPart, decimalPart] = fixed.split('.');

  const rupees = integerToWordsIndian(parseInt(integerPart, 10));
  const paisa = parseInt(decimalPart, 10);

  let result = `${currency} ${rupees}`;
  if (paisa > 0) {
    result += ` and ${twoDigitToWords(paisa)} ${fraction}`;
  }
  result += ' only';
  return result;
}
