import { SalesInvoice as BaseSalesInvoice } from 'models/baseModels/SalesInvoice/SalesInvoice';
import { recordIRDBilling } from './cbms';

/**
 * Nepal sales invoice: records each submitted invoice in the IRD Billing Log
 * and, when CBMS is enabled in IRD Settings, pushes it to the IRD in real time.
 */
export class SalesInvoice extends BaseSalesInvoice {
  async afterSubmit(): Promise<void> {
    await super.afterSubmit();
    await recordIRDBilling(this);
  }
}
