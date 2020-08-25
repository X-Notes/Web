import { Component, OnInit, Input, OnDestroy, Output, EventEmitter } from '@angular/core';
import { changeColorLabel, PersonalizationService } from 'src/app/shared/services/personalization.service';
import { Label } from '../models/label';
import { Subject } from 'rxjs';
import { debounceTime, distinctUntilChanged } from 'rxjs/operators';
import { Store } from '@ngxs/store';
import { RestoreLabel } from '../state/labels-actions';
import { LabelsColor } from 'src/app/shared/enums/LabelsColors';
import { EnumUtil } from 'src/app/shared/services/enum.util';

@Component({
  selector: 'app-label',
  templateUrl: './label.component.html',
  styleUrls: ['./label.component.scss'],
  animations: [ changeColorLabel ]
})
export class LabelComponent implements OnInit, OnDestroy {

  pallete = EnumUtil.getEnumValues(LabelsColor);
  @Input() label: Label;
  @Output() updateLabel = new EventEmitter<Label>();
  @Output() deleteLabel = new EventEmitter<number>();
  @Output() restoreLabel = new EventEmitter<number>();

  isUpdate = false;

  nameChanged: Subject<string> = new Subject<string>();

  constructor(public pService: PersonalizationService,
              private store: Store) { }

  ngOnDestroy(): void {
    this.nameChanged.next();
    this.nameChanged.unsubscribe();
  }

  ngOnInit(): void {
    this.nameChanged.pipe(
      debounceTime(350),
      distinctUntilChanged())
      .subscribe(name => {
        this.label = {...this.label, name};
        this.updateLabel.emit(this.label);
      });
  }

  openColors() {
    this.isUpdate = !this.isUpdate;
    this.timeout(this.isUpdate);
  }

  async restore() {
    await this.store.dispatch(new RestoreLabel(this.label.id)).toPromise();
    this.restoreLabel.emit(this.label.id);
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
    this.label = {...this.label, color: value};
    this.isUpdate = false;
    this.timeout(this.isUpdate);
    this.updateLabel.emit(this.label);
  }

  delete() {
    this.deleteLabel.emit(this.label.id);
  }

  changed(text: string) {
    this.nameChanged.next(text);
  }

}
