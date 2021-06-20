import { Pipe, PipeTransform } from '@angular/core';
import { environment } from 'src/environments/environment';

@Pipe({
  name: 'getImage',
})
export class GetImagePipe implements PipeTransform {
  // TODO MAKE THIS PIPE ASYNC // LONG LOAD SIDE BAR MENU

  transform = (url: string, prefix: string) => {
    if (environment.production) {
      return new Error('no implimented');
    }
    return `${environment.storage}/${prefix}/${url}`;
  };
}
