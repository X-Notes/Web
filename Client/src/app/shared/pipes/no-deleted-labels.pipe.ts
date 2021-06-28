import { Pipe, PipeTransform } from '@angular/core';
import { Label } from 'src/app/content/labels/models/label.model';

@Pipe({
  name: 'noDeletedLabels',
})
export class NoDeletedLabelsPipe implements PipeTransform {
  transform = (labels: Label[]) => {
    return labels?.filter((x) => x.isDeleted === false);
  };
}
