import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { TranslateModule } from '@ngx-translate/core';
import {MatRippleModule} from '@angular/material/core';
import { SimplebarAngularModule } from 'simplebar-angular';


@NgModule({
  declarations: [],
  imports: [CommonModule , TranslateModule, SimplebarAngularModule],
  exports: [TranslateModule, MatRippleModule, SimplebarAngularModule]
})
export class SharedModule { }
