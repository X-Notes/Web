import { AfterViewInit, Component, ElementRef, Input, OnChanges, OnInit, SimpleChanges, ViewChild } from '@angular/core';
import { MatMenu } from '@angular/material/menu';
import { Actions, ofActionDispatched, Store } from '@ngxs/store';
import { Select } from '@ngxs/store';
import { interval, Observable, Subject } from 'rxjs';
import { buffer, takeUntil } from 'rxjs/operators';
import { DialogsManageService } from 'src/app/content/navigation/services/dialogs-manage.service';
import { MenuButtonsService } from 'src/app/content/navigation/services/menu-buttons.service';
import { ApiBrowserTextService } from 'src/app/content/notes/api-browser-text.service';
import { CrdtDiffsService } from 'src/app/content/notes/full-note/content-editor/crdt/crdt-diffs.service';
import { TreeRGA } from 'src/app/content/notes/full-note/content-editor/text/rga/tree-rga';
import { MergeTransaction } from 'src/app/content/notes/full-note/content-editor/text/rga/types';
import { updateFolderTitleDelay } from 'src/app/core/defaults/bounceDelay';
import { HtmlTitleService } from 'src/app/core/html-title.service';
import { ShortUser } from 'src/app/core/models/user/short-user.model';
import { UserStore } from 'src/app/core/stateUser/user-state';
import { ThemeENUM } from 'src/app/shared/enums/theme.enum';
import { EntityPopupType } from 'src/app/shared/models/entity-popup-type.enum';
import { groupBy } from 'src/app/shared/services/arrays.util';
import { DestroyComponentService } from 'src/app/shared/services/destroy-component.service';
import { EntityMapperUtil } from 'src/app/shared/services/entity-mapper.util';
import { FullFolder } from '../../../models/full-folder.model';
import { UpdateFolderTitleWS, UpdateSmallFolderTitleUI } from '../../../state/folders-actions';
import { FolderStore } from '../../../state/folders-state';

@Component({
  selector: 'app-full-folder-sub-header',
  templateUrl: './full-folder-sub-header.component.html',
  styleUrls: ['./full-folder-sub-header.component.scss'],
  providers: [DestroyComponentService],
})
export class FullFolderSubHeaderComponent implements OnInit, AfterViewInit, OnChanges {
  @ViewChild(MatMenu) menu: MatMenu;

  @ViewChild('folderTitle', { read: ElementRef }) folderTitleEl: ElementRef<HTMLInputElement>;

  @Select(UserStore.getUserBackground)
  public userBackground$: Observable<string>;

  @Select(UserStore.getUserTheme)
  public theme$: Observable<ThemeENUM>;

  theme = ThemeENUM;

  @Input()
  public folder: FullFolder;

  @Input()
  public canEdit: boolean;

  @Input()
  public user$: Observable<ShortUser>;

  isLoading = true;

  rgaTitle: TreeRGA<string>;

  uiTitle: string;

  intervalEvents = interval(updateFolderTitleDelay);

  private titleChanged$ = new Subject<{ trans: MergeTransaction<string>; folderId: string }>();

  constructor(
    public menuButtonService: MenuButtonsService,
    public store: Store,
    public dialogsService: DialogsManageService,
    private htmlTitleService: HtmlTitleService,
    private dc: DestroyComponentService,
    private diffCheckerService: CrdtDiffsService,
    private apiBrowserFunctions: ApiBrowserTextService,
    private actions$: Actions,
  ) {}

  async reInitTitle() {
    this.isLoading = true;
    this.rgaTitle = null;
    this.uiTitle = null;
    await this.loadTitle();
    this.isLoading = false;
  }

  ngOnChanges(changes: SimpleChanges): void {
    const folderChanges = changes['folder'];
    const prev = folderChanges?.previousValue;
    const current = folderChanges?.currentValue;
    if(folderChanges && folderChanges.previousValue && prev.id !== current.id) { 
      this.reInitTitle();
    }
  }

  ngAfterViewInit(): void {}

  // TITLE

  async initTitle() {
    await this.loadTitle();
    if (this.canEdit) {
      this.subscribeOnEditUI();
    }
    this.subscribeUpdates();
    this.isLoading = false;
  }

  subscribeUpdates(): void {
    this.actions$
      .pipe(takeUntil(this.dc.d$), ofActionDispatched(UpdateFolderTitleWS))
      .subscribe((obj: UpdateFolderTitleWS) => {
        if (this.folder.id === obj.folderId) {
          this.updateRGATitle(obj.transactions);
        }
      });
  }

  subscribeOnEditUI(): void {
    this.titleChanged$
      .pipe(takeUntil(this.dc.d$), buffer(this.intervalEvents))
      .subscribe((trans) => {
        if (trans.length > 0) {
          const group = groupBy(trans, (x) => x.folderId);
          for (const folderId in group) {
            const updates = group[folderId].map((x) => x.trans);
            this.store.dispatch(
              new UpdateSmallFolderTitleUI(updates, this.rgaTitle.clone(), this.folder.id),
            );
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

      this.htmlTitleService.setCustomOrDefault(this.uiTitle, 'titles.folder');
    }
  }

  pushChangesToTitle(title: string): void {
    if (this.isLoading) return;
    const user = this.store.selectSnapshot(UserStore.getUser);
    const operator = this.diffCheckerService.processTextChanges(this.rgaTitle, title, user.agentId);
    operator.apply();
    this.titleChanged$.next({ trans: operator.mergeOps, folderId: this.folder.id });
    this.htmlTitleService.setCustomOrDefault(title, 'titles.folder');
  }

  private async loadTitle() {
    if (!this.folder) {
      throw new Error('Folder is null');
    }
    this.rgaTitle = EntityMapperUtil.transformTreeRga(this.folder.title);
    this.uiTitle = this.rgaTitle.readStr();
    this.htmlTitleService.setCustomOrDefault(this.uiTitle, 'titles.folder');
  }

  ngOnInit(): void {
    this.initTitle();
  }

  getFolderMenu(folder: FullFolder) {
    if (!folder) return [];
    return this.menuButtonService.getFolderMenuByFolderType(folder.folderTypeId);
  }

  openChangeColorPopup() {
    const ids = [this.store.selectSnapshot(FolderStore.full).id];
    return this.dialogsService.openChangeColorDialog(EntityPopupType.Folder, ids);
  }
}
