import { BalanceSheet } from './BalanceSheet/BalanceSheet';
import { GeneralLedger } from './GeneralLedger/GeneralLedger';
import { GSTR1 } from './GoodsAndServiceTax/GSTR1';
import { GSTR2 } from './GoodsAndServiceTax/GSTR2';
import { ProfitAndLoss } from './ProfitAndLoss/ProfitAndLoss';
import { TrialBalance } from './TrialBalance/TrialBalance';
import { StockBalance } from './inventory/StockBalance';
import { StockLedger } from './inventory/StockLedger';
import { VATSalesBook } from './Nepal/VATSalesBook';
import { VATPurchaseBook } from './Nepal/VATPurchaseBook';
import { VATReturn } from './Nepal/VATReturn';
import { TDSReport } from './Nepal/TDSReport';

export const reports = {
  GeneralLedger,
  ProfitAndLoss,
  BalanceSheet,
  TrialBalance,
  GSTR1,
  GSTR2,
  StockLedger,
  StockBalance,
  VATSalesBook,
  VATPurchaseBook,
  VATReturn,
  TDSReport,
} as const;
