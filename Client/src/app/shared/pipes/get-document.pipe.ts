import { Pipe, PipeTransform } from '@angular/core';
import { environment } from 'src/environments/environment';

@Pipe({
  name: 'getDocument',
})
export class GetDocumentPipe implements PipeTransform {
  transform = (url: string, prefix: string) => {
    if (environment.production) {
      return new Error('no implimented');
    }
    return `${environment.storage}/${prefix}/${url}`;
  };
}
