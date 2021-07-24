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
import { BaseText } from '../../../models/content-model.model';
import { EditTextEventModel } from '../../../full-note/models/edit-text-event.model';
import { EnterEvent } from '../../../full-note/models/enter-event.model';
import { ParentInteraction } from '../../../full-note/models/parent-interaction.interface';
import { TransformContent } from '../../../models/transform-content.model';
import { DotListService } from '../../html-business-logic/dot-list.service';

@Component({
  selector: 'app-html-dot-list',
  templateUrl: './html-dot-list.component.html',
  styleUrls: ['./html-dot-list.component.scss'],
  providers: [DotListService],
})
export class HtmlDotListComponent implements OnInit, OnDestroy, AfterViewInit, ParentInteraction {
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

  constructor(public dotListService: DotListService) {}

  getContent() {
    return this.content;
  }

  ngAfterViewInit(): void {
    this.dotListService.setHandlers(
      this.content,
      this.contentHtml,
      this.enterEvent,
      this.concatThisWithPrev,
      this.deleteThis,
    );
  }

  ngOnDestroy(): void {
    this.dotListService.destroysListeners();
    this.destroy.next();
    this.destroy.complete();
  }

  ngOnInit(): void {
    this.dotListService.transformTo = this.transformTo;

    this.textChanged
      .pipe(takeUntil(this.destroy), debounceTime(updateNoteContentDelay))
      .subscribe((str) => {
        this.content.content = str;
        this.updateText.emit({ content: str, contentId: this.content.id });
      });
  }

  setFocus($event?) {
    this.dotListService.setFocus($event, this.contentHtml);
  }

  setFocusToEnd() {
    this.dotListService.setFocusToEnd(this.contentHtml);
  }

  updateHTML(content: string) {
    this.content.content = content;
    this.contentHtml.nativeElement.innerHTML = content;
  }

  getNative() {
    return this.contentHtml?.nativeElement;
  }

  mouseEnter($event) {
    this.dotListService.mouseEnter($event, this.contentHtml);
  }

  mouseOut($event) {
    this.dotListService.mouseOut($event, this.contentHtml);
  }

  get isActive() {
    return this.dotListService.isActive(this.contentHtml);
  }

  onInput($event) {
    this.textChanged.next($event.target.innerText);
  }
}
