import { Component, OnInit, Input, OnDestroy, Output, EventEmitter } from '@angular/core';
import { changeColorLabel, PersonalizationService } from 'src/app/shared/services/personalization.service';
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
  color;
  nameChanged: Subject<string> = new Subject<string>();

  constructor(public pService: PersonalizationService) { }

  ngOnDestroy(): void {
    this.nameChanged.next();
    this.nameChanged.unsubscribe();
  }

  ngOnInit(): void {
    this.color = this.label.color;
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
    this.timeout(this.isUpdate);
  }

  timeout(flag: boolean) {
    let count = 0;
    const timer = setInterval(() => {
      if (count === 50 && flag) {
        clearInterval(timer);
      } else if (count === 30 && flag === false) {
        clearInterval(timer);
      }
      this.pService.grid.refreshItems().layout();
      count++;
    }, 10);
  }

  changeColor(value: string) {
    const label: Label = {
      id: this.label.id,
      color: value,
      name: this.label.name,
      isDeleted: this.label.isDeleted,
      order: this.label.order
    };
    this.color = value;
    this.isUpdate = false;
    this.timeout(this.isUpdate);
    this.updateLabel.emit(label);
  }

  delete() {
    this.deleteLabel.emit(this.label.id);
  }

  changed(text: string) {
    this.nameChanged.next(text);
  }

}
