import { Component, OnInit, Input, OnDestroy, Output, EventEmitter } from '@angular/core';
import { changeColorLabel } from 'src/app/shared/services/personalization.service';
import { Label } from '../models/label';
import { Subject } from 'rxjs';
import { debounceTime, distinctUntilChanged } from 'rxjs/operators';

@Component({
  selector: 'app-label',
  templateUrl: './label.component.html',
  styleUrls: ['./label.component.scss'],
  animations: [ changeColorLabel ]
})
export class LabelComponent implements OnInit, OnDestroy {

  @Input() label: Label;
  @Output() updateLabel = new EventEmitter<Label>();
  @Output() deleteLabel = new EventEmitter<number>();

  isUpdate = false;

  nameChanged: Subject<string> = new Subject<string>();

  constructor() { }

  ngOnDestroy(): void {
    this.nameChanged.next();
    this.nameChanged.unsubscribe();
  }

  ngOnInit(): void {
    this.nameChanged.pipe(
      debounceTime(350),
      distinctUntilChanged())
      .subscribe(name => {
        const lab = {...this.label};
        lab.name = name;
        this.updateLabel.emit(lab);
      });
  }

  openColors() {
    this.isUpdate = !this.isUpdate;
  }

  changeColor(value: string) {
    const label: Label = {
      id: this.label.id,
      color: value,
      name: this.label.name,
      isDeleted: this.label.isDeleted
    };
    this.isUpdate = false;
    this.updateLabel.emit(label);
  }

  delete() {
    this.deleteLabel.emit(this.label.id);
  }

  changed(text: string) {
    this.nameChanged.next(text);
  }

}
