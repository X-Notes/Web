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
  HeadingTypeENUM,
  NoteTextTypeENUM,
} from '../../models/content-model.model';
import { FullNote } from '../../models/full-note.model';
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
import { ContentEditableService } from '../services/content-editable.service';
import { FullNoteSliderService } from '../services/full-note-slider.service';
import { MenuSelectionService } from '../services/menu-selection.service';
import { SelectionService } from '../services/selection.service';
import { ApiTextService } from '../services/api-text.service';
import { ApiNoteContentService } from '../services/api-note-content.service';
import { ContentEditorContentsService } from '../content-editor-services/content-editor-contents.service';
import { ContentEditorPhotosCollectionService } from '../content-editor-services/file-content/content-editor-photos.service';
import { ContentEditorDocumentsCollectionService } from '../content-editor-services/file-content/content-editor-documents.service';
import { ContentEditorVideosCollectionService } from '../content-editor-services/file-content/content-editor-videos.service';
import { ContentEditorAudiosCollectionService } from '../content-editor-services/file-content/content-editor-audios.service';

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
    this.contentEditorContentsService.contents = contents;
  }

  get contents() {
    return this.contentEditorContentsService.contents;
  }

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
    private apiText: ApiTextService,
    private apiBrowserFunctions: ApiBrowserTextService,
    private store: Store,
    public menuSelectionService: MenuSelectionService,
    private apiNoteContent: ApiNoteContentService,
    public contentEditorContentsService: ContentEditorContentsService,
    public contentEditorAlbumService: ContentEditorPhotosCollectionService,
    public contentEditorDocumentsService: ContentEditorDocumentsCollectionService,
    public contentEditorVideosService: ContentEditorVideosCollectionService,
    public contentEditorPlaylistService: ContentEditorAudiosCollectionService,
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

  getTextContent(index: number): BaseText {
    return this.contents[index] as BaseText;
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

    switch (event.typeFile) {
      case TypeUploadFile.Photos: {
        await this.contentEditorAlbumService.transformToAlbum(this.note.id, event.contentId, event.files);
        break;
      }
      case TypeUploadFile.Audios: {
        await this.contentEditorPlaylistService.transformToAudiosCollection(this.note.id, event.contentId, event.files);
        break;
      }
      case TypeUploadFile.Documents: {
        await this.contentEditorDocumentsService.transformToDocuments(this.note.id, event.contentId, event.files);
        break;
      }
      case TypeUploadFile.Videos: {
        await this.contentEditorVideosService.transformToVideos(this.note.id, event.contentId, event.files);
        break;
      }
      default: {
        throw new Error('incorrect type');
      }
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
