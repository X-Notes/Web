import {
  AfterViewInit,
  ChangeDetectionStrategy,
  ChangeDetectorRef,
  Component,
  ElementRef,
  EventEmitter,
  Input,
  OnDestroy,
  OnInit,
  Output,
} from '@angular/core';
import { ApiBrowserTextService } from 'src/app/content/notes/api-browser-text.service';
import { ThemeENUM } from 'src/app/shared/enums/theme.enum';
import { EnterEvent } from '../../../models/enter-event.model';
import { ParentInteraction } from '../../../models/parent-interaction.interface';
import { SetFocus } from '../../../models/set-focus';
import { TransformContent } from '../../../models/transform-content.model';
import { HtmlBaseService } from '../html-base.service';
import { CheckListService } from '../html-business-logic/check-list.service';

@Component({
  selector: 'app-html-check-list',
  templateUrl: './html-check-list.component.html',
  styleUrls: ['./html-check-list.component.scss'],
  providers: [CheckListService],
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class HtmlCheckListComponent
  extends HtmlBaseService
  implements OnInit, OnDestroy, AfterViewInit, ParentInteraction
{
  @Output()
  transformTo = new EventEmitter<TransformContent>();

  @Output()
  enterEvent = new EventEmitter<EnterEvent>();

  @Output()
  deleteThis = new EventEmitter<string>();

  @Output()
  concatThisWithPrev = new EventEmitter<string>();

  @Output()
  // eslint-disable-next-line @angular-eslint/no-output-on-prefix
  onFocus = new EventEmitter<HtmlCheckListComponent>();

  @Input()
  isReadOnlyMode = false;

  @Input()
  isSelected = false;

  @Input()
  theme: ThemeENUM;

  themeE = ThemeENUM;

  constructor(
    public checkListService: CheckListService,
    private host: ElementRef,
    cdr: ChangeDetectorRef,
    apiBrowserTextService: ApiBrowserTextService,
  ) {
    super(cdr, apiBrowserTextService);
  }

  get isActive() {
    return this.checkListService.isActive(this.contentHtml);
  }

  getHost() {
    return this.host;
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
    this.initBaseHTML();
    this.checkListService.transformTo = this.transformTo;
  }

  isFocusToNext = () => true;

  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  setFocus(entity: SetFocus) {
    this.checkListService.setFocus(this.contentHtml, this.content);
    this.onFocus.emit(this);
  }

  setFocusToEnd() {
    this.checkListService.setFocusToEnd(this.contentHtml, this.content);
    this.onFocus.emit(this);
  }

  mouseEnter($event) {
    this.checkListService.mouseEnter($event, this.contentHtml);
    this.isMouseOver = true;
  }

  mouseLeave($event) {
    this.checkListService.mouseLeave($event, this.contentHtml);
    this.isMouseOver = false;
  }

  clickHandler($event: Event) {
    if (this.isReadOnlyMode) {
      $event.preventDefault();
    }
  }

  async changeCheckBox() {
    this.content.checkedSG = !this.content.checkedSG;
    // this.textChanged.next(this.content.contentSG); TODO
  }

  // eslint-disable-next-line class-methods-use-this
  backspaceUp() {}

  // eslint-disable-next-line class-methods-use-this
  backspaceDown() {}

  // eslint-disable-next-line class-methods-use-this
  deleteDown() {}
}
