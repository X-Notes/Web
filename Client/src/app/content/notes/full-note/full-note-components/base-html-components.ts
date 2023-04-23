import { ChangeDetectorRef, Component, EventEmitter, Input, Output } from '@angular/core';
import { HtmlComponentsFacadeService } from './html-components-services/html-components.facade.service';
import { Observable } from 'rxjs';
import { NoteUserCursorWS } from 'src/app/core/models/signal-r/innerNote/note-user-cursor';

@Component({
  template: '',
})
// eslint-disable-next-line @angular-eslint/component-class-suffix
export abstract class BaseEditorElementComponent {
  @Input()
  isReadOnlyMode = false;

  @Input()
  isSelected = false;

  @Input()
  cursors$: Observable<NoteUserCursorWS[]>;

  @Output()
  someChangesEvent = new EventEmitter();

  public isMouseOver = false;

  constructor(public cdr: ChangeDetectorRef, public facade: HtmlComponentsFacadeService) {
    this.cdr = cdr;
  }

  get isSelectModeActive(): boolean {
    return this.facade.selectionService.selectionDivActive$.getValue();
  }

  detectChanges(): void {
    this.cdr.detectChanges();
  }

  markForCheck(): void {
    this.cdr.markForCheck();
  }
}
