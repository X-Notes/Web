import { Pipe, PipeTransform } from '@angular/core';
import { Store } from '@ngxs/store';
import dayjs from 'dayjs';

@Pipe({
  name: 'dateFromNow',
})
export class DateFromNowPipe implements PipeTransform {
  constructor(private store: Store) {}

  transform(date: Date | string): string {
    return dayjs(date).fromNow();
  }
}
