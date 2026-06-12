import { HiddenMap } from 'fyo/model/types';
import { Party as BaseParty } from 'models/baseModels/Party/Party';
import { PartyRole } from 'models/baseModels/Party/types';
import { RegistrationType } from './types';

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
