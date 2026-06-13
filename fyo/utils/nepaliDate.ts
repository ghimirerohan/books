/**
 * Bikram Sambat (BS / बि.सं.) calendar helpers for Nepal.
 *
 * Frappe Books stores all dates internally as Gregorian (AD) ISO values. This
 * module is a thin presentation + input layer that converts to/from BS and
 * formats BS dates using the app's existing Luxon-style date format patterns,
 * so no database migration is needed to support the Nepali calendar.
 *
 * Conversion is delegated to `nepali-date-converter`, a well-tested, dependency
 * free package whose calendar data is validated against the official Nepali
 * calendar.
 */
import NepaliDate from 'nepali-date-converter';

/** BS month names, index 0 = Baisakh ... 11 = Chaitra. */
export const bsMonthsEn = [
  'Baisakh',
  'Jestha',
  'Asar',
  'Shrawan',
  'Bhadra',
  'Aswin',
  'Kartik',
  'Mangsir',
  'Poush',
  'Magh',
  'Falgun',
  'Chaitra',
];

export const bsMonthsNp = [
  'बैशाख',
  'जेठ',
  'असार',
  'श्रावण',
  'भदौ',
  'असोज',
  'कार्तिक',
  'मंसिर',
  'पुष',
  'माघ',
  'फाल्गुन',
  'चैत',
];

export const bsWeekdaysEn = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];
export const bsWeekdaysNp = [
  'आइत',
  'सोम',
  'मंगल',
  'बुध',
  'बिहि',
  'शुक्र',
  'शनि',
];

/** Month index (0-based) on which the Nepali fiscal year starts: Shrawan. */
export const FISCAL_YEAR_START_MONTH_INDEX = 3;

export interface BsDate {
  /** BS year, e.g. 2081 */
  year: number;
  /** BS month, 1 (Baisakh) - 12 (Chaitra) */
  month: number;
  /** BS day of month, 1 - 32 */
  day: number;
}

/** Converts an AD `Date` to its BS components (month is 1-indexed). */
export function adToBs(date: Date): BsDate {
  const bs = new NepaliDate(date).getBS();
  return { year: bs.year, month: bs.month + 1, day: bs.date };
}

/** Converts BS components (month 1-indexed) to an AD `Date`. */
export function bsToAd(year: number, month: number, day: number): Date {
  return new NepaliDate(year, month - 1, day).toJsDate();
}

const DEVANAGARI_DIGITS = ['०', '१', '२', '३', '४', '५', '६', '७', '८', '९'];

/** Converts the ASCII digits in a string to Devanagari numerals. */
export function toDevanagariDigits(value: string): string {
  return value.replace(/[0-9]/g, (d) => DEVANAGARI_DIGITS[Number(d)]);
}

/**
 * Translates an app (Luxon) date format string to the token syntax used by
 * `nepali-date-converter`. Only the day/month/year tokens used by the app's
 * configurable date formats are mapped.
 */
export function luxonToBsFormat(format: string): string {
  return format.replace(/yyyy|yy|y|MMMM|MMM|MM|M|dd|d/g, (token) => {
    switch (token) {
      case 'yyyy':
      case 'y':
        return 'YYYY';
      case 'yy':
        return 'YY';
      case 'MMMM':
        return 'MMMM';
      case 'MMM':
        return 'MMM';
      case 'MM':
        return 'MM';
      case 'M':
        return 'M';
      case 'dd':
        return 'DD';
      case 'd':
        return 'D';
      default:
        return token;
    }
  });
}

/**
 * Formats an AD `Date` as a BS date string using an app (Luxon) date format.
 * When `devanagari` is true, Nepali month names and Devanagari digits are used.
 */
export function formatBs(
  date: Date,
  format: string,
  devanagari = false
): string {
  return new NepaliDate(date).format(
    luxonToBsFormat(format),
    devanagari ? 'np' : 'en'
  );
}

/** Number of days in a given BS month (month 1-indexed). */
export function daysInBsMonth(year: number, month: number): number {
  const first = bsToAd(year, month, 1);
  const nextMonth = month === 12 ? 1 : month + 1;
  const nextYear = month === 12 ? year + 1 : year;
  const nextFirst = bsToAd(nextYear, nextMonth, 1);
  return Math.round((nextFirst.getTime() - first.getTime()) / 86_400_000);
}

/**
 * Returns the starting BS year of the Nepali fiscal year (आर्थिक वर्ष) that the
 * given AD date falls in. The fiscal year runs Shrawan 1 -> Ashad end, so dates
 * before Shrawan belong to the previous fiscal year.
 */
export function getBsFiscalYear(date: Date): number {
  const { year, month } = adToBs(date);
  // month is 1-indexed; Shrawan = 4
  return month >= FISCAL_YEAR_START_MONTH_INDEX + 1 ? year : year - 1;
}

/**
 * Returns the AD start (Shrawan 1 of `startBsYear`) and end (Ashad end of
 * `startBsYear + 1`) for a Nepali fiscal year. The end is computed as the day
 * before Shrawan 1 of the following year, which is robust to month-length
 * variation.
 */
export function bsFiscalYearToAdRange(startBsYear: number): {
  start: Date;
  end: Date;
} {
  const start = bsToAd(startBsYear, FISCAL_YEAR_START_MONTH_INDEX + 1, 1);
  const nextStart = bsToAd(
    startBsYear + 1,
    FISCAL_YEAR_START_MONTH_INDEX + 1,
    1
  );
  const end = new Date(nextStart.getTime() - 86_400_000);
  return { start, end };
}

/** Human-readable label for a Nepali fiscal year, e.g. `2081/82`. */
export function bsFiscalYearLabel(startBsYear: number): string {
  const next = String((startBsYear + 1) % 100).padStart(2, '0');
  return `${startBsYear}/${next}`;
}
