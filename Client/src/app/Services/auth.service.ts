import { Injectable, NgZone } from '@angular/core';
import { AngularFireAuth } from '@angular/fire/auth';
import * as firebase from 'firebase/app';
import { Router } from '@angular/router';
import { UserService } from './user.service';
import { NewUser } from '../Models/User/newUser';
import { takeUntil } from 'rxjs/operators';
import { Subject } from 'rxjs';

@Injectable({
  providedIn: 'root'
})
export class AuthService {
  token: string;
  userData: any; // Save logged in user data
  unsubscribe = new Subject();

  constructor(private afAuth: AngularFireAuth,
              private ngZone: NgZone,
              private router: Router,
              private userService: UserService) {

    this.afAuth.idToken.subscribe(token => {
      this.token = token;
      localStorage.setItem('idKey', this.token);
    });
    this.afAuth.authState.subscribe(user => {
      if (user) {
        this.userData = user;
        localStorage.setItem('user', JSON.stringify(this.userData));
        JSON.parse(localStorage.getItem('user'));
      } else {
        localStorage.setItem('user', null);
        JSON.parse(localStorage.getItem('user'));
      }
    });
   }


  GoogleAuth() {
    return this.AuthLogin(new firebase.auth.GoogleAuthProvider());
  }

  AuthLogin(provider) {
    return this.afAuth.auth.signInWithPopup(provider)
    .then((result) => {
      this.ngZone.run(() => {
        const user: NewUser = {
          name: 'david',
          email: 'david@asd',
          photo: 'photro'

        };
        this.userService.Get(user)
        .pipe(takeUntil(this.unsubscribe))
        .subscribe(x =>  this.router.navigate(['/noots']), error => console.log(error));
        });
    }).catch((error) => {
      window.alert(error);
    });
  }

  SignOut() {
    return this.afAuth.auth.signOut().then(() => {
      localStorage.removeItem('user');
      this.router.navigate(['/about']);
    });
  }

  get isLoggedIn(): boolean {
    const user = JSON.parse(localStorage.getItem('user'));
    return (user !== null && user.emailVerified !== false) ? true : false;
  }
}
