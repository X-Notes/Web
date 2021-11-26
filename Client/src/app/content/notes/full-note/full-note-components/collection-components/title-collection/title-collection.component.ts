import { Component, EventEmitter, Input, OnDestroy, OnInit, Output } from '@angular/core';
import { Subject } from 'rxjs';
import { debounceTime, takeUntil } from 'rxjs/operators';
import { updateNoteContentDelay } from 'src/app/core/defaults/bounceDelay';

@Component({
  selector: 'app-title-collection',
  templateUrl: './title-collection.component.html',
  styleUrls: ['./title-collection.component.scss'],
})
export class TitleCollectionComponent implements OnInit, OnDestroy {
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
}
