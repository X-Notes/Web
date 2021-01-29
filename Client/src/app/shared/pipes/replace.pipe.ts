import { Pipe, PipeTransform } from '@angular/core';

@Pipe({
  name: 'replace'
})
export class ReplacePipe implements PipeTransform {

  transform(value: string, type: string): string {
    if (type === 'note') {
      return this.unknownReturn(value, type);
    } else if (type === 'label') {
      return this.unknownReturn(value, type);
    } else if (type === 'folder') {
      return this.unknownReturn(value, type);
    }
  }

  unknownReturn(value: string, type: string) {
    if (value) {
      return value?.length === 0 ? `unknown ${type}` : value;
    } else {
      return `unknown ${type}`;
    }
  }

}
