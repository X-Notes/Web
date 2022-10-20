import { Pipe, PipeTransform } from '@angular/core';
import { EntityPopupType } from '../models/entity-popup-type.enum';

@Pipe({
  name: 'sharingLink',
})
export class SharingLinkPipe implements PipeTransform {
  transform = (value: string, type: EntityPopupType) => {
    switch (type) {
      case EntityPopupType.Note: {
        const mainUrl = window.location.href.split('/');
        return `${mainUrl[0]}//${mainUrl[2]}/note/${value}`;
      }
      case EntityPopupType.Folder: {
        const mainUrl = window.location.href.split('/');
        return `${mainUrl[0]}//${mainUrl[2]}/folder/${value}`;
      }
      default: {
        throw new Error('error');
      }
    }
  };
}
