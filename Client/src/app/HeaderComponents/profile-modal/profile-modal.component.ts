import { Component, OnInit, Input, Output, EventEmitter } from '@angular/core';
import { User } from 'src/app/Models/User/User';
import { AuthService } from 'src/app/Services/auth.service';

@Component({
  selector: 'app-profile-modal',
  templateUrl: './profile-modal.component.html',
  styleUrls: ['./profile-modal.component.sass']
})
export class ProfileModalComponent implements OnInit {

  @Input() user: User;
  @Output() closeAll = new EventEmitter<boolean>();

  constructor(private authService: AuthService) { }

  exit() {
    this.authService.SignOut();
  }
  allDisable() {
    this.closeAll.emit();
  }
  ngOnInit() {
  }
}
