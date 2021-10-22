import {
  AfterViewInit,
  Component,
  ElementRef,
  EventEmitter,
  Input,
  OnDestroy,
  OnInit,
  Output,
  ViewChild,
} from '@angular/core';
import { Subject } from 'rxjs';
import { debounceTime, takeUntil } from 'rxjs/operators';
import { updateNoteContentDelay } from 'src/app/core/defaults/bounceDelay';
import { ThemeENUM } from 'src/app/shared/enums/theme.enum';
import { BaseText } from '../../../../models/content-model.model';
import { EnterEvent } from '../../../models/enter-event.model';
import { ParentInteraction } from '../../../models/parent-interaction.interface';
import { TransformContent } from '../../../models/transform-content.model';
import { CheckListService } from '../../html-business-logic/check-list.service';

@Component({
  selector: 'app-html-check-list',
  templateUrl: './html-check-list.component.html',
  styleUrls: ['./html-check-list.component.scss'],
  providers: [CheckListService],
})
export class HtmlCheckListComponent implements OnInit, OnDestroy, AfterViewInit, ParentInteraction {
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

  constructor(public checkListService: CheckListService, private host: ElementRef) {}

  getHost(){
    return this.host;
  }
  
  getContent() {
    return this.content;
  }

  ngAfterViewInit(): void {
    this.checkListService.setHandlers(
      this.content,
      this.contentHtml,
      this.enterEvent,
      this.concatThisWithPrev,
      this.deleteThis,
    );
  }

  ngOnDestroy(): void {
    this.checkListService.destroysListeners();
    this.destroy.next();
    this.destroy.complete();
  }

  ngOnInit(): void {
    this.checkListService.transformTo = this.transformTo;

    this.textChanged
      .pipe(takeUntil(this.destroy), debounceTime(updateNoteContentDelay))
      .subscribe((str) => {
        this.content.contentSG = str;
        this.updateText.emit(this.content);
      });
  }

  setFocus($event?) {
    this.checkListService.setFocus($event, this.contentHtml, this.content);
  }

  setFocusToEnd() {
    this.checkListService.setFocusToEnd(this.contentHtml, this.content);
  }

  updateHTML(content: string) {
    this.content.contentSG = content;
    this.contentHtml.nativeElement.innerHTML = content;
  }

  getEditableNative() {
    return this.contentHtml?.nativeElement;
  }

  mouseEnter($event) {
    this.checkListService.mouseEnter($event, this.contentHtml);
  }

  mouseOut($event) {
    this.checkListService.mouseOut($event, this.contentHtml);
  }

  get isActive() {
    return this.checkListService.isActive(this.contentHtml);
  }

  onInput($event) {
    this.textChanged.next($event.target.innerText);
  }

  clickHandler($event: Event) {
    if (this.isReadOnlyMode) {
      $event.preventDefault();
    }
  }

  async changeCheckBox() {
    this.content.checkedSG = !this.content.checkedSG;
    this.textChanged.next(this.content.contentSG);
  }

  // eslint-disable-next-line class-methods-use-this
  backspaceUp() {}

  // eslint-disable-next-line class-methods-use-this
  backspaceDown() {}

  // eslint-disable-next-line class-methods-use-this
  deleteDown() {}
}
