import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { InvitesComponent} from './invites/invites.component';


@NgModule({
  declarations: [InvitesComponent],
  imports: [
    CommonModule
  ],
  exports: [InvitesComponent]
})
export class InvitesModule { }
