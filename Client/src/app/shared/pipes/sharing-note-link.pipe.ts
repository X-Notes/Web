import { Pipe, PipeTransform } from '@angular/core';

@Pipe({
  name: 'sharingNoteLink'
})
export class SharingNoteLinkPipe implements PipeTransform {

  transform(value: string): string {
    const mainUrl = window.location.href.split('/');
    return  mainUrl[0] + '//' + mainUrl[2] + '/notes/' + value;
  }

}
