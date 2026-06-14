/**
 * Static regional data for Nepal (np).
 *
 * Provinces, districts and local-level types used by the Nepal regional
 * Address model. Nepal's federal structure: 7 provinces, 77 districts.
 */

export const provinceList = [
  'Koshi',
  'Madhesh',
  'Bagmati',
  'Gandaki',
  'Lumbini',
  'Karnali',
  'Sudurpashchim',
] as const;

export type Province = typeof provinceList[number];

/**
 * Province -> districts. Together these cover all 77 districts of Nepal.
 */
export const provinceDistrictMap: Record<Province, string[]> = {
  Koshi: [
    'Bhojpur',
    'Dhankuta',
    'Ilam',
    'Jhapa',
    'Khotang',
    'Morang',
    'Okhaldhunga',
    'Panchthar',
    'Sankhuwasabha',
    'Solukhumbu',
    'Sunsari',
    'Taplejung',
    'Terhathum',
    'Udayapur',
  ],
  Madhesh: [
    'Bara',
    'Dhanusha',
    'Mahottari',
    'Parsa',
    'Rautahat',
    'Saptari',
    'Sarlahi',
    'Siraha',
  ],
  Bagmati: [
    'Bhaktapur',
    'Chitwan',
    'Dhading',
    'Dolakha',
    'Kathmandu',
    'Kavrepalanchok',
    'Lalitpur',
    'Makwanpur',
    'Nuwakot',
    'Ramechhap',
    'Rasuwa',
    'Sindhuli',
    'Sindhupalchok',
  ],
  Gandaki: [
    'Baglung',
    'Gorkha',
    'Kaski',
    'Lamjung',
    'Manang',
    'Mustang',
    'Myagdi',
    'Nawalpur',
    'Parbat',
    'Syangja',
    'Tanahun',
  ],
  Lumbini: [
    'Arghakhanchi',
    'Banke',
    'Bardiya',
    'Dang',
    'Gulmi',
    'Kapilvastu',
    'Nawalparasi',
    'Palpa',
    'Pyuthan',
    'Rolpa',
    'Rukum East',
    'Rupandehi',
  ],
  Karnali: [
    'Dailekh',
    'Dolpa',
    'Humla',
    'Jajarkot',
    'Jumla',
    'Kalikot',
    'Mugu',
    'Rukum West',
    'Salyan',
    'Surkhet',
  ],
  Sudurpashchim: [
    'Achham',
    'Baitadi',
    'Bajhang',
    'Bajura',
    'Dadeldhura',
    'Darchula',
    'Doti',
    'Kailali',
    'Kanchanpur',
  ],
};

/**
 * Flat, sorted list of all 77 districts.
 */
export const districtList: string[] = Object.values(provinceDistrictMap)
  .flat()
  .sort();

/**
 * Returns the province a district belongs to, or '' if unknown.
 */
export function getProvinceForDistrict(district: string): Province | '' {
  for (const province of provinceList) {
    if (provinceDistrictMap[province].includes(district)) {
      return province;
    }
  }
  return '';
}

/**
 * Local-level (tier) types under Nepal's federal structure.
 */
export const localLevelTypes = [
  'Metropolitan City',
  'Sub-Metropolitan City',
  'Municipality',
  'Rural Municipality',
] as const;

/**
 * A Nepali PAN (Permanent Account Number) / VAT registration number is a
 * 9-digit number issued by the Inland Revenue Department.
 */
export function isValidPan(pan: string): boolean {
  return /^\d{9}$/.test(pan);
}
