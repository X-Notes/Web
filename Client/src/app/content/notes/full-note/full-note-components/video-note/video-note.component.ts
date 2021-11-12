import { Component, ElementRef, EventEmitter, Input, Output } from '@angular/core';
import { ThemeENUM } from 'src/app/shared/enums/theme.enum';
import { ExportService } from '../../../export.service';
import { VideoModel, VideosCollection } from '../../../models/content-model.model';
import { ParentInteraction } from '../../models/parent-interaction.interface';
import { ClickableContentService } from '../../content-editor-services/clickable-content.service';
import { SetFocus } from '../../models/set-focus';
import { ClickableSelectableEntities } from '../../content-editor-services/clickable-selectable-entities.enum';

@Component({
  selector: 'app-video-note',
  templateUrl: './video-note.component.html',
  styleUrls: ['./video-note.component.scss'],
})
export class VideoNoteComponent implements ParentInteraction {
  @Input()
  content: VideosCollection;

  @Input()
  isReadOnlyMode = false;

  @Input()
  isSelected = false;

  @Input()
  theme: ThemeENUM;

  @Output()
  deleteContentEvent = new EventEmitter<string>();

  @Output()
  deleteVideoEvent = new EventEmitter<string>();

  constructor(
    private exportService: ExportService,
    private clickableContentService: ClickableContentService,
    private host: ElementRef,
  ) {}

  clickVideoHandler(video: VideoModel) {
    this.clickableContentService.set(
      ClickableSelectableEntities.Video,
      video.fileId,
      this.content.id,
    );
  }

  isFocusToNext(entity: SetFocus) {
    console.log('TO DO');
    return true;
  }

  setFocus = (entity?: SetFocus) => {
    console.log(entity);
  };

  setFocusToEnd = () => {};

  updateHTML = (content: string) => {};

  getEditableNative = () => {};

  getHost() {
    return this.host;
  }

  getContent() {
    return this.content;
  }

  async exportVideos(videos: VideosCollection) {
    await this.exportService.exportVideos(videos);
  }

  async exportVideo(video: VideoModel) {
    await this.exportService.exportVideo(video);
  }

  get isEmpty(): boolean {
    if (!this.content.videos || this.content.videos.length === 0) {
      return true;
    }
    return false;
  }

  get getFirst() {
    if (this.content.videos && this.content.videos.length > 0) {
      return this.content.videos[0];
    }
    return null;
  }

  mouseEnter = ($event: any) => {};

  mouseOut = ($event: any) => {};

  // eslint-disable-next-line class-methods-use-this
  backspaceUp() {}

  backspaceDown() {
    this.checkForDelete();
  }

  deleteDown() {
    this.checkForDelete();
  }

  checkForDelete() {
    const video = this.content.videos.find((x) => this.clickableContentService.isClicked(x.fileId));
    if (video) {
      this.deleteVideoEvent.emit(video.fileId);
    }
  }
}
