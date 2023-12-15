import { Pipe, PipeTransform } from '@angular/core';
import { Label } from 'src/app/content/labels/models/label.model';

@Pipe({
  name: 'lastTwoNoDeletedLabels',
})
export class LastTwoNoDeletedLabelsPipe implements PipeTransform {
  transform = (labels: Label[], labelsIds: string[]) => {
    if(!labelsIds || !labels) return [];
    const labelsNoDeleted = labels.filter((x) => labelsIds.some(q => q === x.id) && x.isDeleted === false);
    const count = window.innerWidth > 1024 ? 3 : 2;
    return labelsNoDeleted.slice(labelsNoDeleted.length - count, labelsNoDeleted.length);
  };
}
