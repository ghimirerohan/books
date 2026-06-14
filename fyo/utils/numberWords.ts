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

/**
 * Nepali (Devanagari) cardinal words for 0-99. Nepali numbers are irregular, so
 * each value has its own word rather than a tens+ones composition.
 *
 * Note: spellings follow common usage; a native-speaker review is advisable
 * before release, as with the rest of the Nepali translations.
 */
const NP_0_TO_99 = [
  'शून्य',
  'एक',
  'दुई',
  'तीन',
  'चार',
  'पाँच',
  'छ',
  'सात',
  'आठ',
  'नौ',
  'दश',
  'एघार',
  'बाह्र',
  'तेह्र',
  'चौध',
  'पन्ध्र',
  'सोह्र',
  'सत्र',
  'अठार',
  'उन्नाइस',
  'बीस',
  'एक्काइस',
  'बाइस',
  'तेइस',
  'चौबिस',
  'पच्चिस',
  'छब्बिस',
  'सत्ताइस',
  'अठ्ठाइस',
  'उनन्तिस',
  'तीस',
  'एकतिस',
  'बत्तिस',
  'तेत्तिस',
  'चौँतिस',
  'पैँतिस',
  'छत्तिस',
  'सैँतिस',
  'अठतिस',
  'उनन्चालिस',
  'चालिस',
  'एकचालिस',
  'बयालिस',
  'त्रिचालिस',
  'चवालिस',
  'पैँतालिस',
  'छयालिस',
  'सच्चालिस',
  'अठचालिस',
  'उनन्चास',
  'पचास',
  'एकाउन्न',
  'बाउन्न',
  'त्रिपन्न',
  'चौवन्न',
  'पचपन्न',
  'छपन्न',
  'सन्ताउन्न',
  'अन्ठाउन्न',
  'उनन्साठी',
  'साठी',
  'एकसट्ठी',
  'बयसट्ठी',
  'त्रिसट्ठी',
  'चौंसट्ठी',
  'पैंसट्ठी',
  'छयसट्ठी',
  'सतसट्ठी',
  'अठसट्ठी',
  'उनन्सत्तरी',
  'सत्तरी',
  'एकहत्तर',
  'बहत्तर',
  'त्रिहत्तर',
  'चौहत्तर',
  'पचहत्तर',
  'छयहत्तर',
  'सतहत्तर',
  'अठहत्तर',
  'उनासी',
  'असी',
  'एकासी',
  'बयासी',
  'त्र्यासी',
  'चौरासी',
  'पचासी',
  'छयासी',
  'सतासी',
  'अठासी',
  'उनान्नब्बे',
  'नब्बे',
  'एकानब्बे',
  'बयानब्बे',
  'त्रियानब्बे',
  'चौरानब्बे',
  'पन्चानब्बे',
  'छयानब्बे',
  'सन्तानब्बे',
  'अन्ठानब्बे',
  'उनान्सय',
];

/** Spells a non-negative integer in Nepali using the lakh-crore grouping. */
export function integerToWordsNepali(num: number): string {
  num = Math.floor(Math.abs(num));
  if (num === 0) {
    return NP_0_TO_99[0];
  }

  const crore = Math.floor(num / 10_000_000);
  num %= 10_000_000;
  const lakh = Math.floor(num / 100_000);
  num %= 100_000;
  const thousand = Math.floor(num / 1_000);
  num %= 1_000;
  const hundred = Math.floor(num / 100);
  const rest = num % 100;

  const parts: string[] = [];
  if (crore) {
    parts.push(integerToWordsNepali(crore) + ' करोड');
  }
  if (lakh) {
    parts.push(NP_0_TO_99[lakh] + ' लाख');
  }
  if (thousand) {
    parts.push(NP_0_TO_99[thousand] + ' हजार');
  }
  if (hundred) {
    parts.push(NP_0_TO_99[hundred] + ' सय');
  }
  if (rest) {
    parts.push(NP_0_TO_99[rest]);
  }

  return parts.join(' ');
}

/**
 * Formats a monetary amount in Nepali (Devanagari) words, e.g.
 * `रुपैयाँ एक लाख तेइस हजार ... र पचास पैसा मात्र`.
 */
export function amountInWordsNepali(total: number): string {
  const fixed = Math.abs(total).toFixed(2);
  const [integerPart, decimalPart] = fixed.split('.');

  const rupees = integerToWordsNepali(parseInt(integerPart, 10));
  const paisa = parseInt(decimalPart, 10);

  let result = `रुपैयाँ ${rupees}`;
  if (paisa > 0) {
    result += ` र ${NP_0_TO_99[paisa]} पैसा`;
  }
  result += ' मात्र';
  return result;
}
