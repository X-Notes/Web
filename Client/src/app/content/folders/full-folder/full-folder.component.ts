import { Component, OnInit } from '@angular/core';
import { Store } from '@ngxs/store';
import { UpdateRoute } from 'src/app/core/stateApp/app-action';
import { FolderType } from 'src/app/shared/enums/FolderTypes';
import { MenuButtonsService } from '../../navigation/menu-buttons.service';
import { EntityType } from 'src/app/shared/enums/EntityTypes';

@Component({
  selector: 'app-full-folder',
  templateUrl: './full-folder.component.html',
  styleUrls: ['./full-folder.component.scss']
})
export class FullFolderComponent implements OnInit {

  constructor(private store: Store) { }

  async ngOnInit() {

    await this.store.dispatch(new UpdateRoute(EntityType.FolderInner)).toPromise();

  }

}
