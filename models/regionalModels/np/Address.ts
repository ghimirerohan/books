import { FormulaMap, ListsMap } from 'fyo/model/types';
import { Address as BaseAddress } from 'models/baseModels/Address/Address';
import {
  districtList,
  getProvinceForDistrict,
  provinceList,
} from 'regional/np';

export class Address extends BaseAddress {
  province?: string;
  district?: string;
  localLevel?: string;
  wardNo?: string;

  formulas: FormulaMap = {
    addressDisplay: {
      formula: () => {
        return [
          this.addressLine1,
          this.addressLine2,
          this.localLevel
            ? `${this.localLevel}${this.wardNo ? '-' + this.wardNo : ''}`
            : this.wardNo,
          this.city,
          this.district,
          this.province,
          this.country,
          this.postalCode,
        ]
          .filter(Boolean)
          .join(', ');
      },
      dependsOn: [
        'addressLine1',
        'addressLine2',
        'localLevel',
        'wardNo',
        'city',
        'district',
        'province',
        'country',
        'postalCode',
      ],
    },

    province: {
      formula: () => {
        const district = this.district as string;
        const province = getProvinceForDistrict(district);
        if (province) {
          return province;
        }
        return this.province;
      },
      dependsOn: ['district'],
    },
  };

  static lists: ListsMap = {
    ...BaseAddress.lists,
    province: () => [...provinceList],
    district: () => districtList,
  };
}
