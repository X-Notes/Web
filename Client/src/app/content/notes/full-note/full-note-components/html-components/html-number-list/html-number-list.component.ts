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
import { BaseText } from 'src/app/content/notes/models/editor-models/base-text';
import { NoteTextTypeENUM } from 'src/app/content/notes/models/editor-models/text-models/note-text-type.enum';
import { ThemeENUM } from 'src/app/shared/enums/theme.enum';
import { ClickableSelectableEntities } from '../../../content-editor-services/models/clickable-selectable-entities.enum';
import { TransformContent } from '../../../models/transform-content.model';
import { HtmlComponentsFacadeService } from '../../html-components-services/html-components.facade.service';
import { BaseTextElementComponent } from '../html-base.component';

@Component({
  selector: 'app-html-number-list',
  templateUrl: './html-number-list.component.html',
  styleUrls: ['./html-number-list.component.scss', '../../../../../../../styles/innerNote.scss'],
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

  @Input()
  theme: ThemeENUM;

  themeE = ThemeENUM;

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
    if (this.isContentEmpty()) {
      this.transformTo.emit({
        contentId: this.content.id,
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
