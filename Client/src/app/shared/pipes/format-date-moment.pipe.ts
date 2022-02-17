import { Pipe, PipeTransform } from '@angular/core';
import * as moment from 'moment';

@Pipe({
  name: 'formatDateMoment',
})
export class FormatDateMomentPipe implements PipeTransform {
  transform = (time: number, coff: number, format: string = 'mm:ss'): string => {
    return moment.utc(time * coff).format(format);
  };
}
