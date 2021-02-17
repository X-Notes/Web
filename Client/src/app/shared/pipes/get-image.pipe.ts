import { Pipe, PipeTransform } from '@angular/core';
import { environment } from 'src/environments/environment';

@Pipe({
  name: 'getImage'
})
export class GetImagePipe implements PipeTransform { // TODO MAKE THIS PIPE ASYNC // LONG LOAD SIDE BAR MENU

  transform(url: string): string {
    return environment.writeAPI + `/api/Files/user/image/${url}`;
  }

}
