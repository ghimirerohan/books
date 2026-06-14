import { t } from 'fyo';
import { ModelNameEnum } from 'models/types';
import { BaseVATBook } from './BaseVATBook';

/** Sales Book (बिक्री खाता) - VAT annex for sales invoices. */
export class VATSalesBook extends BaseVATBook {
  static title = t`VAT Sales Book`;
  static reportName = 'vat-sales-book';

  schemaName = ModelNameEnum.SalesInvoice;
}
