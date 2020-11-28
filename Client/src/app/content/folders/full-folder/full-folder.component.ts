import { Component, OnDestroy, OnInit } from '@angular/core';
import { Select, Store } from '@ngxs/store';
import { UpdateRoute } from 'src/app/core/stateApp/app-action';
import { FolderType } from 'src/app/shared/enums/FolderTypes';
import { EntityType } from 'src/app/shared/enums/EntityTypes';
import { LoadAllExceptFolders, LoadFullFolder } from '../state/folders-actions';
import { MurriService } from 'src/app/shared/services/murri.service';
import { Observable, Subject, Subscription } from 'rxjs';
import { ActivatedRoute } from '@angular/router';
import { AppStore } from 'src/app/core/stateApp/app-state';
import { takeUntil } from 'rxjs/operators';
import { FolderStore } from '../state/folders-state';
import { FullFolder } from '../models/FullFolder';

@Component({
  selector: 'app-full-folder',
  templateUrl: './full-folder.component.html',
  styleUrls: ['./full-folder.component.scss']
})
export class FullFolderComponent implements OnInit, OnDestroy {

  destroy = new Subject<void>();
  private routeSubscription: Subscription;
  private id: string;

  @Select(FolderStore.full)
  folder$: Observable<FullFolder>;

  constructor(private store: Store,
              public murriService: MurriService,
              private route: ActivatedRoute, ) { }

  ngOnDestroy(): void {
    this.murriService.flagForOpacity = false;
    this.destroy.next();
    this.destroy.complete();
    this.routeSubscription.unsubscribe();
  }

  async ngOnInit() {

    this.store.dispatch(new UpdateRoute(EntityType.FolderInner));

    this.routeSubscription = this.route.params.subscribe(async (params) => {
      this.id = params.id;

      this.store.select(AppStore.getTokenUpdated)
      .pipe(takeUntil(this.destroy))
      .subscribe(async (x: boolean) => {
        if (x) {
          await this.store.dispatch(new LoadFullFolder(this.id)).toPromise();
          const type = this.store.selectSnapshot(FolderStore.full).folderType;
          this.store.dispatch(new LoadAllExceptFolders(type));
        }
      }
      );
    });
  }

}
