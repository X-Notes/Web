import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { SharedModule } from 'src/app/shared/shared.module';
import { FormsModule } from '@angular/forms';
import { ProfileComponent } from './profile/profile.component';
import { ProfileRouting } from './profile-routing';
import { DropDirective } from './drop/drop.directive';

@NgModule({
  declarations: [ProfileComponent, DropDirective],
  imports: [CommonModule, ProfileRouting, SharedModule, FormsModule],
})
export class ProfileModule {}
