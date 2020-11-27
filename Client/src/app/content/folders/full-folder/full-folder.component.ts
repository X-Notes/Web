import { Component, OnDestroy, OnInit } from '@angular/core';
import { Store } from '@ngxs/store';
import { UpdateRoute } from 'src/app/core/stateApp/app-action';
import { FolderType } from 'src/app/shared/enums/FolderTypes';
import { EntityType } from 'src/app/shared/enums/EntityTypes';
import { LoadAllExceptFolders } from '../state/folders-actions';
import { MurriService } from 'src/app/shared/services/murri.service';

@Component({
  selector: 'app-full-folder',
  templateUrl: './full-folder.component.html',
  styleUrls: ['./full-folder.component.scss']
})
export class FullFolderComponent implements OnInit, OnDestroy {

  constructor(private store: Store,
              public murriService: MurriService, ) { }

  ngOnDestroy(): void {
    this.murriService.flagForOpacity = false;
  }

  async ngOnInit() {
    await this.store.dispatch(new UpdateRoute(EntityType.FolderInner)).toPromise();
    this.store.dispatch(new LoadAllExceptFolders(FolderType.Inner));
  }

}
