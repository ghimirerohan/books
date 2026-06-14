import { ValidationMap } from 'fyo/model/types';
import { validateEmail } from 'fyo/model/validationFunction';
import { AccountingSettings as BaseAccountingSettings } from 'models/baseModels/AccountingSettings/AccountingSettings';
import { validatePan } from './validators';

/**
 * Nepal accounting settings: validates the company PAN / VAT number format in
 * addition to the base email validation.
 */
export class AccountingSettings extends BaseAccountingSettings {
  validations: ValidationMap = {
    email: validateEmail,
    pan: validatePan,
    vatNo: validatePan,
  };
}
