import { Component, EventEmitter, Input, Output, OnInit } from '@angular/core';
import { Subject } from 'rxjs';
import { photoInit } from 'src/app/shared/services/personalization.service';
import { Photo } from '../../../../../models/editor-models/photos-collection';
import { ClickableContentService } from '../../../../content-editor-services/clickable-content.service';

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

  destroy = new Subject<void>();

  constructor(private clickableService: ClickableContentService) {}

  get isClicked() {
    return this.clickableService.isClicked(this.photo.fileId);
  }

  ngOnInit(): void {}

  onLoadImage(): void {
    this.photo.loaded = true;
  }

  deletePhoto() {
    this.deleteEvent.emit(this.photo.fileId);
  }
}
