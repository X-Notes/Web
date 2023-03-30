import {
  AfterViewInit,
  ChangeDetectionStrategy,
  ChangeDetectorRef,
  Component,
  ElementRef,
  OnChanges,
  OnDestroy,
  OnInit,
  ViewChild,
} from '@angular/core';
import { combineLatest, Subject } from 'rxjs';
import { debounceTime, takeUntil } from 'rxjs/operators';
import { ExportService } from '../../../../../export.service';
import { ParentInteractionCollection } from '../../../../models/parent-interaction.interface';
import { FocusDirection, SetFocus } from '../../../../models/set-focus';
import { ClickableSelectableEntities } from '../../../../content-editor-services/models/clickable-selectable-entities.enum';
import { CollectionBaseComponent } from '../../collection.base.component';
import { Photo, PhotosCollection } from '../../../../../models/editor-models/photos-collection';
import { HtmlComponentsFacadeService } from '../../../html-components-services/html-components.facade.service';
import { MutateCollectionInfoAction } from '../../../../content-editor-services/models/undo/mutate-collection-info';
@Component({
  selector: 'app-photos',
  templateUrl: './photos.component.html',
  styleUrls: ['./photos.component.scss', '../../../../../../../../styles/innerNote.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class PhotosComponent
  extends CollectionBaseComponent<PhotosCollection>
  implements OnInit, OnDestroy, AfterViewInit, OnChanges, ParentInteractionCollection
{
  @ViewChild('album') albumChild: ElementRef;

  startHeight;

  uiCountInRow: number;

  mainBlocks: Photo[][] = [];

  lastBlock: Photo[] = [];

  destroy = new Subject<void>();

  changeHeightSubject = new Subject<string>();

  changeSizeAlbumHandler = combineLatest([this.changeHeightSubject]);

  constructor(
    private exportService: ExportService,
    private host: ElementRef,
    cdr: ChangeDetectorRef,
    facade: HtmlComponentsFacadeService,
  ) {
    super(cdr, ClickableSelectableEntities.Photo, facade);
  }

  get countOfBlocks() {
    return Math.floor(this.content.items.length / this.uiCountInRow);
  }

  get countLastItems() {
    return this.content.items.length % this.uiCountInRow;
  }

  get totalRows() {
    return this.countLastItems ? this.mainBlocks.length + 1 : this.mainBlocks.length;
  }

  ngOnChanges(): void {}

  changeDetectionChecker = () => {
    // console.log('Photos html changeDetectionChecker: ');
  };

  ngOnDestroy(): void {
    this.destroy.next();
    this.destroy.complete();
  }

  ngAfterViewInit(): void {
    this.setHeight(`${this.content.height}`); // init collection size first
  }

  changeHeight(difference: number) {
    const newHeight = this.startHeight + difference;
    if (newHeight > 200) {
      this.setHeight(`${newHeight}px`);
    }
  }

  syncHeight(): void {
    const height = `${this.albumChild?.nativeElement.offsetHeight}px`;
    if (this.content.height !== height) {
      this.setHeight(`${this.content.height}`);
    }
  }

  saveHeight(isResizingPhoto: boolean) {
    this.startHeight = this.albumChild.nativeElement.offsetHeight;
    this.facade.selectionService.isResizingPhoto = isResizingPhoto;
  }

  ngOnInit(): void {
    for (const photo of this.content.items) {
      photo.loaded = false;
    }
    this.changeSizeAlbumHandler
      .pipe(takeUntil(this.destroy), debounceTime(300)) // TODO export const
      .subscribe((values) => {
        let [height] = values;
        if (!height) return;
        height = height ?? 'auto';
        this.content.height = height;
        this.someChangesEvent.emit();
      });

    this.changeHeightSubject.next(this.content.height);

    this.initCountInRow(this.content.countInRow);
    this.initBlocks();
  }

  setPhotosInRowWrapper(count: number): void {
    const action = new MutateCollectionInfoAction<PhotosCollection>(
      this.content.copy(),
      this.content.id,
    );
    this.facade.momentoStateService.saveToStack(action);
    this.setPhotosInRow(count);
    this.someChangesEvent.emit();
  }

  setFalseLoadedForAllPhotos() {
    for (const mainBlock of this.mainBlocks) {
      mainBlock.forEach((photo) => {
        const item = { ...photo };
        item.loaded = false;
      });
    }
    this.lastBlock.forEach((photo) => {
      const item = { ...photo };
      item.loaded = false;
    });
  }

  async exportAlbum() {
    await this.exportService.exportAlbum(this.content);
  }

  async exportPhoto(photo: Photo) {
    await this.exportService.exportPhoto(photo);
  }

  // UPDATING
  syncCollectionItems(): void {
    this.syncPhotos();
    super.syncContentItems();
  }

  updateInternal() {
    this.setPhotosInRow(this.content.countInRow);
    this.syncHeight();
  }

  setPhotosInRow(count: number): void {
    this.initCountInRow(count);
    this.reInitPhotosToDefault();
  }

  syncPhotos(): void {
    const photosCount = this.content.items.length;
    const currentLength = this.mainBlocks.flat().length + this.lastBlock.length;
    if (photosCount !== currentLength) {
      this.reInitPhotosToDefault();
    }
  }

  reInitPhotosToDefault(): void {
    this.setFalseLoadedForAllPhotos();
    this.setHeight('auto');
    this.initBlocks();
  }

  initCountInRow(countInRow: number): void {
    this.content.countInRow = countInRow === 0 ? 2 : countInRow;
    this.uiCountInRow = this.content.countInRow;
  }

  initBlocks(): void {
    this.mainBlocks = [];
    this.lastBlock = [];
    const photoLength = this.content.items.length;
    let j = 0;
    for (let i = 0; i < this.countOfBlocks; i += 1) {
      this.mainBlocks.push(this.content.orderedItems.slice(j, j + this.uiCountInRow));
      j += this.uiCountInRow;
    }
    if (this.countLastItems > 0) {
      const start = photoLength - this.countLastItems;
      this.lastBlock = this.content.orderedItems.slice(start, photoLength);
    }
  }

  getStyle = (numb: number) => {
    switch (numb) {
      case 1: {
        return 'one-child';
      }
      case 2: {
        return 'two-child';
      }
      case 3: {
        return 'three-child';
      }
      case 4: {
        return 'fouth-child';
      }
      default: {
        return 'fouth-child';
      }
    }
  };

  isFocusToNext(entity: SetFocus) {
    if (entity.status === FocusDirection.Up && this.titleComponent.isFocusedOnTitle) {
      return true;
    }
    if (entity.status === FocusDirection.Down) {
      const index = this.content.items.findIndex((x) => x.fileId === entity.itemId);
      return index === this.content.items.length - 1;
    }
    return false;
  }

  setFocus = (entity?: SetFocus): void => {
    entity.event.preventDefault();

    const isExist = this.content.items.some((x) => x.fileId === entity.itemId);
    if (entity.status === FocusDirection.Up && isExist) {
      const index = this.content.items.findIndex((x) => x.fileId === entity.itemId);
      if (index === 0) {
        this.scrollAndFocusToTitle();
      } else {
        this.clickItemHandler(this.content.items[index - 1].fileId);
        (document.activeElement as HTMLInputElement).blur();
      }
      this.cdr.detectChanges();
      return;
    }

    if (entity.status === FocusDirection.Up && this.content.items.length > 0) {
      this.clickItemHandler(this.content.items[this.content.items.length - 1].fileId);
      (document.activeElement as HTMLInputElement).blur();
      this.cdr.detectChanges();
      return;
    }

    if (entity.status === FocusDirection.Up && this.content.items.length === 0) {
      this.scrollAndFocusToTitle();
      this.cdr.detectChanges();
      return;
    }

    if (entity.status === FocusDirection.Down && isExist) {
      const index = this.content.items.findIndex((x) => x.fileId === entity.itemId);
      this.clickItemHandler(this.content.items[index + 1].fileId);
      (document.activeElement as HTMLInputElement).blur();
      this.cdr.detectChanges();
      return;
    }

    if (entity.status === FocusDirection.Down) {
      if (this.titleComponent.isFocusedOnTitle) {
        // eslint-disable-next-line prefer-destructuring
        this.clickItemHandler(this.content.items[0].fileId);
        (document.activeElement as HTMLInputElement).blur();
      } else {
        this.scrollAndFocusToTitle();
      }
      this.cdr.detectChanges();
      return;
    }
  };

  setFocusToEnd = () => {};

  getHost() {
    return this.host;
  }

  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  mouseEnter = ($event: any) => {
    this.isMouseOver = true;
  };

  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  mouseLeave = ($event: any) => {
    this.isMouseOver = false;
  };

  // eslint-disable-next-line class-methods-use-this
  backspaceUp() {}

  backspaceDown() {
    this.checkForDelete();
  }

  deleteDown() {
    this.checkForDelete();
  }

  private setHeight(value: string): void {
    value = value ?? 'auto';
    this.facade.renderer.setStyle(this.albumChild.nativeElement, 'height', value);
    this.changeHeightSubject.next(value);
  }
}
