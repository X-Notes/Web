import { Pipe, PipeTransform } from '@angular/core';

@Pipe({
  name: 'fileName',
})
export class FileNamePipe implements PipeTransform {
  transform(value: string): string {
    if (!value) {
      return value;
    }
    const text = value.split('.');
    text.pop();
    return text.join('.');
  }
}
