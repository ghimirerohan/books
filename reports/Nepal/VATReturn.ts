import { t } from 'fyo';
import { Action } from 'fyo/model/types';
import { DateTime } from 'luxon';
import { Money } from 'pesa';
import { Invoice } from 'models/baseModels/Invoice/Invoice';
import { ModelNameEnum } from 'models/types';
import getCommonExportActions from 'reports/commonExporter';
import { Report } from 'reports/Report';
import { ColumnField, ReportData, ReportRow } from 'reports/types';
import { Field } from 'schemas/types';
import { adToBs, bsMonthToAdRange } from 'fyo/utils/nepaliDate';
import { VAT_ACCOUNT } from './BaseVATBook';

interface VATTotals {
  taxable: number;
  other: number;
  vat: number;
}

/**
 * Monthly VAT return (मु.अ.कर विवरण) summary: output VAT on sales versus input
 * VAT on purchases, and the net VAT payable or creditable for the period.
 *
 * The net figure reconciles with the movement of the `VAT` ledger account over
 * the same period, since sales credit and purchases debit that single account.
 */
export class VATReturn extends Report {
  static title = t`VAT Return`;
  static reportName = 'vat-return';

  fromDate?: string;
  toDate?: string;
  loading = false;

  async setReportData(): Promise<void> {
    this.loading = true;

    const sales = await this.getTotals(ModelNameEnum.SalesInvoice);
    const purchases = await this.getTotals(ModelNameEnum.PurchaseInvoice);
    const netVat = sales.vat - purchases.vat;

    const data: ReportData = [];
    data.push(this.headerRow(t`Sales (बिक्री)`));
    data.push(this.valueRow(t`Taxable Sales`, sales.taxable));
    data.push(this.valueRow(t`Zero-rated / Exempt Sales`, sales.other));
    data.push(this.valueRow(t`Output VAT (13%)`, sales.vat, true));

    data.push(this.headerRow(t`Purchases (खरिद)`));
    data.push(this.valueRow(t`Taxable Purchases`, purchases.taxable));
    data.push(this.valueRow(t`Zero-rated / Exempt Purchases`, purchases.other));
    data.push(this.valueRow(t`Input VAT (13%)`, purchases.vat, true));

    data.push(this.headerRow(t`Net`));
    data.push(
      this.valueRow(
        netVat >= 0 ? t`VAT Payable` : t`VAT Creditable (Carry Forward)`,
        Math.abs(netVat),
        true
      )
    );

    this.reportData = data;
    this.loading = false;
  }

  async getTotals(schemaName: ModelNameEnum): Promise<VATTotals> {
    const totals: VATTotals = { taxable: 0, other: 0, vat: 0 };

    const date: string[] = [];
    if (this.toDate) {
      date.push('<=', this.toDate);
    }
    if (this.fromDate) {
      date.push('>=', this.fromDate);
    }

    const entries = (await this.fyo.db.getAllRaw(schemaName, {
      filters: { date, submitted: true, cancelled: false },
    })) as { name: string }[];

    for (const entry of entries) {
      const doc = (await this.fyo.doc.getDoc(
        schemaName,
        entry.name
      )) as Invoice;

      let vatAmount = 0;
      for (const tax of doc.taxes ?? []) {
        if (tax.account === VAT_ACCOUNT) {
          vatAmount += (tax.amount as Money)?.float ?? 0;
        }
      }

      const net = (doc.netTotal as Money)?.float ?? 0;
      totals.vat += vatAmount;
      if (vatAmount > 0) {
        totals.taxable += net;
      } else {
        totals.other += net;
      }
    }

    return totals;
  }

  headerRow(label: string): ReportRow {
    return {
      cells: [
        { value: label, rawValue: label, align: 'left', bold: true, width: 3 },
        { value: '', rawValue: '', align: 'right', width: 1 },
      ],
      isGroup: true,
    };
  }

  valueRow(label: string, amount: number, bold = false): ReportRow {
    return {
      cells: [
        { value: label, rawValue: label, align: 'left', bold, width: 3 },
        {
          value: this.fyo.format(amount, 'Currency'),
          rawValue: amount,
          align: 'right',
          bold,
          width: 1,
        },
      ],
    };
  }

  setDefaultFilters(): void {
    if (this.toDate && this.fromDate) {
      return;
    }

    const bs = adToBs(new Date());
    const { start, end } = bsMonthToAdRange(bs.year, bs.month);
    this.fromDate ??= DateTime.fromJSDate(start).toISODate();
    this.toDate ??= DateTime.fromJSDate(end).toISODate();
  }

  getFilters(): Field[] {
    return [
      {
        fieldtype: 'Date',
        label: t`From Date`,
        placeholder: t`From Date`,
        fieldname: 'fromDate',
      },
      {
        fieldtype: 'Date',
        label: t`To Date`,
        placeholder: t`To Date`,
        fieldname: 'toDate',
      },
    ];
  }

  getColumns(): ColumnField[] {
    return [
      {
        label: t`Particulars`,
        fieldname: 'particulars',
        fieldtype: 'Data',
        width: 3,
      },
      { label: t`Amount`, fieldname: 'amount', fieldtype: 'Currency' },
    ];
  }

  getActions(): Action[] {
    return getCommonExportActions(this);
  }
}
