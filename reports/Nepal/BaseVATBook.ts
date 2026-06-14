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
import { isNumeric } from 'src/utils';
import { adToBs, bsMonthToAdRange } from 'fyo/utils/nepaliDate';

/** Account name used for VAT in the Nepal chart of accounts. */
export const VAT_ACCOUNT = 'VAT';

export interface VATBookRow {
  date: Date | null;
  invoiceNo: string;
  party: string;
  pan: string;
  taxableAmount: number;
  vatAmount: number;
  total: number;
  [key: string]: Date | string | number | null;
}

/**
 * Base for the Nepal VAT Sales Book (बिक्री खाता) and Purchase Book (खरिद खाता).
 * Lists submitted invoices in a period with taxable value and VAT, matching the
 * annexes filed with the monthly VAT return.
 */
export abstract class BaseVATBook extends Report {
  abstract schemaName: ModelNameEnum;

  fromDate?: string;
  toDate?: string;
  loading = false;
  usePagination = true;

  async setReportData(): Promise<void> {
    this.loading = true;
    const rows = await this.getVATBookRows();
    this.reportData = this.getReportDataFromRows(rows);
    this.loading = false;
  }

  async getEntries(): Promise<{ name: string }[]> {
    const date: string[] = [];
    if (this.toDate) {
      date.push('<=', this.toDate);
    }
    if (this.fromDate) {
      date.push('>=', this.fromDate);
    }

    return (await this.fyo.db.getAllRaw(this.schemaName, {
      filters: { date, submitted: true, cancelled: false },
      orderBy: 'date',
      order: 'asc',
    })) as { name: string }[];
  }

  async getVATBookRows(): Promise<VATBookRow[]> {
    const entries = await this.getEntries();
    const rows: VATBookRow[] = [];

    for (const entry of entries) {
      const doc = (await this.fyo.doc.getDoc(
        this.schemaName,
        entry.name
      )) as Invoice;

      let vatAmount = 0;
      for (const tax of doc.taxes ?? []) {
        if (tax.account === VAT_ACCOUNT) {
          vatAmount += (tax.amount as Money)?.float ?? 0;
        }
      }

      let pan = '';
      if (doc.party) {
        pan =
          ((await this.fyo.getValue('Party', doc.party, 'pan')) as string) ??
          ((await this.fyo.getValue('Party', doc.party, 'vatNo')) as string) ??
          '';
      }

      rows.push({
        date: (doc.date as Date) ?? null,
        invoiceNo: doc.name ?? '',
        party: doc.party ?? '',
        pan,
        taxableAmount: (doc.netTotal as Money)?.float ?? 0,
        vatAmount,
        total: (doc.grandTotal as Money)?.float ?? 0,
      });
    }

    return rows;
  }

  getReportDataFromRows(rows: VATBookRow[]): ReportData {
    const reportData: ReportData = [];

    for (const row of rows) {
      reportData.push(this.getRowCells(row));
    }

    if (rows.length) {
      reportData.push(this.getTotalsRow(rows));
    }

    return reportData;
  }

  getRowCells(row: VATBookRow, bold = false): ReportRow {
    const cells = this.columns.map(({ fieldname, fieldtype, width }) => {
      const align = isNumeric(fieldtype) ? 'right' : 'left';
      const rawValue = row[fieldname as keyof VATBookRow];
      let value = '';
      if (rawValue !== undefined && rawValue !== null && rawValue !== '') {
        value = this.fyo.format(rawValue, fieldtype);
      }

      return { align, rawValue, value, width: width ?? 1, bold } as const;
    });

    return { cells };
  }

  getTotalsRow(rows: VATBookRow[]): ReportRow {
    const totals: VATBookRow = {
      date: null,
      invoiceNo: '',
      party: t`Total`,
      pan: '',
      taxableAmount: 0,
      vatAmount: 0,
      total: 0,
    };

    for (const row of rows) {
      totals.taxableAmount += row.taxableAmount;
      totals.vatAmount += row.vatAmount;
      totals.total += row.total;
    }

    return this.getRowCells(totals, true);
  }

  setDefaultFilters(): void {
    if (this.toDate && this.fromDate) {
      return;
    }

    // Default to the current Bikram Sambat month - the VAT filing period.
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
      { label: t`Date`, fieldname: 'date', fieldtype: 'Date' },
      {
        label: t`Invoice No.`,
        fieldname: 'invoiceNo',
        fieldtype: 'Data',
        width: 1.2,
      },
      { label: t`Party`, fieldname: 'party', fieldtype: 'Data', width: 1.5 },
      { label: t`PAN / VAT No.`, fieldname: 'pan', fieldtype: 'Data' },
      {
        label: t`Taxable Amount`,
        fieldname: 'taxableAmount',
        fieldtype: 'Currency',
      },
      { label: t`VAT (13%)`, fieldname: 'vatAmount', fieldtype: 'Currency' },
      { label: t`Total`, fieldname: 'total', fieldtype: 'Currency' },
    ];
  }

  getActions(): Action[] {
    return getCommonExportActions(this);
  }
}
