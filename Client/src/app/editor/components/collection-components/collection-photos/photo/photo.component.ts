import { Component, EventEmitter, Input, Output, OnInit } from '@angular/core';
import { Observable, Subject } from 'rxjs';
import { photoInit } from 'src/app/shared/services/personalization.service';
import { map } from 'rxjs/operators';
import { ThemeENUM } from 'src/app/shared/enums/theme.enum';
import { CollectionCursorUI } from 'src/app/editor/entities-ui/cursors-ui/collection-cursor-ui';
import { Photo } from 'src/app/editor/entities/contents/photos-collection';
import { ClickableContentService } from 'src/app/editor/ui-services/clickable-content.service';

@Component({
  selector: 'app-photo',
  templateUrl: './photo.component.html',
  styleUrls: ['./photo.component.scss'],
  animations: [photoInit],
})
export class PhotoComponent implements OnInit {
  @Output()
  deleteEvent = new EventEmitter<string>();

  @Output()
  downloadPhotoEvent = new EventEmitter<Photo>();

  @Output()
  clickEvent = new EventEmitter<string>();

  @Input()
  photo: Photo;

  @Input() isSelectModeActive = false;

  @Input()
  isReadOnlyMode = false;

  @Input()
  theme: ThemeENUM;

  themeE = ThemeENUM;

  @Input()
  uiCursors$: Observable<CollectionCursorUI[]>;

  destroy = new Subject<void>();

  constructor(private clickableService: ClickableContentService) { }

  get isClicked() {
    return this.clickableService.isClicked(this.photo.fileId);
  }

  get cursor$(): Observable<CollectionCursorUI> {
    return this.uiCursors$?.pipe(
      map((x) => {
        const array = x.filter((q) => q.itemId === this.photo.fileId);
        if (array.length > 0) {
          return array[0];
        }
        return null;
      }),
    );
  }

  ngOnInit(): void { }

  onLoadImage(): void {
    this.photo.loaded = true;
  }

  deletePhoto() {
    this.deleteEvent.emit(this.photo.fileId);
  }

  onMousedown(event: MouseEvent): void {
    event.stopPropagation();
    this.clickEvent.emit(this.photo.fileId);
  }
}
