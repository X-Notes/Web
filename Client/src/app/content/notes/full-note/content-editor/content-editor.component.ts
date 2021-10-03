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
import { ApiBrowserTextService } from '../../api-browser-text.service';
import {
  BaseText,
  ContentModel,
  ContentTypeENUM,
  NoteTextTypeENUM,
} from '../../models/content-model.model';
import { FullNote } from '../../models/full-note.model';
import { UpdateTitle } from '../../state/notes-actions';
import { SelectionDirective } from '../directives/selection.directive';
import { EnterEvent } from '../models/enter-event.model';
import { TypeUploadFile } from '../models/enums/type-upload-file.enum';
import { NoteSnapshot } from '../models/history/note-snapshot.model';
import { ParentInteraction } from '../models/parent-interaction.interface';
import { TransformContent } from '../models/transform-content.model';
import { TransformToFileContent } from '../models/transform-file-content.model';
import { ContentEditableService } from '../services/content-editable.service';
import { FullNoteSliderService } from '../services/full-note-slider.service';
import { MenuSelectionService } from '../services/menu-selection.service';
import { SelectionService } from '../services/selection.service';
import { ContentEditorContentsService } from '../content-editor-services/content-editor-contents.service';
import { ContentEditorPhotosCollectionService } from '../content-editor-services/file-content/content-editor-photos.service';
import { ContentEditorDocumentsCollectionService } from '../content-editor-services/file-content/content-editor-documents.service';
import { ContentEditorVideosCollectionService } from '../content-editor-services/file-content/content-editor-videos.service';
import { ContentEditorAudiosCollectionService } from '../content-editor-services/file-content/content-editor-audios.service';
import { ContentEditorTextService } from '../content-editor-services/text-content/content-editor-text.service';

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

  @Input() set contents(contents: ContentModel[]) {
    this.contentEditorContentsService.initContent(contents);
  }

  get contents() {
    return this.contentEditorContentsService.getContents;
  }

  @Input()
  isReadOnlyMode = false;

  @Input()
  note: FullNote | NoteSnapshot;

  contentType = ContentTypeENUM;

  textType = NoteTextTypeENUM;

  nameChanged: Subject<string> = new Subject<string>(); // CHANGE

  destroy = new Subject<void>();

  constructor(
    private selectionService: SelectionService,
    @Optional() public sliderService: FullNoteSliderService,
    private apiBrowserFunctions: ApiBrowserTextService,
    private store: Store,
    public menuSelectionService: MenuSelectionService,
    public contentEditorContentsService: ContentEditorContentsService,
    public contentEditorAlbumService: ContentEditorPhotosCollectionService,
    public contentEditorDocumentsService: ContentEditorDocumentsCollectionService,
    public contentEditorVideosService: ContentEditorVideosCollectionService,
    public contentEditorPlaylistService: ContentEditorAudiosCollectionService,
    public contentEditorTextService: ContentEditorTextService,
  ) {}

  ngOnDestroy(): void {
    this.destroy.next();
    this.destroy.complete();
  }

  ngOnInit(): void {
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

  enterHandler(value: EnterEvent) {
    const index = this.contentEditorTextService.insertNewContent(
      value.contentId,
      value.nextItemType,
      value.breakModel.typeBreakLine,
      value.breakModel.nextText,
    );
    setTimeout(() => this.textElements?.toArray()[index].setFocus());
    this.postAction();
  }

  deleteRowHandler(id: string) {
    const index = this.contentEditorTextService.deleteContent(id);
    this.textElements?.toArray()[index].setFocusToEnd();
    this.postAction();
  }

  concatThisWithPrev(id: string) {
    const index = this.contentEditorTextService.concatContentWithPrevContent(id);
    setTimeout(() => {
      const prevItemHtml = this.textElements?.toArray()[index];
      prevItemHtml.setFocusToEnd();
    });
    this.postAction();
  }

  getTextContent(index: number): BaseText {
    return this.contents[index] as BaseText;
  }

  transformToTypeText(value: TransformContent) {
    const index = this.contentEditorTextService.tranformTextContentTo(value);
    setTimeout(() => this.textElements?.toArray()[index].setFocusToEnd());
    this.postAction();
  }

  // eslint-disable-next-line class-methods-use-this
  async transformToFileType(event: TransformToFileContent) {
    switch (event.typeFile) {
      case TypeUploadFile.Photos: {
        await this.contentEditorAlbumService.transformToAlbum(
          this.note.id,
          event.contentId,
          event.files,
        );
        break;
      }
      case TypeUploadFile.Audios: {
        await this.contentEditorPlaylistService.transformToAudiosCollection(
          this.note.id,
          event.contentId,
          event.files,
        );
        break;
      }
      case TypeUploadFile.Documents: {
        await this.contentEditorDocumentsService.transformToDocuments(
          this.note.id,
          event.contentId,
          event.files,
        );
        break;
      }
      case TypeUploadFile.Videos: {
        await this.contentEditorVideosService.transformToVideos(
          this.note.id,
          event.contentId,
          event.files,
        );
        break;
      }
      default: {
        throw new Error('incorrect type');
      }
    }
  }

  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  updateTextHandler(content: BaseText, isLast: boolean) {
    this.postAction();
  }

  postAction(): void {
    this.contentEditorContentsService.change();
    const native = this.textElements?.last?.getNative();
    if (native?.textContent.length !== 0) {
      this.contentEditorTextService.appendNewEmptyContentToEnd();
    }
  }

  placeHolderClick($event) {
    $event.preventDefault();
    setTimeout(() => this.textElements?.last?.setFocus());
  }

  mouseEnter($event) {
    this.textElements?.last?.mouseEnter($event);
  }

  mouseOut($event) {
    this.textElements?.last?.mouseOut($event);
  }
}
