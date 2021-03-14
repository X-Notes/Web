import { Pipe, PipeTransform } from '@angular/core';

@Pipe({
  name: 'replace',
})
export class ReplacePipe implements PipeTransform {
  transform = (value: string, type: string) => {
    if (type === 'note') {
      return this.unknownReturn(value, type);
    }
    if (type === 'label') {
      return this.unknownReturn(value, type);
    }
    if (type === 'folder') {
      return this.unknownReturn(value, type);
    }
    throw new Error('error');
  };

  unknownReturn = (value: string, type: string) => {
    if (value) {
      return value?.length === 0 ? `unknown ${type}` : value;
    }
    return `unknown ${type}`;
  };
}
