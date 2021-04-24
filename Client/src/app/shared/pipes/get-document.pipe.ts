import { Pipe, PipeTransform } from '@angular/core';
import { environment } from 'src/environments/environment';

@Pipe({
  name: 'getDocument',
})
export class GetDocumentPipe implements PipeTransform {
  transform = (url: string) => {
    if (url) {
      return `${environment.writeAPI}/api/Files/document/${url}`;
    }
    return null;
  };
}
