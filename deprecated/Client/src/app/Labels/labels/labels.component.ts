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
  destroy = new Subject();
  constructor(private labelService: LabelService) {}

  Create() {
    const newLabel: NewLabel = {
      name : '',
      color: '#FFCDCD'
    };
    this.labelService.CreateLabel(newLabel).pipe(takeUntil(this.destroy))
    .subscribe(x =>
      this.labelService.GetById(x).pipe(takeUntil(this.destroy))
      .subscribe(g => this.labels.unshift(g), error => console.log(error))
      , error => console.log( error));
  }
  Update(label: Label) {
    this.labelService
      .Update(label)
      .pipe(takeUntil(this.destroy))
      .subscribe(
        x => x,
        error => console.log(error)
      );
  }
  Delete(id: string) {
    this.labelService
      .Delete(id)
      .pipe(takeUntil(this.destroy))
      .subscribe(
        x => (this.labels = this.labels.filter(g => g.id !== id)),
        error => console.log(error)
      );
  }
  ngOnInit() {
    this.labelService
      .GetUserLabels()
      .pipe(takeUntil(this.destroy))
      .subscribe(
        x => (this.labels = x),
        error => console.log(error)
      );
  }
  ngOnDestroy() {
    this.destroy.next();
    this.destroy.complete();
  }
}
