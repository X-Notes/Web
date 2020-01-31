import { Component, OnInit } from '@angular/core';
import { UserService } from '../Services/user.service';
import { Subject } from 'rxjs';
import { takeUntil } from 'rxjs/operators';
import { Router } from '@angular/router';
import { FullUser } from '../Models/User/FullUser';

@Component({
  selector: 'app-profile',
  templateUrl: './profile.component.html',
  styleUrls: ['./profile.component.sass']
})
export class ProfileComponent implements OnInit {

  user: FullUser;
  unsubscribe = new Subject();

  constructor(private router: Router, private userService: UserService) {

  }

  ngOnInit() {
    this.userService.GetFull()
    .pipe(takeUntil(this.unsubscribe))
    .subscribe(user => { this.user = user; }, error => {
      this.router.navigate(['/about']);
    });
  }

  uploadFile(files) {

    if (files.length === 0) {
      return;
    }
    if (files[0].type !== 'image/png' && files[0].type !== 'image/jpeg') {
      return;
    }
    const formData = new FormData();
    formData.append('photo', files[0]);

    this.userService.UpdatePhoto(formData)
    .pipe(takeUntil(this.unsubscribe))
    .subscribe(x => this.user.photo = x, error => console.log(error));
  }

}
