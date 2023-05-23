import { Pipe, PipeTransform } from '@angular/core';
import dayjs from 'dayjs';

@Pipe({
  name: 'formatDateMoment',
})
export class FormatDateMomentPipe implements PipeTransform {
  transform = (time: number, coff: number, format = 'mm:ss'): string => {
    return dayjs(time * coff).format(format);
  };
}
