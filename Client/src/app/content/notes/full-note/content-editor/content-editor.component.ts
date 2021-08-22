import {
  Component,
  ElementRef,
  Input,
  OnDestroy,
  OnInit,
  Optional,
  QueryList,
  ViewChild,
  ViewChildren,
} from '@angular/core';
import { Store } from '@ngxs/store';
import { Subject } from 'rxjs';
import { debounceTime, takeUntil } from 'rxjs/operators';
import { updateNoteContentDelay } from 'src/app/core/defaults/bounceDelay';
import { LoadUsedDiskSpace } from 'src/app/core/stateUser/user-action';
import { ApiBrowserTextService } from '../../api-browser-text.service';
import {
  Album,
  BaseText,
  ContentModel,
  ContentTypeENUM,
  HeadingTypeENUM,
  NoteTextTypeENUM,
  Photo,
  PlaylistModel,
} from '../../models/content-model.model';
import { FullNote } from '../../models/full-note.model';
import { RemoveAudioFromPlaylist } from '../../models/remove-audio-from-playlist.model';
import { RemovePhotoFromAlbum } from '../../models/remove-photo-from-album.model';
import { UpdateTitle } from '../../state/notes-actions';
import { SelectionDirective } from '../directives/selection.directive';
import { EditTextEventModel } from '../models/edit-text-event.model';
import { EnterEvent } from '../models/enter-event.model';
import { TypeUploadFile } from '../models/enums/type-upload-file.enum';
import { NoteSnapshot } from '../models/history/note-snapshot.model';
import { LineBreakType } from '../models/html-models';
import { ParentInteraction } from '../models/parent-interaction.interface';
import { TransformContent } from '../models/transform-content.model';
import { TransformToFileContent } from '../models/transform-file-content.model';
import { UploadFileToEntity } from '../models/upload-files-to-entity';
import { ContentEditableService } from '../services/content-editable.service';
import { FullNoteSliderService } from '../services/full-note-slider.service';
import { MenuSelectionService } from '../services/menu-selection.service';
import { SelectionService } from '../services/selection.service';
import { SnackBarHandlerStatusService } from 'src/app/shared/services/snackbar/snack-bar-handler-status.service';
import { UserStore } from 'src/app/core/stateUser/user-state';
import { byteToMB } from 'src/app/core/defaults/byte-convert';
import { maxRequestFileSize } from 'src/app/core/defaults/constraints';
import { UploadFilesService } from 'src/app/shared/services/upload-files.service';
import { ApiAlbumService } from '../services/api-album.service';
import { ApiPlaylistService } from '../services/api-playlist.service';
import { ApiVideoService } from '../services/api-video.service';
import { ApiDocumentService } from '../services/api-document.service';
import { ApiTextService } from '../services/api-text.service';
import { HttpEvent, HttpEventType } from '@angular/common/http';
import { SnackBarFileProcessHandlerService } from 'src/app/shared/services/snackbar/snack-bar-file-process-handler.service';
import { OperationResult } from 'src/app/shared/models/operation-result.model';
import { LongTermOperation, OperationDetailMini } from 'src/app/content/long-term-operations-handler/models/long-term-operation';
import { LongTermOperationsHandlerService } from 'src/app/content/long-term-operations-handler/services/long-term-operations-handler.service';
import { ApiNoteContentService } from '../services/api-note-content.service';

@Component({
  selector: 'app-content-editor',
  templateUrl: './content-editor.component.html',
  styleUrls: ['./content-editor.component.scss'],
  providers: [ContentEditableService],
})
export class ContentEditorComponent implements OnInit, OnDestroy {
  @ViewChildren('htmlComp') textElements: QueryList<ParentInteraction>;

  @ViewChildren('htmlComp', { read: ElementRef }) refElements: QueryList<ElementRef>;

  @ViewChild(SelectionDirective) selectionDirective: SelectionDirective;

  @Input()
  contents: ContentModel[]; // TODO MAKE DICTIONARY

  @Input()
  isReadOnlyMode = false;

  @Input()
  note: FullNote | NoteSnapshot;

  newLine: Subject<void> = new Subject();

  contentType = ContentTypeENUM;

  textType = NoteTextTypeENUM;

  nameChanged: Subject<string> = new Subject<string>(); // CHANGE

  destroy = new Subject<void>();

  constructor(
    private selectionService: SelectionService,
    @Optional() public sliderService: FullNoteSliderService,
    private apiAlbum: ApiAlbumService,
    private apiPlaylist: ApiPlaylistService,
    private apiVideo: ApiVideoService,
    private apiDocument: ApiDocumentService,
    private apiText: ApiTextService,
    private snackBarFileProcessingHandler: SnackBarFileProcessHandlerService,
    private apiBrowserFunctions: ApiBrowserTextService,
    private store: Store,
    public menuSelectionService: MenuSelectionService,
    private uploadFilesService: UploadFilesService,
    private snackBarStatusTranslateService: SnackBarHandlerStatusService,
    private longTermOperationsHandler: LongTermOperationsHandlerService,
    private apiNoteContent: ApiNoteContentService
  ) {}

  ngOnDestroy(): void {
    this.destroy.next();
    this.destroy.complete();
  }

  ngOnInit(): void {
    this.newLine
      .pipe(takeUntil(this.destroy), debounceTime(updateNoteContentDelay))
      .subscribe(async () => {
        const resp = await this.apiNoteContent.newLine(this.note.id).toPromise();
        if (resp.success) {
          this.contents.push(resp.data);
        }
      });

    this.nameChanged
      .pipe(takeUntil(this.destroy), debounceTime(updateNoteContentDelay))
      .subscribe((title) => this.store.dispatch(new UpdateTitle(title)));
  }

  onInput($event) {
    this.nameChanged.next($event.target.innerText);
  }

  pasteCommandHandler(e) {
    this.apiBrowserFunctions.pasteCommandHandler(e);
  }

  selectionHandler(secondRect: DOMRect) {
    this.selectionService.selectionHandler(secondRect, this.refElements);
  }

  selectionStartHandler($event: DOMRect) {
    const isSelectionInZone = this.selectionService.isSelectionInZone($event, this.refElements);
    if (isSelectionInZone) {
      this.selectionService.isSelectionInside = true;
      this.selectionDirective.div.style.opacity = '0';
    } else {
      this.selectionService.isSelectionInside = false;
      this.selectionDirective.div.style.opacity = '1';
    }
  }

  async enterHandler(
    value: EnterEvent, // TODO SETTIMEOUT
  ) {
    const breakLineType = value.breakModel.typeBreakLine;
    const { nextText } = value.breakModel;
    const newElement = await this.apiNoteContent
      .insertLine(this.note.id, value.contentId, value.nextItemType, breakLineType, nextText)
      .toPromise();

    if (!newElement.success) {
      return;
    }

    const elementCurrent = this.contents.find((x) => x.id === value.id);
    let index = this.contents.indexOf(elementCurrent);

    if (breakLineType === LineBreakType.NEXT) {
      index += 1;
    }

    this.contents.splice(index, 0, newElement.data);
    setTimeout(() => {
      this.textElements?.toArray()[index].setFocus();
    }, 0);
  }

  async deleteHTMLHandler(
    id: string, // TODO SETTIMEOUT AND CHANGE LOGIC
  ) {
    const resp = await this.apiNoteContent.removeContent(this.note.id, id).toPromise();

    if (resp.success) {
      const item = this.contents.find((x) => x.id === id);
      const indexOf = this.contents.indexOf(item);
      this.contents = this.contents.filter((z) => z.id !== id);
      const index = indexOf - 1;
      this.textElements?.toArray()[index].setFocusToEnd();
    }
  }

  async concatThisWithPrev(id: string) {
    // TODO SETTIMEOUT

    const resp = await this.apiNoteContent.concatWithPrevious(this.note.id, id).toPromise();

    if (resp.success) {
      const item = this.contents.find((x) => x.id === resp.data.id) as BaseText;
      const indexOf = this.contents.indexOf(item);
      this.contents[indexOf] = resp.data;
      this.contents = this.contents.filter((x) => x.id !== id);

      setTimeout(() => {
        const prevItemHtml = this.textElements?.toArray()[indexOf];
        prevItemHtml.setFocusToEnd();
      });
    }
  }

  async transformToTypeText(value: TransformContent) {
    let indexOf;

    const resp = await this.apiText
      .updateTextType(this.note.id, value.id, value.textType, value.headingType)
      .toPromise();

    if (!resp.success) {
      return;
    }

    switch (value.textType) {
      case NoteTextTypeENUM.Default: {
        indexOf = this.defaultTextFocusClick(value.id, value.textType);
        break;
      }
      case NoteTextTypeENUM.Checklist: {
        indexOf = this.defaultTextFocusClick(value.id, value.textType);
        break;
      }
      case NoteTextTypeENUM.Dotlist: {
        indexOf = this.defaultTextFocusClick(value.id, value.textType);
        break;
      }
      case NoteTextTypeENUM.Heading: {
        indexOf = this.defaultTextFocusClick(value.id, value.textType, value.headingType);
        break;
      }
      case NoteTextTypeENUM.Numberlist: {
        indexOf = this.defaultTextFocusClick(value.id, value.textType);
        break;
      }
      default: {
        throw new Error('error');
      }
    }

    this.checkAddLastTextContent(indexOf);
  }

  checkAddLastTextContent = (index: number) => {
    /*
    if (index === this.contents.length - 1)
    {
      this.addNewElementToEnd();
    }
    */
    console.log(index);
  };

  defaultTextFocusClick(
    id: string,
    textTypeId: NoteTextTypeENUM,
    headingType?: HeadingTypeENUM,
  ): number {
    const item = this.contents.find((z) => z.id === id) as BaseText;
    const indexOf = this.contents.indexOf(item);
    item.noteTextTypeId = textTypeId;
    if (headingType) {
      item.headingTypeId = headingType;
    }
    setTimeout(() => {
      this.textElements?.toArray()[indexOf].setFocusToEnd();
    }, 0);
    return indexOf;
  }

  // eslint-disable-next-line class-methods-use-this
  async transformToFileType(event: TransformToFileContent) {

    const isCan = await this.uploadFilesService.isCanUserUploadFiles(event.files)
    if(!isCan){
      return;
    }

    switch (event.typeFile) {
      case TypeUploadFile.PHOTOS: {
        const operation = this.longTermOperationsHandler.getNewUploadToNoteOperation();
        const mini = this.longTermOperationsHandler.getOperationDetailMiniUploadToNoteOperation(operation);
        this.apiAlbum
              .insertAlbumToNote(event.formData, this.note.id, event.id)
              .pipe(takeUntil(this.destroy), x => this.snackBarFileProcessingHandler.trackFileUploadProcess(x, mini))
              .subscribe(resp => {
                if(resp.isUploaded){
                  resp.eventBody.data = new Album(resp.eventBody.data);
                  this.insertingFileHandle(resp.eventBody, event);
                }
              });
        break;
      }
      case TypeUploadFile.AUDIOS: {
        const operation = this.longTermOperationsHandler.getNewUploadToNoteOperation();
        const mini = this.longTermOperationsHandler.getOperationDetailMiniUploadToNoteOperation(operation);
        this.apiPlaylist
              .insertAudiosToNote(event.formData, this.note.id, event.id)
              .pipe(takeUntil(this.destroy), x => this.snackBarFileProcessingHandler.trackFileUploadProcess(x, mini))
              .subscribe(resp => {
                if(resp.isUploaded){
                  this.insertingFileHandle(resp.eventBody, event);
                }
              });
        break;
      }
      case TypeUploadFile.FILES: {
        const operation = this.longTermOperationsHandler.getNewUploadToNoteOperation();
        const mini = this.longTermOperationsHandler.getOperationDetailMiniUploadToNoteOperation(operation);
        this.apiDocument
              .insertDocumentsToNote(event.formData, this.note.id, event.id)
              .pipe(takeUntil(this.destroy), x => this.snackBarFileProcessingHandler.trackFileUploadProcess(x, mini))
              .subscribe(resp => {
                if(resp.isUploaded){
                  this.insertingFileHandle(resp.eventBody, event);
                }
              });
        break;
      }
      case TypeUploadFile.VIDEOS: {
        const operation = this.longTermOperationsHandler.getNewUploadToNoteOperation();
        const mini = this.longTermOperationsHandler.getOperationDetailMiniUploadToNoteOperation(operation);
        this.apiVideo
              .insertVideosToNote(event.formData, this.note.id, event.id)
              .pipe(takeUntil(this.destroy), x => this.snackBarFileProcessingHandler.trackFileUploadProcess(x, mini))
              .subscribe(resp => {
                if(resp.isUploaded){
                  this.insertingFileHandle(resp.eventBody, event);
                }
              });
        break;
      }
      default: {
        throw new Error('incorrect type');
      }
    }
  }
  
  insertingFileHandle<T extends ContentModel>(result: OperationResult<T>, event: TransformToFileContent): void {
    if (result.success) {
      const index = this.contents.findIndex((x) => x.id === event.id);
      this.contents[index] = result.data;
      this.store.dispatch(LoadUsedDiskSpace);
    }else {
      const lname = this.store.selectSnapshot(UserStore.getUserLanguage);
      this.snackBarStatusTranslateService.validateStatus(lname, result, byteToMB(maxRequestFileSize));
    }
  }

  async updateTextHandler(event: EditTextEventModel, isLast: boolean) {
    this.apiText
      .updateContentText(
        this.note.id,
        event.contentId,
        event.content,
        event.checked,
        event.isBold,
        event.isItalic,
      )
      .toPromise();
    if (isLast) {
      this.addNewElementToEnd();
    }
  }

  addNewElementToEnd() {
    this.newLine.next();
  }

  getTextContent(index: number): BaseText {
    return this.contents[index] as BaseText;
  }


  uploadPhotoToAlbumHandler = async ($event: UploadFileToEntity) => {

    const isCan = await this.uploadFilesService.isCanUserUploadFiles($event.files)
    if(!isCan){
      return;
    }

    const data = new FormData();
    for (const file of $event.files) {
      data.append('photos', file);
    }

    const resp = await this.apiAlbum
      .uploadPhotosToAlbum(data, this.note.id, $event.id)
      .toPromise();

    if (resp.success) {
      const index = this.contents.findIndex((x) => x.id === $event.id);
      const newPhotos: Photo[] = resp.data.map(
        (x) =>
          new Photo(
            x.fileId,
            x.photoPathSmall,
            x.photoPathMedium,
            x.photoPathBig,
            false,
            x.name,
            x.authorId,
          ),
      );
      const contentPhotos = (this.contents[index] as Album).photos;
      const resultPhotos = [...contentPhotos, ...newPhotos];
      const newAlbum: Album = { ...(this.contents[index] as Album), photos: resultPhotos };
      this.contents[index] = newAlbum;
      this.store.dispatch(LoadUsedDiskSpace);
    }else{
      const lname = this.store.selectSnapshot(UserStore.getUserLanguage);
      this.snackBarStatusTranslateService.validateStatus(lname, resp, byteToMB(maxRequestFileSize));
    }
  };

  async removePhotoFromAlbumHandler(event: RemovePhotoFromAlbum) {
    const resp = await this.apiAlbum
      .removePhotoFromAlbum(this.note.id, event.contentId, event.photoId)
      .toPromise();
    if (resp.success) {
      const index = this.contents.findIndex((x) => x.id === event.contentId);
      const contentPhotos = (this.contents[index] as Album).photos;
      if (contentPhotos.length === 1) {
        this.contents = this.contents.filter((x) => x.id !== event.contentId);
      } else {
        const newAlbum: Album = {
          ...(this.contents[index] as Album),
          photos: contentPhotos.filter((x) => x.fileId !== event.photoId),
        };
        this.contents[index] = newAlbum;
      }
      this.store.dispatch(LoadUsedDiskSpace);
    }
  }

  async removeAudioFromPlaylistHandler(event: RemoveAudioFromPlaylist) {
    const resp = await this.apiPlaylist
      .removeAudioFromPlaylist(this.note.id, event.contentId, event.audioId)
      .toPromise();
    if (resp.success) {
      const index = this.contents.findIndex((x) => x.id === event.contentId);
      const { audios } = this.contents[index] as PlaylistModel;
      if (audios.length === 1) {
        this.contents = this.contents.filter((x) => x.id !== event.contentId);
      } else {
        const newPlaylist: PlaylistModel = {
          ...(this.contents[index] as PlaylistModel),
          audios: audios.filter((x) => x.fileId !== event.audioId),
        };
        this.contents[index] = newPlaylist;
      }
      this.store.dispatch(LoadUsedDiskSpace);
    }
  }

  async changePlaylistName(contentId: string) {
    // TODO
    const name = 'any name';
    const resp = await this.apiPlaylist.changePlaylistName(this.note.id, contentId, name).toPromise();
    if (resp.success) {
      const index = this.contents.findIndex((x) => x.id === contentId);
      (this.contents[index] as PlaylistModel).name = name;
    }
  }

  uploadAudiosToPlaylistHandler = async ($event: UploadFileToEntity) => {

    const isCan = await this.uploadFilesService.isCanUserUploadFiles($event.files)
    if(!isCan){
      return;
    }

    const data = new FormData();
    for (const file of $event.files) {
      data.append('audios', file);
    }

    const resp = await this.apiPlaylist
      .uploadAudiosToPlaylist(data, this.note.id, $event.id)
      .toPromise();

    if (resp.success) {
      const index = this.contents.findIndex((x) => x.id === $event.id);
      const { audios } = this.contents[index] as PlaylistModel;
      const resultAudios = [...audios, ...resp.data];
      const newPlaylist: PlaylistModel = {
        ...(this.contents[index] as PlaylistModel),
        audios: resultAudios,
      };
      this.contents[index] = newPlaylist;
      this.store.dispatch(LoadUsedDiskSpace);
    }else{
      const lname = this.store.selectSnapshot(UserStore.getUserLanguage);
      this.snackBarStatusTranslateService.validateStatus(lname, resp, byteToMB(maxRequestFileSize));
    }
  };



  removeVideoHandler = async (id: string) => {
    const resp = await this.apiVideo.removeVideoFromNote(this.note.id, id).toPromise();
    if (resp.success) {
      this.contents = this.contents.filter((x) => x.id !== id);
      this.store.dispatch(LoadUsedDiskSpace);
    }
  };

  removeDocumentHandler = async (id: string) => {
    const resp = await this.apiDocument.removeDocumentFromNote(this.note.id, id).toPromise();
    if (resp.success) {
      this.contents = this.contents.filter((x) => x.id !== id);
      this.store.dispatch(LoadUsedDiskSpace);
    }
  };

  removeAlbumHandler = async (id: string) => {
    const resp = await this.apiAlbum.removeAlbum(this.note.id, id).toPromise();
    if (resp.success) {
      this.contents = this.contents.filter((x) => x.id !== id);
      this.store.dispatch(LoadUsedDiskSpace);
    }
  };

  removePlaylistHandler = async (id: string) => {
    const resp = await this.apiPlaylist.removePlaylist(this.note.id, id).toPromise();
    if (resp.success) {
      this.contents = this.contents.filter((x) => x.id !== id);
      this.store.dispatch(LoadUsedDiskSpace);
    }
  };

  placeHolderClick($event) {
    $event.preventDefault();
    setTimeout(() => this.textElements?.last?.setFocus());
  }

  mouseEnter($event) {
    const native = this.textElements?.last?.getNative();
    if (native?.textContent.length !== 0) {
      this.addNewElementToEnd();
    }
    this.textElements?.last?.mouseEnter($event);
  }

  mouseOut($event) {
    this.textElements?.last?.mouseOut($event);
  }
}
