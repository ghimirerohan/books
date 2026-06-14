import {
  adToBs,
  bsFiscalYearLabel,
  bsFiscalYearToAdRange,
  bsMonthToAdRange,
  bsToAd,
  formatBs,
  getBsFiscalYear,
  luxonToBsFormat,
  toDevanagariDigits,
} from 'fyo/utils/nepaliDate';
import test from 'tape';

function ymd(date: Date): string {
  const y = date.getFullYear();
  const m = String(date.getMonth() + 1).padStart(2, '0');
  const d = String(date.getDate()).padStart(2, '0');
  return `${y}-${m}-${d}`;
}

test('nepaliDate: AD -> BS conversion', function (t) {
  // 2024-07-16 (AD) is Shrawan 1, 2081 (BS) - start of FY 2081/82
  const bs = adToBs(new Date(2024, 6, 16));
  t.equal(bs.year, 2081, 'year');
  t.equal(bs.month, 4, 'month (Shrawan = 4)');
  t.equal(bs.day, 1, 'day');
  t.end();
});

test('nepaliDate: BS -> AD conversion and round trip', function (t) {
  const ad = bsToAd(2081, 4, 1);
  t.equal(ymd(ad), '2024-07-16', 'BS 2081 Shrawan 1 -> AD');

  const bs = adToBs(ad);
  t.equal(`${bs.year}-${bs.month}-${bs.day}`, '2081-4-1', 'round trip');
  t.end();
});

test('nepaliDate: fiscal year detection (Shrawan -> Ashad)', function (t) {
  // Jestha (before Shrawan) belongs to the previous fiscal year.
  t.equal(getBsFiscalYear(new Date(2026, 5, 13)), 2082, 'before Shrawan');
  // Shrawan 1 starts a new fiscal year.
  t.equal(getBsFiscalYear(new Date(2024, 6, 16)), 2081, 'on Shrawan 1');
  t.end();
});

test('nepaliDate: fiscal year AD range and label', function (t) {
  const range = bsFiscalYearToAdRange(2082);
  t.equal(ymd(range.start), '2025-07-17', 'FY 2082/83 start');
  t.equal(ymd(range.end), '2026-07-16', 'FY 2082/83 end');
  t.equal(bsFiscalYearLabel(2081), '2081/82', 'label');
  t.end();
});

test('nepaliDate: BS month to AD range', function (t) {
  // Shrawan 2081 ran 2024-07-16 .. 2024-08-16 (32 days).
  const range = bsMonthToAdRange(2081, 4);
  t.equal(ymd(range.start), '2024-07-16', 'Shrawan 2081 start');
  t.equal(ymd(range.end), '2024-08-16', 'Shrawan 2081 end');
  t.end();
});

test('nepaliDate: format token translation', function (t) {
  t.equal(luxonToBsFormat('dd/MM/yyyy'), 'DD/MM/YYYY', 'dd/MM/yyyy');
  t.equal(luxonToBsFormat('MMM d, y'), 'MMM D, YYYY', 'MMM d, y');
  t.equal(luxonToBsFormat('yyyy-MM-dd'), 'YYYY-MM-DD', 'yyyy-MM-dd');
  t.end();
});

test('nepaliDate: BS formatting', function (t) {
  t.equal(
    formatBs(new Date(2024, 6, 16), 'yyyy-MM-dd'),
    '2081-04-01',
    'formatBs ISO'
  );
  t.equal(toDevanagariDigits('2081'), '२०८१', 'devanagari digits');
  t.end();
});
