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
import { BaseTextElementComponent } from '../html-base.component';
import { ClickableSelectableEntities } from 'src/app/editor/entities-ui/clickable-selectable-entities.enum';
import { TransformContent } from 'src/app/editor/entities-ui/transform-content.model';
import { NoteTextTypeENUM } from 'src/app/editor/entities/contents/text-models/note-text-type.enum';
import { ThemeENUM } from 'src/app/shared/enums/theme.enum';
import { HtmlComponentsFacadeService } from '../../html-components.facade.service';

@Component({
  selector: 'app-html-check-list',
  templateUrl: './html-check-list.component.html',
  styleUrls: ['./html-check-list.component.scss', '../../../../../styles/innerNote.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class HtmlCheckListComponent
  extends BaseTextElementComponent
  implements OnInit, OnDestroy, AfterViewInit
{
  @Output()
  transformTo = new EventEmitter<TransformContent>();

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

  clickHandler($event: Event) {
    if (this.isReadOnlyMode) {
      $event.preventDefault();
    }
  }

  changeCheckBox() {
    this.someChangesEvent.emit();
  }

  setFocusedElement(): void {
    this.facade.clickableService.setContent(
      this.content,
      null,
      ClickableSelectableEntities.Text,
      this,
    );
  }

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
        NoteTextTypeENUM.checkList,
        this.content.id,
      );
      this.enterEvent.emit(event);
    }
  }
}
