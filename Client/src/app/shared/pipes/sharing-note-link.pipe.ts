import { Pipe, PipeTransform } from '@angular/core';
import { SharedType } from '../modal_components/share/share.component';

@Pipe({
  name: 'sharingLink'
})
export class SharingLinkPipe implements PipeTransform {

  transform(value: string, type: SharedType): string {
    switch (type) {
      case SharedType.Note: {
        const mainUrl = window.location.href.split('/');
        return  mainUrl[0] + '//' + mainUrl[2] + '/notes/' + value;
      }
      case SharedType.Folder: {
        const mainUrl = window.location.href.split('/');
        return  mainUrl[0] + '//' + mainUrl[2] + '/folders/' + value;
      }
    }
  }

}
