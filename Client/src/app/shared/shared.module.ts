import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { TranslateModule } from '@ngx-translate/core';
import {MatRippleModule} from '@angular/material/core';


@NgModule({
  declarations: [],
  imports: [CommonModule , TranslateModule],
  exports: [TranslateModule, MatRippleModule]
})
export class SharedModule { }
