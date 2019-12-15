import { Component, OnInit, NgModule } from '@angular/core';
import { BrowserModule } from '@angular/platform-browser';
import { BrowserAnimationsModule } from '@angular/platform-browser/animations';
import { LabelService } from 'src/app/Services/label.service';

@NgModule({
  imports: [BrowserAnimationsModule, BrowserModule]
})

@Component({
  selector: 'app-labels',
  templateUrl: './labels.component.html',
  styleUrls: ['./labels.component.sass']
})
export class LabelsComponent implements OnInit {

  constructor(private labelService: LabelService) { }

  ngOnInit() {
  }

}
