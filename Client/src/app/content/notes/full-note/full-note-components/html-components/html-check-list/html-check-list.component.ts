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
import { BaseText } from '../../../../models/content-model.model';
import { EditTextEventModel } from '../../../models/edit-text-event.model';
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
  updateText = new EventEmitter<EditTextEventModel>();

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

  @ViewChild('contentHtml') contentHtml: ElementRef;

  textChanged: Subject<string> = new Subject<string>();

  destroy = new Subject<void>();

  constructor(public checkListService: CheckListService) {}

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
        this.content.content = str;
        this.updateText.emit({
          content: str,
          contentId: this.content.id,
          checked: this.content.checked,
        });
      });
  }

  setFocus($event?) {
    this.checkListService.setFocus($event, this.contentHtml);
  }

  setFocusToEnd() {
    this.checkListService.setFocusToEnd(this.contentHtml);
  }

  updateHTML(content: string) {
    this.content.content = content;
    this.contentHtml.nativeElement.innerHTML = content;
  }

  getNative() {
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
    this.content.checked = !this.content.checked;
    this.textChanged.next(this.content.content);
  }
}
