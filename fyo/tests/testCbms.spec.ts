import { buildCbmsPayload } from 'models/regionalModels/np/cbms';
import test from 'tape';

test('cbms: builds IRD payload with BS date and fiscal year', function (t) {
  const payload = buildCbmsPayload({
    username: 'user',
    password: 'pass',
    sellerPan: '123456789',
    buyerPan: '987654321',
    buyerName: 'Acme Pvt Ltd',
    invoiceNumber: 'SINV-1001',
    date: new Date(2024, 6, 16), // Shrawan 1, 2081
    taxableAmount: 1000,
    vatAmount: 130,
    totalAmount: 1130,
    isRealtime: true,
  });

  t.equal(payload.seller_pan, '123456789', 'seller pan');
  t.equal(payload.buyer_pan, '987654321', 'buyer pan');
  t.equal(payload.buyer_name, 'Acme Pvt Ltd', 'buyer name');
  t.equal(payload.invoice_number, 'SINV-1001', 'invoice number');
  t.equal(payload.fiscal_year, '2081/82', 'fiscal year (BS)');
  t.equal(payload.invoice_date, '2081-04-01', 'invoice date (BS)');
  t.equal(payload.invoice_date_ad, '2024-07-16', 'invoice date (AD)');
  t.equal(payload.taxable_sales_vat, 1000, 'taxable amount');
  t.equal(payload.vat, 130, 'vat amount');
  t.equal(payload.total_sales, 1130, 'total amount');
  t.equal(payload.isrealtime, true, 'realtime flag');
  t.equal(typeof payload.datetimeclient, 'string', 'client timestamp set');
  t.end();
});
