import { t } from 'fyo';
import { ModelNameEnum } from 'models/types';
import { BaseVATBook } from './BaseVATBook';

/** Purchase Book (खरिद खाता) - VAT annex for purchase invoices. */
export class VATPurchaseBook extends BaseVATBook {
  static title = t`VAT Purchase Book`;
  static reportName = 'vat-purchase-book';

  schemaName = ModelNameEnum.PurchaseInvoice;
}
