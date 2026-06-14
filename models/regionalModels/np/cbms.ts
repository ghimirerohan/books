/**
 * IRD / CBMS (Central Billing Monitoring System) integration for Nepal.
 *
 * This module is fully built but DORMANT by default: nothing is sent over the
 * network unless a user explicitly enables CBMS in IRD Settings and provides
 * credentials. Every submitted sales invoice is recorded in an immutable local
 * IRD Billing Log (the materialized, audit-friendly record IRD expects); the
 * real-time push to the CBMS happens only when enabled.
 *
 * Live use requires the billing software to be registered with the Inland
 * Revenue Department and valid CBMS credentials.
 */
import { DocValueMap } from 'fyo/core/types';
import { Money } from 'pesa';
import { Invoice } from 'models/baseModels/Invoice/Invoice';
import { ModelNameEnum } from 'models/types';
import {
  bsFiscalYearLabel,
  formatBs,
  getBsFiscalYear,
} from 'fyo/utils/nepaliDate';

/** Account name used for VAT in the Nepal chart of accounts. */
const VAT_ACCOUNT = 'VAT';

export interface CbmsPayloadArgs {
  username: string;
  password: string;
  sellerPan: string;
  buyerPan: string;
  buyerName: string;
  invoiceNumber: string;
  date: Date;
  taxableAmount: number;
  vatAmount: number;
  totalAmount: number;
  isRealtime: boolean;
}

export interface CbmsPayload {
  username: string;
  password: string;
  seller_pan: string;
  buyer_pan: string;
  buyer_name: string;
  fiscal_year: string;
  invoice_number: string;
  invoice_date: string;
  invoice_date_ad: string;
  total_sales: number;
  taxable_sales_vat: number;
  vat: number;
  excisable_amount: number;
  excise: number;
  taxable_sales_hst: number;
  hst: number;
  amount_for_esf: number;
  esf: number;
  export_sales: number;
  tax_exempted_sales: number;
  isrealtime: boolean;
  datetimeclient: string;
}

/**
 * Builds the CBMS bill payload from invoice values. Pure - no app/network
 * dependencies - so it can be unit tested. Field names follow the IRD CBMS
 * bill API.
 */
export function buildCbmsPayload(args: CbmsPayloadArgs): CbmsPayload {
  const startBsYear = getBsFiscalYear(args.date);

  return {
    username: args.username,
    password: args.password,
    seller_pan: args.sellerPan,
    buyer_pan: args.buyerPan,
    buyer_name: args.buyerName,
    fiscal_year: bsFiscalYearLabel(startBsYear),
    invoice_number: args.invoiceNumber,
    invoice_date: formatBs(args.date, 'yyyy-MM-dd'),
    invoice_date_ad: args.date.toISOString().slice(0, 10),
    total_sales: args.totalAmount,
    taxable_sales_vat: args.taxableAmount,
    vat: args.vatAmount,
    excisable_amount: 0,
    excise: 0,
    taxable_sales_hst: 0,
    hst: 0,
    amount_for_esf: 0,
    esf: 0,
    export_sales: 0,
    tax_exempted_sales: 0,
    isrealtime: args.isRealtime,
    datetimeclient: new Date().toISOString(),
  };
}

interface CbmsResult {
  ok: boolean;
  status: number;
  response: string;
}

/** Posts a payload to the CBMS endpoint. Never throws. */
async function postToCbms(
  apiUrl: string,
  payload: CbmsPayload
): Promise<CbmsResult> {
  try {
    const fetchFn = (globalThis as { fetch?: typeof fetch }).fetch;
    if (typeof fetchFn !== 'function') {
      return { ok: false, status: 0, response: 'fetch unavailable' };
    }

    const res = await fetchFn(apiUrl, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(payload),
    });

    const text = await res.text();
    return { ok: res.ok, status: res.status, response: text.slice(0, 2000) };
  } catch (error) {
    return {
      ok: false,
      status: 0,
      response: error instanceof Error ? error.message : String(error),
    };
  }
}

/**
 * Records a submitted sales invoice in the IRD Billing Log and, when CBMS is
 * enabled, pushes it to the CBMS in real time. Designed to never throw: a
 * logging or sync failure must not block invoice submission.
 */
export async function recordIRDBilling(doc: Invoice): Promise<void> {
  const fyo = doc.fyo;

  try {
    if (!doc.name) {
      return;
    }

    const settings = fyo.singles.IRDSettings;
    const cbmsEnabled = !!settings?.get('cbmsEnabled');
    const syncOnSubmit = settings?.get('syncOnSubmit') !== false;
    const doSync = cbmsEnabled && syncOnSubmit;

    let vatAmount = 0;
    for (const tax of doc.taxes ?? []) {
      if (tax.account === VAT_ACCOUNT) {
        vatAmount += tax.amount?.float ?? 0;
      }
    }

    const date = (doc.date as Date) ?? new Date();
    const taxableAmount = (doc.netTotal as Money)?.float ?? 0;
    const totalAmount = (doc.grandTotal as Money)?.float ?? 0;

    let buyerPan = '';
    if (doc.party) {
      const pan = await fyo.getValue('Party', doc.party, 'pan');
      buyerPan = typeof pan === 'string' ? pan : '';
    }

    const data = {
      fiscalYear: bsFiscalYearLabel(getBsFiscalYear(date)),
      billDate: formatBs(date, 'yyyy-MM-dd'),
      party: doc.party ?? '',
      buyerPan,
      taxableAmount,
      vatAmount,
      totalAmount,
      isRealtime: doSync,
      cbmsStatus: cbmsEnabled ? 'Not Synced' : 'Disabled',
    } as DocValueMap;

    if (doSync) {
      const payload = buildCbmsPayload({
        username: (settings?.get('username') as string) ?? '',
        password: (settings?.get('password') as string) ?? '',
        sellerPan: (settings?.get('sellerPan') as string) ?? '',
        buyerPan,
        buyerName: doc.party ?? '',
        invoiceNumber: doc.name,
        date,
        taxableAmount,
        vatAmount,
        totalAmount,
        isRealtime: true,
      });

      const apiUrl = (settings?.get('apiUrl') as string) ?? '';
      const result = await postToCbms(apiUrl, payload);
      data.cbmsStatus = result.ok ? 'Synced' : 'Failed';
      data.cbmsResponse = result.response;
      if (result.ok) {
        data.syncedAt = new Date();
      }
    }

    const exists = await fyo.db.exists(ModelNameEnum.IRDBillingLog, doc.name);
    if (exists) {
      const log = await fyo.doc.getDoc(ModelNameEnum.IRDBillingLog, doc.name);
      await log.set(data);
      await log.sync();
    } else {
      const log = fyo.doc.getNewDoc(ModelNameEnum.IRDBillingLog, {
        name: doc.name,
        ...data,
      });
      await log.sync();
    }
  } catch (error) {
    // Never block invoice submission on a logging/sync failure.
    // eslint-disable-next-line no-console
    console.error('IRD billing log failed:', error);
  }
}

// Re-exported for tests / potential manual retries.
export { postToCbms };
