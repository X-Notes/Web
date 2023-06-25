import { ChangeDetectorRef, Component, EventEmitter, Input, Output } from '@angular/core';
import { HtmlComponentsFacadeService } from './html-components.facade.service';
import { Observable } from 'rxjs';
import { NoteUserCursorWS } from '../entities/ws/note-user-cursor';
import { ThemeENUM } from 'src/app/shared/enums/theme.enum';

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
  theme: ThemeENUM;
  
  themeE = ThemeENUM;
  
  @Input()
  cursors$: Observable<NoteUserCursorWS[]>;

  @Output()
  someChangesEvent = new EventEmitter();

  public isMouseOver = false;

  constructor(public cdr: ChangeDetectorRef, public facade: HtmlComponentsFacadeService) {
    this.cdr = cdr;
  }

  get isSelectModeActive$(): Observable<boolean> {
    return this.facade.selectionService.getSelectionDivActive$;
  }

  get selectionDivActiveMultiplyRows$(): Observable<boolean> {
    return this.facade.selectionService.getSelectionDivActiveMultiplyRows$;
  }

  detectChanges(): void {
    this.cdr.detectChanges();
  }

  markForCheck(): void {
    this.cdr.markForCheck();
  }
}
