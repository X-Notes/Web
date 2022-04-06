import { Pipe, PipeTransform } from '@angular/core';
import { MenuItem } from 'src/app/content/navigation/models/menu-Item.model';

@Pipe({
  name: 'manageMenuButtons',
})
export class ManageMenuButtonsPipe implements PipeTransform {
  transform = (items: MenuItem[], isOwner: boolean): MenuItem[] => {
    if (!isOwner) {
      return items.filter((x) => x.isNoOwnerCanSee === true);
    }
    return items;
  };
}
