import {
  amountInWordsIndian,
  integerToWordsIndian,
} from 'fyo/utils/numberWords';
import test from 'tape';

test('numberWords: integer to words (lakh-crore)', function (t) {
  t.equal(integerToWordsIndian(0), 'Zero', '0');
  t.equal(integerToWordsIndian(7), 'Seven', '7');
  t.equal(integerToWordsIndian(15), 'Fifteen', '15');
  t.equal(integerToWordsIndian(80), 'Eighty', '80');
  t.equal(integerToWordsIndian(99), 'Ninety Nine', '99');
  t.equal(integerToWordsIndian(100), 'One Hundred', '100');
  t.equal(integerToWordsIndian(450), 'Four Hundred Fifty', '450');
  t.equal(integerToWordsIndian(1000), 'One Thousand', '1000');
  t.equal(
    integerToWordsIndian(123450),
    'One Lakh Twenty Three Thousand Four Hundred Fifty',
    '1,23,450'
  );
  t.equal(
    integerToWordsIndian(10000000),
    'One Crore',
    '1 crore'
  );
  t.equal(
    integerToWordsIndian(12345678),
    'One Crore Twenty Three Lakh Forty Five Thousand Six Hundred Seventy Eight',
    '1,23,45,678'
  );
  t.end();
});

test('numberWords: amount in words with paisa', function (t) {
  t.equal(
    amountInWordsIndian(0),
    'Rupees Zero only',
    'zero'
  );
  t.equal(
    amountInWordsIndian(1500),
    'Rupees One Thousand Five Hundred only',
    'no paisa'
  );
  t.equal(
    amountInWordsIndian(123450.5),
    'Rupees One Lakh Twenty Three Thousand Four Hundred Fifty and Fifty Paisa only',
    'with paisa'
  );
  t.equal(
    amountInWordsIndian(99.99),
    'Rupees Ninety Nine and Ninety Nine Paisa only',
    'rounding'
  );
  t.end();
});
