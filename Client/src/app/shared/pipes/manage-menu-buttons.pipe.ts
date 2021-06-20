import { Pipe, PipeTransform } from '@angular/core';
import { Store } from '@ngxs/store';
import { MenuItem } from 'src/app/content/navigation/MenuItem';
import { AppStore } from 'src/app/core/stateApp/app-state';

@Pipe({
  name: 'manageMenuButtons',
})
export class ManageMenuButtonsPipe implements PipeTransform {
  constructor(private store: Store) {}

  transform = (items: MenuItem[], isOwner: boolean): MenuItem[] => {
    if (this.store.selectSnapshot(AppStore.isFolderInner)) {
      return items.filter((x) => x.isViewOnFullFolder === true);
    }
    if (!isOwner) {
      return items.filter((x) => x.isNoOwnerCanSee === true);
    }
    return items;
  };
}
