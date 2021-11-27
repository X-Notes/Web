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

  destroy = new Subject<void>();

  nameCollectionChanged: Subject<string> = new Subject<string>();

  ngOnInit(): void {
    this.nameCollectionChanged
      .pipe(takeUntil(this.destroy), debounceTime(updateNoteContentDelay))
      .subscribe((name) => {
        this.changeTitleEvent.emit(name);
      });
  }

  onTitleChangeInput($event) {
    this.nameCollectionChanged.next($event.target.innerText);
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
}
