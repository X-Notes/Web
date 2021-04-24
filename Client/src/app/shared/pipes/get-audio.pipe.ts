import { Pipe, PipeTransform } from '@angular/core';
import { environment } from 'src/environments/environment';

@Pipe({
  name: 'getAudio',
})
export class GetAudioPipe implements PipeTransform {
  transform = (url: string) => {
    if (url) {
      return `${environment.writeAPI}/api/Files/audio/${url}`;
    }
    return null;
  };
}
