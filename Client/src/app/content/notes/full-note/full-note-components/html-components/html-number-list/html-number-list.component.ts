import {
  AfterViewInit,
  ChangeDetectionStrategy,
  ChangeDetectorRef,
  Component,
  ElementRef,
  EventEmitter,
  Input,
  OnChanges,
  OnDestroy,
  OnInit,
  Output,
  Renderer2,
} from '@angular/core';
import { ApiBrowserTextService } from 'src/app/content/notes/api-browser-text.service';
import { BaseText, NoteTextTypeENUM } from 'src/app/content/notes/models/editor-models/base-text';
import { ThemeENUM } from 'src/app/shared/enums/theme.enum';
import { ContentTypeENUM } from '../../../../models/editor-models/content-types.enum';
import { ClickableContentService } from '../../../content-editor-services/clickable-content.service';
import { SelectionService } from '../../../content-editor-services/selection.service';
import { ParentInteraction } from '../../../models/parent-interaction.interface';
import { TransformContent } from '../../../models/transform-content.model';
import { BaseTextElementComponent } from '../html-base.component';

@Component({
  selector: 'app-html-number-list',
  templateUrl: './html-number-list.component.html',
  styleUrls: ['./html-number-list.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class HtmlNumberListComponent
  extends BaseTextElementComponent
  implements OnInit, OnDestroy, AfterViewInit, ParentInteraction, OnChanges
{
  @Output()
  transformTo = new EventEmitter<TransformContent>();

  @Output()
  // eslint-disable-next-line @angular-eslint/no-output-on-prefix
  onFocus = new EventEmitter<HtmlNumberListComponent>();

  @Input()
  prevContent: BaseText;

  @Input()
  prevType: ContentTypeENUM;

  @Input()
  theme: ThemeENUM;

  themeE = ThemeENUM;

  constructor(
    private host: ElementRef,
    cdr: ChangeDetectorRef,
    apiBrowserTextService: ApiBrowserTextService,
    selectionService: SelectionService,
    clickableService: ClickableContentService,
    renderer: Renderer2,
  ) {
    super(cdr, apiBrowserTextService, selectionService, clickableService, renderer);
  }

  getHost() {
    return this.host;
  }

  ngOnChanges(): void {
    this.setNumber();
  }

  ngAfterViewInit(): void {
    this.setHandlers();
  }

  ngOnDestroy(): void {
    this.destroysListeners();
    this.destroy.next();
    this.destroy.complete();
  }

  ngOnInit(): void {
    this.initBaseHTML();
  }

  setNumber() {
    if (this.prevContent && this.prevContent.noteTextTypeId === NoteTextTypeENUM.Numberlist) {
      this.content.listNumber = this.prevContent.listNumber + 1;
    } else {
      this.content.listNumber = 1;
    }
  }

  isFocusToNext = () => true;

  // eslint-disable-next-line class-methods-use-this
  backspaceUp() {}

  // eslint-disable-next-line class-methods-use-this
  backspaceDown() {}

  // eslint-disable-next-line class-methods-use-this
  deleteDown() {}

  enter($event: any) {
    $event.preventDefault();
    if (this.isContentEmpty()) {
      this.transformTo.emit({
        id: this.content.id,
        textType: NoteTextTypeENUM.Default,
        setFocusToEnd: true,
      });
    } else {
      const breakModel = this.apiBrowser.pressEnterHandler(this.getEditableNative());
      const event = super.eventEventFactory(
        breakModel,
        NoteTextTypeENUM.Numberlist,
        this.content.id,
      );
      this.enterEvent.emit(event);
    }
  }
}
