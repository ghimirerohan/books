import {
  districtList,
  getProvinceForDistrict,
  isValidPan,
} from 'regional/np';
import test from 'tape';

test('np regional: PAN validation (9 digits)', function (t) {
  t.equal(isValidPan('123456789'), true, 'valid 9 digit');
  t.equal(isValidPan('12345678'), false, 'too short');
  t.equal(isValidPan('1234567890'), false, 'too long');
  t.equal(isValidPan('12345678A'), false, 'non-numeric');
  t.equal(isValidPan(''), false, 'empty');
  t.end();
});

test('np regional: province lookup and district coverage', function (t) {
  t.equal(districtList.length, 77, '77 districts');
  t.equal(getProvinceForDistrict('Kathmandu'), 'Bagmati', 'Kathmandu');
  t.equal(getProvinceForDistrict('Kaski'), 'Gandaki', 'Kaski');
  t.equal(getProvinceForDistrict('Jhapa'), 'Koshi', 'Jhapa');
  t.equal(getProvinceForDistrict('Nowhere'), '', 'unknown district');
  t.end();
});
