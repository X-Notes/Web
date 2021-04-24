import { Pipe, PipeTransform } from '@angular/core';
import { environment } from 'src/environments/environment';

@Pipe({
  name: 'getVideo',
})
export class GetVideoPipe implements PipeTransform {
  transform = (url: string) => {
    if (url) {
      return `${environment.writeAPI}/api/Files/video/${url}`;
    }
    return null;
  };
}
