import { Component, OnInit, Input } from '@angular/core';
import { User } from 'src/app/Models/User/User';
import { AuthService } from 'src/app/Services/auth.service';

@Component({
  selector: 'app-profile-modal',
  templateUrl: './profile-modal.component.html',
  styleUrls: ['./profile-modal.component.sass']
})
export class ProfileModalComponent implements OnInit {

  @Input() user: User;

  constructor(private authService: AuthService) { }

  ngOnInit() {
  }

  exit() {
    this.authService.SignOut();
  }
}
