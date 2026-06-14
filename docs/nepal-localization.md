# Nepal Localization (नेपाली स्थानीयकरण)

Frappe Books ships with a Nepal-tailored mode that turns it into an authentic,
VAT-compliant, Bikram Sambat (BS) accounting product. Everything below is in the
base build — selecting **Nepal** in the setup wizard activates it.

## What you get

| Area                 | Details                                                                                                                                                                              |
| -------------------- | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------ |
| Chart of Accounts    | `Nepal - Chart of Accounts` (NFRS-aligned) with VAT, TDS, Excise, Customs accounts.                                                                                                  |
| Taxes                | VAT 13% / 0% / Exempt and TDS (1.5/5/10/15%) templates seeded at setup.                                                                                                              |
| Master data          | PAN, VAT No., Business Reg. No., IRD Office, tax-registration type; Province (7), District (77), local level, ward on addresses.                                                     |
| Calendar             | Full Bikram Sambat: BS display app-wide, Nepali date picker, BS-exact fiscal year (Shrawan 1 → Ashad end, e.g. FY 2081/82). Dates are stored as Gregorian internally — no migration. |
| Invoices             | IRD-format tax invoice (कर बीजक) and an abbreviated invoice (संक्षिप्त कर बीजक) for POS/B2C, bilingual, with PAN/VAT, BS date, 13% VAT line, and amount in words.                    |
| Amount in words      | Lakh-crore wording. Nepali (Devanagari) when the numeral system resolves to Devanagari, otherwise English lakh-crore.                                                                |
| Reports              | VAT Sales Book (बिक्री खाता), VAT Purchase Book (खरिद खाता), monthly VAT Return (मु.अ.कर विवरण), and TDS Report. CSV/JSON export. Under the **VAT & Tax** sidebar section.           |
| IRD / CBMS e-billing | Real-time bill sync + immutable IRD Billing Log. **Disabled by default.**                                                                                                            |
| Numerals & language  | Numeral System setting (Auto / Devanagari / Latin); Nepali UI strings in `translations/np.csv`.                                                                                      |

## Enabling IRD / CBMS real-time billing

CBMS is fully built but dormant until configured. When off, **no network calls
are made** and submitting an invoice only writes the local IRD Billing Log.

1. Go to **Settings → IRD / CBMS**.
2. Tick **Enable CBMS Real-time Billing**.
3. Enter the seller PAN, CBMS username/password, API URL, and environment.
4. Keep **Sync Invoices on Submit** on for automatic real-time push.

Live use requires your billing software to be registered with the Inland
Revenue Department and valid CBMS credentials. Each submitted sales invoice is
recorded in **VAT & Tax → IRD Billing Log** with its sync status.

## Manual QA checklist

These flows need a real Electron build with a database (they can't be exercised
by unit tests):

- [ ] Setup wizard → **Nepal**: currency NPR, locale ne-NP, Nepal COA, VAT/TDS
      tax templates created, fiscal year shows the current BS year.
- [ ] Create a customer/supplier with a 9-digit PAN; a non-9-digit PAN is
      rejected.
- [ ] Create a sales invoice with the `VAT-13` tax; confirm Output VAT posts and
      the date picker shows BS.
- [ ] Print the **Nepal Tax Invoice** and **Abbreviated Invoice**: PAN/VAT, BS
      date, 13% VAT line, and amount in words render; switch Numeral System to
      Latin and confirm digits/words change.
- [ ] Open VAT Sales/Purchase Books and the VAT Return; confirm the return's net
      VAT reconciles with the General Ledger VAT account.
- [ ] Settings → IRD / CBMS exists and is OFF by default; with it OFF, submitting
      an invoice makes no network call but still adds an IRD Billing Log row.

## Known caveats

- **Nepali word/translation review:** the Nepali strings in `translations/np.csv`
  and the Devanagari amount-in-words table (`fyo/utils/numberWords.ts`) follow
  common usage but should get a native-speaker review before release.
- **CBMS endpoint:** the API URL/payload follow the IRD CBMS bill format but
  must be confirmed against current IRD documentation for your registration.
- **Fiscal year drift:** the Gregorian fiscal-year fields are derived from BS, so
  they shift each year by design; always trust the BS-derived dates.
