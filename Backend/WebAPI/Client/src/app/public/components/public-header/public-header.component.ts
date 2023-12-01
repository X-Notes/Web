import { AfterViewInit, Component, Input, OnDestroy, OnInit } from '@angular/core';
import { Select } from '@ngxs/store';
import { NoteStore } from '../../../content/notes/state/notes-state';
import { Observable } from 'rxjs';
import { AuthService } from 'src/app/core/auth.service';
import { OnlineUsersNote } from '../../../content/notes/models/online-users-note.model';

@Component({
  selector: 'app-public-header',
  templateUrl: './public-header.component.html',
  styleUrls: ['./public-header.component.scss'],
})
export class PublicHeaderComponent implements OnInit, AfterViewInit, OnDestroy {
  @Input()
  buttonId: string | null;

  @Input()
  navigateToUrl: string;

  @Select(NoteStore.getOnlineUsersOnNote)
  onlineUsers$?: Observable<OnlineUsersNote[]>;

  constructor(public authService: AuthService) {}

  ngAfterViewInit(): void {
    const ids = [this.buttonId];
    this.authService.initGoogleLogin(ids, true, this.navigateToUrl)
  }

  ngOnDestroy(): void {}

  ngOnInit(): void {}
}
