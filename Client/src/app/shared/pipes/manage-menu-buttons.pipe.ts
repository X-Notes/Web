import { Pipe, PipeTransform } from '@angular/core';
import { MenuItem } from 'src/app/content/navigation/models/menu-Item.model';

@Pipe({
  name: 'manageMenuButtons',
})
export class ManageMenuButtonsPipe implements PipeTransform {
  transform = (
    items: MenuItem[],
    isHasEditRights: boolean,
    isOwner: boolean,
    isAllNotesNoShared: boolean,
  ): MenuItem[] => {
    if (!isAllNotesNoShared) {
      items = items.filter((x) => !x.isDisableForShared);
    }
    if (!isOwner) {
      items = items.filter((x) => x.isOnlyForAuthor === false);
    }
    if (!isHasEditRights) {
      items = items.filter((x) => x.IsNeedEditRightsToSee === false);
    }
    return items;
  };
}
