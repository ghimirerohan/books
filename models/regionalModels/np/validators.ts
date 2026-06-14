import { t } from 'fyo';
import { DocValue } from 'fyo/core/types';
import { ValidationError } from 'fyo/utils/errors';
import { isValidPan } from 'regional/np';

/** Throws if the value is set but not a valid 9-digit PAN / VAT number. */
export function validatePan(value: DocValue): void {
  if (value && !isValidPan(value as string)) {
    throw new ValidationError(t`PAN / VAT No. must be a 9 digit number.`);
  }
}
