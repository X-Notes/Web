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
} from '@angular/core';
import { BaseText, NoteTextTypeENUM } from 'src/app/content/notes/models/editor-models/base-text';
import { ThemeENUM } from 'src/app/shared/enums/theme.enum';
import { ContentTypeENUM } from '../../../../models/editor-models/content-types.enum';
import { EnterEvent } from '../../../models/enter-event.model';
import { ParentInteraction } from '../../../models/parent-interaction.interface';
import { SetFocus } from '../../../models/set-focus';
import { TransformContent } from '../../../models/transform-content.model';
import { HtmlBaseService } from '../html-base.service';
import { NumberListService } from '../html-business-logic/numberList.service';

@Component({
  selector: 'app-html-number-list',
  templateUrl: './html-number-list.component.html',
  styleUrls: ['./html-number-list.component.scss'],
  providers: [NumberListService],
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class HtmlNumberListComponent
  extends HtmlBaseService
  implements OnInit, OnDestroy, AfterViewInit, ParentInteraction, OnChanges {
  @Output()
  transformTo = new EventEmitter<TransformContent>();

  @Output()
  enterEvent = new EventEmitter<EnterEvent>();

  @Output()
  deleteThis = new EventEmitter<string>();

  @Output()
  concatThisWithPrev = new EventEmitter<string>();

  // eslint-disable-next-line @angular-eslint/no-output-on-prefix
  @Output()
  // eslint-disable-next-line @angular-eslint/no-output-on-prefix
  onFocus = new EventEmitter<HtmlNumberListComponent>();

  @Input()
  prevContent: BaseText;

  @Input()
  prevType: ContentTypeENUM;

  @Input()
  isReadOnlyMode = false;

  @Input()
  isSelected = false;

  @Input()
  theme: ThemeENUM;

  themeE = ThemeENUM;

  constructor(
    public numberService: NumberListService,
    private host: ElementRef,
    cdr: ChangeDetectorRef,
  ) {
    super(cdr);
  }

  get isActive() {
    return this.numberService.isActive(this.contentHtml);
  }

  getHost() {
    return this.host;
  }

  ngOnChanges(): void {
    this.setNumber();
  }

  ngAfterViewInit(): void {
    this.numberService.setHandlers(
      this.content,
      this.contentHtml,
      this.enterEvent,
      this.concatThisWithPrev,
      this.deleteThis,
    );
  }

  ngOnDestroy(): void {
    this.numberService.destroysListeners();
    this.destroy.next();
    this.destroy.complete();
  }

  ngOnInit(): void {
    this.initBaseHTML();
    this.numberService.transformTo = this.transformTo;
  }

  setNumber() {
    if (this.prevContent && this.prevContent.noteTextTypeIdSG === NoteTextTypeENUM.Numberlist) {
      // eslint-disable-next-line id-blacklist
      this.content.number = this.prevContent.number + 1;
    } else {
      // eslint-disable-next-line id-blacklist
      this.content.number = 1;
    }
  }

  isFocusToNext = () => true;

  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  setFocus(entity: SetFocus) {
    this.numberService.setFocus(this.contentHtml, this.content);
    this.onFocus.emit(this);
  }

  setFocusToEnd() {
    this.numberService.setFocusToEnd(this.contentHtml, this.content);
    this.onFocus.emit(this);
  }

  mouseEnter($event) {
    this.numberService.mouseEnter($event, this.contentHtml);
    this.isMouseOver = true;
  }

  mouseLeave($event) {
    this.numberService.mouseLeave($event, this.contentHtml);
    this.isMouseOver = false;
  }

  // eslint-disable-next-line class-methods-use-this
  backspaceUp() {}

  // eslint-disable-next-line class-methods-use-this
  backspaceDown() {}

  // eslint-disable-next-line class-methods-use-this
  deleteDown() {}
}
