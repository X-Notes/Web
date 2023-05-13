import { Injectable } from '@angular/core';
import { TranslateService } from '@ngx-translate/core';
import { SelectionOption } from '../custom-components/select-component/entities/select-option';

@Injectable({
  providedIn: 'root',
})
export class EnumConverterService {
  constructor(public translateService: TranslateService) {}

  convertEnumToSelectionOption<ENUM extends Record<string, unknown>>(
    enumObj: ENUM,
    enumValue: any,
    prefix: string,
  ): SelectionOption {
    if (typeof enumObj[enumValue] === 'undefined') {
      throw new Error(`Invalid enum value: ${enumValue.toString()}`);
    }
    const enumTitle = String(enumObj[enumValue]);
    return {
      value: enumValue,
      title: this.translateService.instant(prefix + enumTitle),
    };
  }
}
