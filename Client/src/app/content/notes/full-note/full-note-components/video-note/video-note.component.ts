import { Component, EventEmitter, Input, Output } from '@angular/core';
import { ExportService } from '../../../export.service';
import { VideoModel, VideosCollection } from '../../../models/content-model.model';
import { ParentInteraction } from '../../models/parent-interaction.interface';
import {
  ClickableContentService,
  ClickableSelectableEntities,
} from '../../content-editor-services/clickable-content.service';

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

  @Output()
  deleteContentEvent = new EventEmitter<string>();

  @Output()
  deleteVideoEvent = new EventEmitter<string>();

  constructor(
    private exportService: ExportService,
    private clickableContentService: ClickableContentService,
  ) {}

  clickVideoHandler(video: VideoModel) {
    this.clickableContentService.set(
      ClickableSelectableEntities.Video,
      video.fileId,
      this.content.id,
    );
  }

  setFocus = ($event?: any) => {};

  setFocusToEnd = () => {};

  updateHTML = (content: string) => {};

  getNative = () => {};

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
    const videoId = this.clickableContentService.id;
    if (
      this.clickableContentService.collectionId === this.content.id &&
      this.content.videos.some((x) => x.fileId === videoId)
    ) {
      this.deleteVideoEvent.emit(videoId);
    }
  }
}
