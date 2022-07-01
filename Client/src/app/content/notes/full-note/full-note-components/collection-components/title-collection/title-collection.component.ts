import {
  ChangeDetectionStrategy,
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

@Component({
  selector: 'app-title-collection',
  templateUrl: './title-collection.component.html',
  styleUrls: ['./title-collection.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class TitleCollectionComponent implements OnInit, OnDestroy {
  @ViewChild('titleHtml') titleHtml: ElementRef<HTMLElement>;

  @Output()
  changeTitleEvent = new EventEmitter<string>();

  @Output()
  clickInputEvent = new EventEmitter();

  @Input()
  menu: any;

  @Input()
  isReadOnlyMode = false;

  @Input()
  isSelectionStart = false;

  @Input()
  isShowButton = false;

  @Input()
  textContent = '';

  destroy = new Subject<void>();

  nameCollectionChanged: Subject<string> = new Subject<string>();

  get isFocusedOnTitle(): boolean {
    return document.activeElement === this.titleHtml.nativeElement;
  }

  get isButtonActive(): boolean {
    return this.isShowButton && !this.isSelectionStart;
  }

  ngOnInit(): void {
    this.nameCollectionChanged
      .pipe(takeUntil(this.destroy), debounceTime(updateNoteContentDelay))
      .subscribe((name) => {
        this.changeTitleEvent.emit(name);
      });
  }

  onTitleChangeInput($event: InputEvent) {
    const text = ($event.target as HTMLInputElement).innerText;
    this.nameCollectionChanged.next(text);
  }

  ngOnDestroy(): void {
    this.destroy.next();
    this.destroy.complete();
  }

  focusOnTitle() {
    this.titleHtml.nativeElement.focus();
  }

  scrollToTitle(behavior:ScrollBehavior = 'smooth', block: ScrollLogicalPosition = 'center') {
    this.titleHtml.nativeElement.scrollIntoView({ behavior, block });
  }

  preventEnter = ($event: KeyboardEvent): void => {
    $event.preventDefault();
  };
}
