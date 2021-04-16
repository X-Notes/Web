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
import { debounceTime, take, takeUntil } from 'rxjs/operators';
import { updateNoteContentDelay } from 'src/app/core/defaults/bounceDelay';
import { BaseText } from '../../../models/ContentMode';
import { EditTextEventModel } from '../../../models/EditTextEventModel';
import { EnterEvent } from '../../../models/enterEvent';
import { ParentInteraction } from '../../../models/parent-interaction.interface';
import { TransformContent } from '../../../models/transform-content';
import { CheckListService } from '../../html-business-logic/checkList.service';

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
    this.checkListService.contentStr = this.content?.content;
    this.checkListService.transformTo = this.transformTo;

    this.textChanged
      .pipe(takeUntil(this.destroy), debounceTime(updateNoteContentDelay))
      .subscribe((str) => this.updateText.emit({ content: str, contentId: this.content.id }));
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

  async changeCheckBox() {
    this.content.checked = !this.content.checked;
    const str = await this.textChanged.pipe(take(1)).toPromise();
    this.updateText.emit({
      content: str,
      contentId: this.content.id,
      checked: this.content.checked,
    });
  }
}
