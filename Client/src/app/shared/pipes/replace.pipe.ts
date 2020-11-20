import { Pipe, PipeTransform } from '@angular/core';

@Pipe({
  name: 'replace'
})
export class ReplacePipe implements PipeTransform {

  transform(value: string, ...args: any[]): any {
    return value?.length === 0 ? 'unknown label' : value;
  }

}
