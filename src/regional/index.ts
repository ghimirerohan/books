import { Fyo } from 'fyo';
import { createIndianRecords } from './in/in';
import { createNepalRecords } from './np/np';

export async function createRegionalRecords(country: string, fyo: Fyo) {
  if (country === 'India') {
    await createIndianRecords(fyo);
  }

  if (country === 'Nepal') {
    await createNepalRecords(fyo);
  }

  return;
}
