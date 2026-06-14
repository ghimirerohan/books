import { HiddenMap, ValidationMap } from 'fyo/model/types';
import {
  validateEmail,
  validatePhoneNumber,
} from 'fyo/model/validationFunction';
import { Party as BaseParty } from 'models/baseModels/Party/Party';
import { PartyRole } from 'models/baseModels/Party/types';
import { RegistrationType } from './types';
import { validatePan } from './validators';

export class Party extends BaseParty {
  pan?: string;
  vatNo?: string;
  role?: PartyRole;
  registrationType?: RegistrationType;
  loyaltyProgram?: string;

  // eslint-disable-next-line @typescript-eslint/require-await
  async beforeSync() {
    const vatNo = this.get('vatNo') as string | undefined;
    const registrationType = this.get('registrationType') as RegistrationType;

    if (vatNo && registrationType !== 'VAT Registered') {
      this.vatNo = '';
    }
  }

  validations: ValidationMap = {
    email: validateEmail,
    phone: validatePhoneNumber,
    pan: validatePan,
    vatNo: validatePan,
  };

  hidden: HiddenMap = {
    vatNo: () =>
      (this.registrationType as RegistrationType) !== 'VAT Registered',
    loyaltyProgram: () => {
      if (!this.fyo.singles.AccountingSettings?.enableLoyaltyProgram) {
        return true;
      }
      return this.role === 'Supplier';
    },
    loyaltyPoints: () => !this.loyaltyProgram || this.role === 'Supplier',
  };
}
