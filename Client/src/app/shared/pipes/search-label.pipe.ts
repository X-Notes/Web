import { Pipe, PipeTransform } from '@angular/core';
import { Label } from 'src/app/content/labels/models/label';

@Pipe({
  name: 'searchLabel'
})
export class SearchLabelPipe implements PipeTransform {

  transform(values: Label[], searchStr: string): Label[] {
    return values.filter(x => x.name.includes(searchStr));
  }

}
