import { Component, OnInit, Input, OnDestroy, ViewChild, ElementRef } from '@angular/core';
import { Actions, Store } from '@ngxs/store';
import { interval, Subject } from 'rxjs';
import { takeUntil, buffer } from 'rxjs/operators';
import { Router } from '@angular/router';
import { PersonalizationService } from 'src/app/shared/services/personalization.service';
import { EntitiesSizeENUM } from 'src/app/shared/enums/font-size.enum';
import { updateFolderTitleDelay, } from 'src/app/core/defaults/bounceDelay';
import { SelectIdFolder, UnSelectIdFolder, UpdateSmallFolderTitleUI } from '../state/folders-actions';
import { FolderStore } from '../state/folders-state';
import { SmallFolder } from '../models/folder.model';
import { FolderTypeENUM } from 'src/app/shared/enums/folder-types.enum';
import { ApiBrowserTextService } from '../../notes/api-browser-text.service';
import { UserStore } from 'src/app/core/stateUser/user-state';
import { CrdtDiffsService } from '../../notes/full-note/content-editor/crdt/crdt-diffs.service';
import { TreeRGA } from '../../notes/full-note/content-editor/text/rga/tree-rga';
import { DestroyComponentService } from 'src/app/shared/services/destroy-component.service';
import { MergeTransaction } from '../../notes/full-note/content-editor/text/rga/types';
import { groupBy } from 'src/app/shared/services/arrays.util';

@Component({
  selector: 'app-folder',
  templateUrl: './folder.component.html',
  styleUrls: ['./folder.component.scss'],
  providers: [DestroyComponentService]
})
export class FolderComponent implements OnInit, OnDestroy {
  @Input() folder: SmallFolder;

  @ViewChild('folderTitle', { read: ElementRef }) folderTitleEl: ElementRef<HTMLInputElement>;

  @Input() date: string;

  @Input() isShowWrightRead = false;

  @Input() tooltipDateMessage: string;

  @Input() isSelectedMode: boolean;

  @Input() userId: string;

  fontSize = EntitiesSizeENUM;

  folderType = FolderTypeENUM;

  isLoading = true;

  // TITLE
  uiTitle: string;

  rgaTitle: TreeRGA<string>;

  intervalEvents = interval(updateFolderTitleDelay);

  private folderTitleChanged$ = new Subject<{ trans: MergeTransaction<string>; folderId: string }>();
  //

  constructor(
    private store: Store,
    private router: Router,
    public pService: PersonalizationService,
    private diffCheckerService: CrdtDiffsService,
    private apiBrowserFunctions: ApiBrowserTextService,
    private destroyComponentService: DestroyComponentService,
    public actions$: Actions,
  ) {}

  get isAuthor(): boolean {
    return this.userId === this.folder.userId;
  }

  // TITLE
  setTitle(): void {
    // SET
    this.rgaTitle = this.folder.title.clone();
    this.uiTitle = this.rgaTitle.readStr();
    if(this.folder.isCanEdit) {
      this.subscribeOnEditUI();
    }
  }

  subscribeOnEditUI(): void {
    this.folderTitleChanged$
      .pipe(takeUntil(this.destroyComponentService.d$), buffer(this.intervalEvents))
      .subscribe((trans) => {
        if (trans.length > 0) {
          const group = groupBy(trans, (x) => x.folderId);
          for (const folderId in group) {
            const updates = group[folderId].map((x) => x.trans);
            this.store.dispatch(new UpdateSmallFolderTitleUI(updates, this.rgaTitle.clone(), this.folder.id));
          }
        }
      });
  }

  updateRGATitle(trans: MergeTransaction<string>[]) {
    if (this.folderTitleEl?.nativeElement) {
      const el = this.folderTitleEl.nativeElement;
      const pos = this.apiBrowserFunctions.getInputSelection(el);

      this.rgaTitle.merge(trans);
      this.uiTitle = this.rgaTitle.readStr();

      requestAnimationFrame(() => this.apiBrowserFunctions.setCaretInput(el, pos));
    }
  }

  pushChangesToTitle(title: string): void {
    if (this.isLoading) return;
    const user = this.store.selectSnapshot(UserStore.getUser);
    const operator = this.diffCheckerService.processTextChanges(
      this.rgaTitle,
      title,
      user.agentId,
    );
    operator.apply();
    this.folderTitleChanged$.next({ trans: operator.mergeOps, folderId: this.folder.id });
  }
  

  ngOnInit(): void {
    this.setTitle();
    this.isLoading = false;
  }

  tryFind(q: string[]): boolean {
    const exist = q.find((id) => id === this.folder.id);
    return exist !== undefined;
  }

  handelEntityClick($event: MouseEvent, id: string) {
    if (this.isSelectedMode) {
      this.highlight(id);
    }
  }

  highlight(id: string) {
    const ids = this.store.selectSnapshot(FolderStore.selectedIds);
    if (!this.folder.isSelected) {
      this.store.dispatch(new SelectIdFolder(id, ids));
    } else {
      this.store.dispatch(new UnSelectIdFolder(id, ids));
    }
  }

  toFolder($event: MouseEvent) {
    $event.stopPropagation();
    $event.preventDefault();
    const flag = this.store.selectSnapshot(FolderStore.selectedCount) > 0;
    if (flag) {
      this.highlight(this.folder.id);
    } else {
      this.router.navigate([`folders/${this.folder.id}`]);
    }
  }

  shadeColor = (color, percent) => {
    let R = parseInt(color.substring(1, 3), 16);
    let G = parseInt(color.substring(3, 5), 16);
    let B = parseInt(color.substring(5, 7), 16);

    R = parseInt(((R * (100 + percent)) / 100).toString(), 10);
    G = parseInt(((G * (100 + percent)) / 100).toString(), 10);
    B = parseInt(((B * (100 + percent)) / 100).toString(), 10);

    R = R < 255 ? R : 255;
    G = G < 255 ? G : 255;
    B = B < 255 ? B : 255;

    const RR = R.toString(16).length === 1 ? `0${R.toString(16)}` : R.toString(16);
    const GG = G.toString(16).length === 1 ? `0${G.toString(16)}` : G.toString(16);
    const BB = B.toString(16).length === 1 ? `0${B.toString(16)}` : B.toString(16);

    return `#${RR}${GG}${BB}`;
  };

  ngOnDestroy(): void {}
}
