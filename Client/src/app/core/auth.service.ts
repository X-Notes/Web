import { Injectable, NgZone } from '@angular/core';
import { Subject } from 'rxjs';
import { Router } from '@angular/router';
import { takeUntil } from 'rxjs/operators';
import * as firebase from 'firebase';
import { AngularFireAuth } from '@angular/fire/auth';
import { AuthAPIService } from './auth-api.service';
import { User } from './models/user';
import { Language } from '../shared/enums/Language';
import { Store } from '@ngxs/store';
import { Login, Logout } from './stateUser/user-action';
import { UserStore } from './stateUser/user-state';


@Injectable()
export class AuthService {

  constructor(
    private afAuth: AngularFireAuth,
    private router: Router,
    private store: Store) {
    this.afAuth.authState.subscribe(async (firebaseUser) => {
      this.configureAuthState(firebaseUser);
    });
  }

  GoogleAuth() {
    return this.AuthLogin(new firebase.auth.GoogleAuthProvider());
  }

  private async configureAuthState(firebaseUser: firebase.User) {
    if (firebaseUser) {
      const token = await firebaseUser.getIdToken(true);
      const flag = this.store.selectSnapshot(UserStore.getStatus);
      if (!flag) {
        this.store.dispatch(new Login(token, this.getUser(firebaseUser)))
        .subscribe(x => this.router.navigate(['/notes']));
      } else {
      }
    } else {
      this.logout();
    }
  }

  private getUser(user: firebase.User) {
    const temp: User = {
      name: user.displayName,
      photoId: user.photoURL,
      language: Language.UA
    };
    return temp;
  }

  private AuthLogin(provider: firebase.auth.GoogleAuthProvider) {
    return this.afAuth.signInWithRedirect(provider)
      .then(result => { })
      .catch(error => {
        window.alert(error);
      });
  }

  logout() {
    this.store.dispatch(new Logout());
    return this.afAuth.signOut();
  }
}
