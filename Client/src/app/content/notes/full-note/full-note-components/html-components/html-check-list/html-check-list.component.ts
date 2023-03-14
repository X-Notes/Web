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
import { ThemeENUM } from 'src/app/shared/enums/theme.enum';
import { ClickableSelectableEntities } from '../../../content-editor-services/models/clickable-selectable-entities.enum';
import { HtmlComponentsFacadeService } from '../../../content-editor/services/html-facade.service';
import { NoteTextTypeENUM } from '../../../content-editor/text/note-text-type.enum';
import { ParentInteraction } from '../../../models/parent-interaction.interface';
import { TransformContent } from '../../../models/transform-content.model';
import { HtmlTextChangesComponent } from '../../html-text-changes-component';

@Component({
  selector: 'app-html-check-list',
  templateUrl: './html-check-list.component.html',
  styleUrls: ['./html-check-list.component.scss', '../../../../../../../styles/innerNote.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class HtmlCheckListComponent
  extends HtmlTextChangesComponent
  implements OnInit, OnDestroy, AfterViewInit, ParentInteraction
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
        id: this.content.id,
        textType: NoteTextTypeENUM.default,
        setFocusToEnd: true,
      });
    } else {
      const breakModel = this.facade.apiBrowserTextService.pressEnterHandler(
        this.getEditableNative(),
      );
      const event = super.eventEventFactory(
        breakModel,
        NoteTextTypeENUM.checkList,
        this.content.id,
      );
      this.enterEvent.emit(event);
    }
  }
}
