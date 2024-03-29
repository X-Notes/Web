import { AfterViewChecked, ChangeDetectorRef, Component, EventEmitter, Input, Output } from '@angular/core';
import { HtmlComponentsFacadeService } from './html-components.facade.service';
import { BehaviorSubject, Observable } from 'rxjs';
import { NoteUserCursorWS } from '../entities/ws/note-user-cursor';
import { ThemeENUM } from 'src/app/shared/enums/theme.enum';

@Component({
  template: '',
})
// eslint-disable-next-line @angular-eslint/component-class-suffix
export abstract class BaseEditorElementComponent implements AfterViewChecked {
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

  protected updateWS$ = new BehaviorSubject<boolean>(false);

  protected actionsAfterViewInit: (() => void)[];

  public isMouseOver = false;

  constructor(public cdr: ChangeDetectorRef, public facade: HtmlComponentsFacadeService) {
    this.cdr = cdr;
  }

  get isSelectModeActive$(): Observable<boolean> {
    return this.facade.selectionService.getSelectionDivActive$;
  }

  get isRowsSelected(): boolean {
    return this.facade.selectionService.isMultiSelect;
  }

  get isResizingPhoto$(): Observable<boolean> {
    return this.facade.selectionService.isResizingPhoto$;
  }

  detectChanges(): void {
    this.cdr.detectChanges();
  }

  markForCheck(): void {
    this.cdr.markForCheck();
  }

  addActionsAfterViewInit(actions: (() => void)[]): void {
    this.actionsAfterViewInit = actions;
  }

  executeAfterViewActions(): void {
    if (this.actionsAfterViewInit?.length > 0) {
      for (const action of this.actionsAfterViewInit) {
        if(action) {
          action();
        }
      }
      this.detectChanges();
      this.actionsAfterViewInit = [];
    }
  }

  ngAfterViewChecked(): void {
    this.executeAfterViewActions();
  }

}
