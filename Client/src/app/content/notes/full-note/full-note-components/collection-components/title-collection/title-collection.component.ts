import {
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
})
export class TitleCollectionComponent implements OnInit, OnDestroy {
  @ViewChild('titleHtml') titleHtml: ElementRef;

  @Output()
  changeTitleEvent = new EventEmitter<string>();

  @Output()
  clickInputEvent = new EventEmitter();

  @Input()
  menu: any;

  @Input()
  isReadOnlyMode = false;

  @Input()
  isShowButton = false;

  @Input()
  textContent = '';

  title = '';

  destroy = new Subject<void>();

  nameCollectionChanged: Subject<string> = new Subject<string>();

  ngOnInit(): void {
    this.title = this.textContent;
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

  get isFocusedOnTitle(): boolean {
    return document.activeElement === this.titleHtml.nativeElement;
  }

  preventEnter = ($event: KeyboardEvent): void => {
    $event.preventDefault();
  };
}
