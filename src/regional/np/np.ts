import { Fyo } from 'fyo';

export type TaxType = 'VAT' | 'Exempt-VAT' | 'TDS';

/**
 * Seeds Nepal-specific tax templates during company setup.
 *
 * - VAT: standard 13% plus 0% (zero-rated / export), posted to the `VAT`
 *   account. A single VAT account nets input (purchase) against output
 *   (sales) VAT, so its balance is the VAT payable / creditable for the period.
 * - Exempt-VAT: 0% supplies that are exempt (not zero-rated), posted to the
 *   `Exempt` account so they can be reported separately.
 * - TDS: common withholding (अग्रिम कर कट्टी) rates, posted to `TDS Payable`.
 */
export async function createNepalRecords(fyo: Fyo) {
  await createTaxes(fyo);
}

async function createTaxes(fyo: Fyo) {
  const taxes: Record<TaxType, number[]> = {
    VAT: [13, 0],
    'Exempt-VAT': [0],
    TDS: [15, 10, 5, 1.5],
  };

  for (const type of Object.keys(taxes) as TaxType[]) {
    for (const percent of taxes[type]) {
      const name = `${type}-${percent}`;
      const details = getTaxDetails(type, percent);

      const newTax = fyo.doc.getNewDoc('Tax', { name, details });
      await newTax.sync();
    }
  }
}

function getTaxDetails(type: TaxType, percent: number) {
  const accountMap: Record<TaxType, string> = {
    VAT: 'VAT',
    'Exempt-VAT': 'Exempt',
    TDS: 'TDS Payable',
  };

  return [
    {
      account: accountMap[type],
      rate: percent,
    },
  ];
}
