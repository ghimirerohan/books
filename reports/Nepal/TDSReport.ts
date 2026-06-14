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
import { bsFiscalYearToAdRange, getBsFiscalYear } from 'fyo/utils/nepaliDate';

/** Account name used for withholding tax (TDS) in the Nepal chart of accounts. */
export const TDS_ACCOUNT = 'TDS Payable';

interface TDSRow {
  date: Date | null;
  invoiceNo: string;
  party: string;
  pan: string;
  baseAmount: number;
  rate: number;
  tdsAmount: number;
  [key: string]: Date | string | number | null;
}

/**
 * TDS (अग्रिम कर कट्टी) report: withholding tax deducted on purchases/expenses,
 * defaulting to the current Nepali fiscal year.
 */
export class TDSReport extends Report {
  static title = t`TDS Report`;
  static reportName = 'tds-report';

  fromDate?: string;
  toDate?: string;
  loading = false;
  usePagination = true;

  async setReportData(): Promise<void> {
    this.loading = true;
    const rows = await this.getRows();
    this.reportData = this.getReportData(rows);
    this.loading = false;
  }

  async getRows(): Promise<TDSRow[]> {
    const date: string[] = [];
    if (this.toDate) {
      date.push('<=', this.toDate);
    }
    if (this.fromDate) {
      date.push('>=', this.fromDate);
    }

    const entries = (await this.fyo.db.getAllRaw(
      ModelNameEnum.PurchaseInvoice,
      {
        filters: { date, submitted: true, cancelled: false },
        orderBy: 'date',
        order: 'asc',
      }
    )) as { name: string }[];

    const rows: TDSRow[] = [];
    for (const entry of entries) {
      const doc = (await this.fyo.doc.getDoc(
        ModelNameEnum.PurchaseInvoice,
        entry.name
      )) as Invoice;

      const tdsTaxes = (doc.taxes ?? []).filter(
        (tax) => tax.account === TDS_ACCOUNT
      );
      if (!tdsTaxes.length) {
        continue;
      }

      let pan = '';
      if (doc.party) {
        pan =
          ((await this.fyo.getValue('Party', doc.party, 'pan')) as string) ??
          '';
      }

      for (const tax of tdsTaxes) {
        rows.push({
          date: (doc.date as Date) ?? null,
          invoiceNo: doc.name ?? '',
          party: doc.party ?? '',
          pan,
          baseAmount: (doc.netTotal as Money)?.float ?? 0,
          rate: tax.rate ?? 0,
          tdsAmount: (tax.amount as Money)?.float ?? 0,
        });
      }
    }

    return rows;
  }

  getReportData(rows: TDSRow[]): ReportData {
    const reportData: ReportData = rows.map((row) => this.getRowCells(row));

    if (rows.length) {
      const totals: TDSRow = {
        date: null,
        invoiceNo: '',
        party: t`Total`,
        pan: '',
        baseAmount: 0,
        rate: 0,
        tdsAmount: 0,
      };
      for (const row of rows) {
        totals.baseAmount += row.baseAmount;
        totals.tdsAmount += row.tdsAmount;
      }
      reportData.push(this.getRowCells(totals, true));
    }

    return reportData;
  }

  getRowCells(row: TDSRow, bold = false): ReportRow {
    const cells = this.columns.map(({ fieldname, fieldtype, width }) => {
      const align = isNumeric(fieldtype) ? 'right' : 'left';
      const rawValue = row[fieldname as keyof TDSRow];
      let value = '';
      if (rawValue !== undefined && rawValue !== null && rawValue !== '') {
        value = this.fyo.format(rawValue, fieldtype);
      }
      return { align, rawValue, value, width: width ?? 1, bold } as const;
    });
    return { cells };
  }

  setDefaultFilters(): void {
    if (this.toDate && this.fromDate) {
      return;
    }

    const startBsYear = getBsFiscalYear(new Date());
    const { start, end } = bsFiscalYearToAdRange(startBsYear);
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
      { label: t`PAN`, fieldname: 'pan', fieldtype: 'Data' },
      { label: t`Base Amount`, fieldname: 'baseAmount', fieldtype: 'Currency' },
      { label: t`Rate %`, fieldname: 'rate', fieldtype: 'Float', width: 0.5 },
      { label: t`TDS Amount`, fieldname: 'tdsAmount', fieldtype: 'Currency' },
    ];
  }

  getActions(): Action[] {
    return getCommonExportActions(this);
  }
}
