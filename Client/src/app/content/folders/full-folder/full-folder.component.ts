import { Component, OnDestroy, OnInit } from '@angular/core';
import { Select, Store } from '@ngxs/store';
import { UpdateRoute } from 'src/app/core/stateApp/app-action';
import { EntityType } from 'src/app/shared/enums/EntityTypes';
import { MurriService } from 'src/app/shared/services/murri.service';
import { Observable, Subject, Subscription } from 'rxjs';
import { ActivatedRoute } from '@angular/router';
import { AppStore } from 'src/app/core/stateApp/app-state';
import { takeUntil } from 'rxjs/operators';
import { LoadFolders, LoadFullFolder } from '../state/folders-actions';
import { FolderStore } from '../state/folders-state';
import { FullFolder } from '../models/FullFolder';

@Component({
  selector: 'app-full-folder',
  templateUrl: './full-folder.component.html',
  styleUrls: ['./full-folder.component.scss'],
})
export class FullFolderComponent implements OnInit, OnDestroy {
  @Select(FolderStore.full)
  folder$: Observable<FullFolder>;

  destroy = new Subject<void>();

  private routeSubscription: Subscription;

  private id: string;

  constructor(
    private store: Store,
    public murriService: MurriService,
    private route: ActivatedRoute,
  ) {}

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

      this.store
        .select(AppStore.appLoaded)
        .pipe(takeUntil(this.destroy))
        .subscribe(async (x: boolean) => {
          if (x) {
            await this.store.dispatch(new LoadFullFolder(this.id)).toPromise();
            const types = this.store.selectSnapshot(AppStore.getFolderTypes);
            for (const type of types) {
              this.store.dispatch(new LoadFolders(type.id, type));
            }
          }
        });
    });
  }
}
