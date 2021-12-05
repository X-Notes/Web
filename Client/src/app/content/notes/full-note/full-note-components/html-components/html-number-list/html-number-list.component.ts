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
  ViewChild,
} from '@angular/core';
import { Subject } from 'rxjs';
import { debounceTime, takeUntil } from 'rxjs/operators';
import { updateNoteContentDelay } from 'src/app/core/defaults/bounceDelay';
import { ThemeENUM } from 'src/app/shared/enums/theme.enum';
import {
  BaseText,
  ContentTypeENUM,
  NoteTextTypeENUM,
} from '../../../../models/content-model.model';
import { EnterEvent } from '../../../models/enter-event.model';
import { ParentInteraction } from '../../../models/parent-interaction.interface';
import { SetFocus } from '../../../models/set-focus';
import { TransformContent } from '../../../models/transform-content.model';
import { BaseHtmlComponent } from '../../base-html-components';
import { NumberListService } from '../html-business-logic/numberList.service';

@Component({
  selector: 'app-html-number-list',
  templateUrl: './html-number-list.component.html',
  styleUrls: ['./html-number-list.component.scss'],
  providers: [NumberListService],
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class HtmlNumberListComponent
  extends BaseHtmlComponent
  implements OnInit, OnDestroy, AfterViewInit, ParentInteraction, OnChanges {
  @Output()
  updateText = new EventEmitter<BaseText>();

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
  onFocus = new EventEmitter<HtmlNumberListComponent>();

  @Input()
  prevContent: BaseText;

  @Input()
  prevType: ContentTypeENUM;

  @Input()
  content: BaseText;

  @Input()
  isReadOnlyMode = false;

  @Input()
  isSelected = false;
  
  @Input()
  theme: ThemeENUM;
  
  themeE = ThemeENUM;
  
  @ViewChild('contentHtml') contentHtml: ElementRef;

  textChanged: Subject<string> = new Subject<string>();

  destroy = new Subject<void>();

  constructor(
    public numberService: NumberListService,
    private host: ElementRef,
    cdr: ChangeDetectorRef,
  ) {
    super(cdr);
  }

  getContent() {
    return this.content;
  }

  getHost(){
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
    this.numberService.transformTo = this.transformTo;

    this.textChanged
      .pipe(takeUntil(this.destroy), debounceTime(updateNoteContentDelay))
      .subscribe((str) => {
        this.content.contentSG = str;
        this.updateText.emit(this.content);
      });
  }

  setNumber() {
    if (this.prevContent && this.prevContent.noteTextTypeIdSG === NoteTextTypeENUM.Numberlist) {
      this.content.number = this.prevContent.number + 1;
    } else {
      this.content.number = 1;
    }
  }

  isFocusToNext = () => true;
  
  setFocus(entity: SetFocus) {
    this.numberService.setFocus(this.contentHtml, this.content);
    this.onFocus.emit(this);
  }

  setFocusToEnd() {
    this.numberService.setFocusToEnd(this.contentHtml, this.content);
    this.onFocus.emit(this);
  }

  updateHTML(content: string) {
    this.content.contentSG = content;
    this.contentHtml.nativeElement.innerHTML = content;
  }

  getEditableNative() {
    return this.contentHtml?.nativeElement;
  }

  mouseEnter($event) {
    this.numberService.mouseEnter($event, this.contentHtml);
    this.isMouseOver = true;
  }

  mouseLeave($event) {
    this.numberService.mouseLeave($event, this.contentHtml);
    this.isMouseOver = false;
  }

  get isActive() {
    return this.numberService.isActive(this.contentHtml);
  }

  onInput($event) {
    this.textChanged.next($event.target.innerText);
  }

  // eslint-disable-next-line class-methods-use-this
  backspaceUp() {}

  // eslint-disable-next-line class-methods-use-this
  backspaceDown() {}

  // eslint-disable-next-line class-methods-use-this
  deleteDown() {}
}
