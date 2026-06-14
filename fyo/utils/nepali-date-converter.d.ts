/**
 * Ambient type declaration for `nepali-date-converter`.
 *
 * The published package ships type definitions under `dist/types` but does not
 * reference them via the `types` field in its package.json, so TypeScript cannot
 * resolve them automatically. This minimal declaration exposes the subset of the
 * API used by the app.
 */
declare module 'nepali-date-converter' {
  export interface IYearMonthDate {
    year: number;
    month: number;
    date: number;
    day: number;
  }

  export default class NepaliDate {
    constructor(value?: string | number | Date);
    constructor(year: number, monthIndex: number, date: number);

    static language: 'np' | 'en';
    static fromAD(date: Date): NepaliDate;
    static now(): NepaliDate;
    static parse(dateString: string): NepaliDate;

    toJsDate(): Date;
    getDate(): number;
    getYear(): number;
    getDay(): number;
    getMonth(): number;
    getBS(): IYearMonthDate;
    getAD(): IYearMonthDate;
    setDate(date: number): void;
    setMonth(month: number): void;
    setYear(year: number): void;
    format(formatString: string, language?: 'en' | 'np'): string;
    valueOf(): number;
    toString(): string;
  }
}
