import { Pipe, PipeTransform } from '@angular/core';
import { Label } from 'src/app/content/labels/models/label.model';

@Pipe({
  name: 'searchLabel',
})
export class SearchLabelPipe implements PipeTransform {
  transform = (values: Label[], searchStr: string, meta: { count: number }) => {
    if (searchStr && searchStr.length > 0) {
      const searchValues = values.filter((x) =>
        x.name?.toLowerCase().includes(searchStr.toLowerCase()),
      );
      meta.count = searchValues.length;
      return searchValues;
    }
    meta.count = 0;
    return values;
  };
}
