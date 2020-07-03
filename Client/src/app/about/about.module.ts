import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { AboutComponent } from './about/about.component';
import { AboutRouting } from './about-routing';
import { AuthService } from '../core/auth.service';



@NgModule({
  declarations: [AboutComponent],
  imports: [
    CommonModule,
    AboutRouting
  ]
})
export class AboutModule { }
