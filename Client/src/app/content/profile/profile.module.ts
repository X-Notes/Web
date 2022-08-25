import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { SharedModule } from 'src/app/shared/shared.module';
import { FormsModule } from '@angular/forms';
import { ProfileComponent } from './profile/profile.component';
import { ProfileRouting } from './profile-routing';
import { LeftSectionBackgroundsComponent } from './left-section-backgrounds/left-section-backgrounds.component';
import { ProfileHeaderComponent } from './profile-components/profile-header/profile-header.component';
import { ProfileUserInfoComponent } from './profile-components/profile-user-info/profile-user-info.component';
import { ProfileBillingComponent } from './profile-components/profile-billing/profile-billing.component';

@NgModule({
  declarations: [
    ProfileComponent,
    LeftSectionBackgroundsComponent,
    ProfileHeaderComponent,
    ProfileUserInfoComponent,
    ProfileBillingComponent,
  ],
  imports: [CommonModule, ProfileRouting, SharedModule, FormsModule],
})
export class ProfileModule {}
