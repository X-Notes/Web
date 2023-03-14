import {
  AfterViewInit,
  ChangeDetectionStrategy,
  ChangeDetectorRef,
  Component,
  ElementRef,
  Input,
  OnDestroy,
  OnInit,
} from '@angular/core';
import { ThemeENUM } from 'src/app/shared/enums/theme.enum';
import { ClickableSelectableEntities } from '../../../content-editor-services/models/clickable-selectable-entities.enum';
import { HtmlComponentsFacadeService } from '../../../content-editor/services/html-facade.service';
import { HeadingTypeENUM } from '../../../content-editor/text/heading-type.enum';
import { NoteTextTypeENUM } from '../../../content-editor/text/note-text-type.enum';
import { ParentInteraction } from '../../../models/parent-interaction.interface';
import { HtmlTextChangesComponent } from '../../html-text-changes-component';

@Component({
  selector: 'app-html-headings',
  templateUrl: './html-headings.component.html',
  styleUrls: ['./html-headings.component.scss', '../../../../../../../styles/innerNote.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class HtmlHeadingsComponent
  extends HtmlTextChangesComponent
  implements OnInit, OnDestroy, AfterViewInit, ParentInteraction
{
  @Input()
  theme: ThemeENUM;

  themeE = ThemeENUM;

  hType = HeadingTypeENUM;

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

  // eslint-disable-next-line class-methods-use-this
  backspaceUp() {}

  // eslint-disable-next-line class-methods-use-this
  backspaceDown() {}

  // eslint-disable-next-line class-methods-use-this
  deleteDown() {}

  enter($event: any) {
    $event.preventDefault();
    const breakModel = this.facade.apiBrowserTextService.pressEnterHandler(
      this.getEditableNative(),
    );
    const event = super.eventEventFactory(breakModel, NoteTextTypeENUM.default, this.content.id);
    this.enterEvent.emit(event);
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
