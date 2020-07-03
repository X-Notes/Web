import { Injectable, NgZone } from '@angular/core';
import { Subject } from 'rxjs';
import { Router } from '@angular/router';
import { takeUntil } from 'rxjs/operators';
import * as firebase from 'firebase';
import { AngularFireAuth } from '@angular/fire/auth';
import { AuthAPIService } from './auth-api.service';

@Injectable()
export class AuthService {

  unsubscribe = new Subject();

  constructor(
    private afAuth: AngularFireAuth,
    private ngZone: NgZone,
    private router: Router,
    private api: AuthAPIService) {
    this.afAuth.authState.subscribe((firebaseUser) => {
      this.configureAuthState(firebaseUser);
    });
  }

  GoogleAuth() {
    return this.AuthLogin(new firebase.auth.GoogleAuthProvider());
  }

  private configureAuthState(firebaseUser: firebase.User): void {
    if (firebaseUser) {
      firebaseUser.getIdToken(true).then((theToken) => {
        console.log('we have a token');
        this.api.verifyToken(theToken).toPromise();
        localStorage.setItem('jwt', theToken);
        this.api.tryGetFromAuthorize().toPromise();
      }, (failReason) => {
          this.logout();
      });
    } else {
      this.logout();
    }
  }

  private AuthLogin(provider: firebase.auth.GoogleAuthProvider) {
    return this.afAuth.signInWithPopup(provider)
      .then(result => {})
      .catch(error => {
        window.alert(error);
      });
  }

  getToken() {
    return localStorage.getItem('jwt');
  }

  logout() {
    localStorage.removeItem('jwt');
    return this.afAuth.signOut();
  }
}
