import { Pipe, PipeTransform } from '@angular/core';
import { Label } from 'src/app/content/labels/models/label.model';

@Pipe({
  name: 'lastTwoNoDeletedLabels',
})
export class LastTwoNoDeletedLabelsPipe implements PipeTransform {
  transform = (labels: Label[]) => {
    const labelsNoDeleted = labels.filter((x) => x.isDeleted === false);
    return labelsNoDeleted.slice(labelsNoDeleted.length - 2, labelsNoDeleted.length);
  };
}
