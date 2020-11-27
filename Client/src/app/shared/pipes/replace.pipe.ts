import { Pipe, PipeTransform } from '@angular/core';

@Pipe({
  name: 'replace'
})
export class ReplacePipe implements PipeTransform {

  transform(value: string, type: string): string {
    if (type === 'note') {
      if (value) {
        return value?.length === 0 ? 'unknown note' : value;
      } else {
        return 'unknown note';
      }
    }
    if (type === 'label') {
      if (value) {
        return value?.length === 0 ? 'unknown label' : value;
      } else {
        return 'unknown label';
      }
    }
  }

}
