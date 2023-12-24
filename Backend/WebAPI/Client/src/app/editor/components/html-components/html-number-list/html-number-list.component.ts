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
import { BaseTextElementComponent } from '../html-base.component';
import { ClickableSelectableEntities } from 'src/app/editor/entities-ui/clickable-selectable-entities.enum';
import { TransformContent } from 'src/app/editor/entities-ui/transform-content.model';
import { NoteTextTypeENUM } from 'src/app/editor/entities/contents/text-models/note-text-type.enum';
import { HtmlComponentsFacadeService } from '../../html-components.facade.service';

@Component({
  selector: 'app-html-number-list',
  templateUrl: './html-number-list.component.html',
  styleUrls: ['./html-number-list.component.scss', '../../../../../styles/innerNote.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class HtmlNumberListComponent
  extends BaseTextElementComponent
  implements OnInit, OnDestroy, AfterViewInit, OnChanges
{
  @Output()
  transformTo = new EventEmitter<TransformContent>();

  @Input()
  listNumber: number;

  constructor(
    private host: ElementRef,
    cdr: ChangeDetectorRef,
    facade: HtmlComponentsFacadeService,
  ) {
    super(cdr, facade);
  }

  get cursorShift() {
    return { top: 3, left: -1 };
  }

  getHost() {
    return this.host;
  }

  ngOnChanges(): void {}

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

  isFocusToNext = () => true;

  // eslint-disable-next-line class-methods-use-this
  backspaceUp() {}

  // eslint-disable-next-line class-methods-use-this
  backspaceDown() {}

  // eslint-disable-next-line class-methods-use-this
  deleteDown() {}

  enter($event: any) {
    $event.preventDefault();
    $event.stopPropagation();
    if (this.isContentEmpty()) {
      this.transformTo.emit({
        content: this,
        textType: NoteTextTypeENUM.default,
        setFocusToEnd: true,
      });
    } else {
      const breakModel = this.facade.apiBrowser.pressEnterHandler(this.getEditableNative());
      const event = super.eventEventFactory(
        breakModel,
        NoteTextTypeENUM.numberList,
        this.content.id,
      );
      this.enterEvent.emit(event);
    }
  }

  setFocusedElement(): void {
    this.facade.clickableService.setContent(
      this.content,
      null,
      ClickableSelectableEntities.Text,
      this,
    );
  }
}
