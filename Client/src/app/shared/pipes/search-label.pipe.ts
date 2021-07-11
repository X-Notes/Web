import { Pipe, PipeTransform } from '@angular/core';
import { Label } from 'src/app/content/labels/models/label.model';

@Pipe({
  name: 'searchLabel',
})
export class SearchLabelPipe implements PipeTransform {
  transform = (values: Label[], searchStr: string) => {
    return values.filter((x) => x.name?.includes(searchStr) || x.name === null);
  };
}
