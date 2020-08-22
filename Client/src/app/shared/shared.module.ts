import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { TranslateModule } from '@ngx-translate/core';
import {MatRippleModule} from '@angular/material/core';
import { SimplebarAngularModule } from 'simplebar-angular';
import { HammerModule } from '@angular/platform-browser';


@NgModule({
  imports: [CommonModule , TranslateModule, SimplebarAngularModule, HammerModule ],
  exports: [TranslateModule, MatRippleModule, SimplebarAngularModule, HammerModule ]
})
export class SharedModule { }
