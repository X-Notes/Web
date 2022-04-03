import { Pipe, PipeTransform } from '@angular/core';
import { Store } from '@ngxs/store';
import { MenuItem } from 'src/app/content/navigation/menu-Item.model';

@Pipe({
  name: 'manageMenuButtons',
})
export class ManageMenuButtonsPipe implements PipeTransform {
  constructor(private store: Store) {}

  transform = (items: MenuItem[], isOwner: boolean): MenuItem[] => {
    if (!isOwner) {
      return items.filter((x) => x.isNoOwnerCanSee === true);
    }
    return items;
  };
}
