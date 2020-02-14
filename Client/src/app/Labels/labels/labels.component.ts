import { Component, OnInit, OnDestroy } from '@angular/core';
import { LabelService } from 'src/app/Services/label.service';
import { Label } from 'src/app/Models/Labels/Label';
import { Subject } from 'rxjs';
import { takeUntil } from 'rxjs/operators';
import { NewLabel } from 'src/app/Models/Labels/NewLabel';


@Component({
  selector: 'app-labels',
  templateUrl: './labels.component.html',
  styleUrls: ['./labels.component.sass']
})
export class LabelsComponent implements OnInit, OnDestroy {
  labels: Label[];
  unsubscribe = new Subject();
  constructor(private labelService: LabelService) {}

  Create() {
    const newLabel: NewLabel = {
      name : '',
      color: '#FFCDCD'
    };
    this.labelService.CreateLabel(newLabel).pipe(takeUntil(this.unsubscribe))
    .subscribe(x =>
      this.labelService.GetById(x).pipe(takeUntil(this.unsubscribe))
      .subscribe(g => this.labels.unshift(g), error => console.log(error))
      , error => console.log( error));
  }
  Update(label: Label) {
    this.labelService
      .Update(label)
      .pipe(takeUntil(this.unsubscribe))
      .subscribe(
        x => x,
        error => console.log(error)
      );
  }
  Delete(id: string) {
    this.labelService
      .Delete(id)
      .pipe(takeUntil(this.unsubscribe))
      .subscribe(
        x => (this.labels = this.labels.filter(g => g.id !== id)),
        error => console.log(error)
      );
  }
  ngOnInit() {
    this.labelService
      .GetUserLabels()
      .pipe(takeUntil(this.unsubscribe))
      .subscribe(
        x => (this.labels = x),
        error => console.log(error)
      );
  }
  ngOnDestroy() {
    this.unsubscribe.next();
    this.unsubscribe.unsubscribe();
  }
}
