import { Pipe, PipeTransform } from '@angular/core';
import { Label } from 'src/app/content/labels/models/label';

@Pipe({
  name: 'noDeletedLabels'
})
export class NoDeletedLabelsPipe implements PipeTransform {

  transform(labels: Label[], ...args: unknown[]): unknown {
    return labels?.filter(x => x.isDeleted === false);
  }

}
