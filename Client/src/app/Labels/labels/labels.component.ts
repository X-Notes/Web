import { Component, OnInit, NgModule } from '@angular/core';
import { BrowserModule } from '@angular/platform-browser';
import { BrowserAnimationsModule } from '@angular/platform-browser/animations';
import { LabelService } from 'src/app/Services/label.service';
import { Label } from 'src/app/Models/Labels/Label';
import { Subject } from 'rxjs';
import { takeUntil } from 'rxjs/operators';
import { NewLabel } from 'src/app/Models/Labels/NewLabel';

@NgModule({
  imports: [BrowserAnimationsModule, BrowserModule]
})

@Component({
  selector: 'app-labels',
  templateUrl: './labels.component.html',
  styleUrls: ['./labels.component.sass']
})
export class LabelsComponent implements OnInit {

  labels: Label[];
  unsubscribe = new Subject();
  constructor(private labelService: LabelService) { }

  ngOnInit() {
    this.labelService.GetUserLabels().pipe(takeUntil(this.unsubscribe))
    .subscribe(x => this.labels = x, error => console.log(error));
  }

}
