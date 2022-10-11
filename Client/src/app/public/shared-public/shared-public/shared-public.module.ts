import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { NoteOwnerComponent } from '../../components/note-owner/note-owner.component';
import { NgxsModule } from '@ngxs/store';
import { PublicStore } from '../../storage/public-state';
import { PublicAPIService } from '../../services/public-api.service';
import { PublicHeaderComponent } from '../../components/public-header/public-header.component';
import { SharedModule } from '../../../shared/shared.module';

@NgModule({
  declarations: [NoteOwnerComponent, PublicHeaderComponent],
  imports: [CommonModule, NgxsModule.forFeature([PublicStore]), SharedModule],
  providers: [PublicAPIService],
  exports: [NoteOwnerComponent, PublicHeaderComponent],
})
export class SharedPublicModule {}
