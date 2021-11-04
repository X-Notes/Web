import { Component, EventEmitter, Input, Output } from '@angular/core';
import { Subject } from 'rxjs';
import { photoInit } from 'src/app/shared/services/personalization.service';
import { Photo } from '../../../models/content-model.model';
import { ClickableContentService } from '../../content-editor-services/clickable-content.service';

@Component({
  selector: 'app-photo',
  templateUrl: './photo.component.html',
  styleUrls: ['./photo.component.scss'],
  animations: [photoInit],
})
export class PhotoComponent {
  @Output()
  deleteEvent = new EventEmitter<string>();

  @Output()
  downloadPhotoEvent = new EventEmitter<Photo>();

  @Output()
  clickEvent = new EventEmitter<Photo>();

  @Input()
  photo: Photo;

  @Input()
  isReadOnlyMode = false;

  destroy = new Subject<void>();

  constructor(private clickableService: ClickableContentService) {
  }

  get isClicked() {
    return this.clickableService.id === this.photo.fileId;
  }

  onLoadImage() {
    this.photo.loaded = true;
  }

  deletePhoto() {
    this.deleteEvent.emit(this.photo.fileId);
  }
}
