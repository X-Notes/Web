import { Injectable, NgZone } from '@angular/core';
import { Subject } from 'rxjs';
import { Router } from '@angular/router';
import { takeUntil } from 'rxjs/operators';
import * as firebase from 'firebase';
import { AngularFireAuth } from '@angular/fire/auth';
import { UserAPIService } from './user-api.service';
import { User } from './models/user';
import { Language } from '../shared/enums/Language';
import { Store } from '@ngxs/store';
import { Login, Logout, TokenSetNoUpdate } from './stateUser/user-action';
import { UserStore } from './stateUser/user-state';
import { SetToken } from './stateUser/user-action';


@Injectable()
export class AuthService {

  constructor(
    private afAuth: AngularFireAuth,
    private router: Router,
    private store: Store,
    private api: UserAPIService) {

      this.store.dispatch(new TokenSetNoUpdate());

      this.afAuth.authState.subscribe(async (firebaseUser) => {
      this.configureAuthState(firebaseUser);
    });

  }

  GoogleAuth() {
    return this.AuthLogin(new firebase.auth.GoogleAuthProvider());
  }

  private async configureAuthState(firebaseUser: firebase.User) {
    if (firebaseUser) {
      console.log(5);
      const token = await firebaseUser.getIdToken(true);
      this.store.dispatch(new SetToken(token));
      const flag = this.store.selectSnapshot(UserStore.getStatus);
      await this.api.verifyToken(token).toPromise();
      if (!flag) {
        this.store.dispatch(new Login(token, this.getUser(firebaseUser))).subscribe(x => this.router.navigate(['/notes']));
      }
      setInterval(async () => await this.updateToken(firebaseUser), 10 * 60 * 1000);
    } else {
      this.logout();
    }
  }

  private async updateToken(firebaseUser: firebase.User) {
    const token = await firebaseUser.getIdToken(true);
    await this.api.verifyToken(token).toPromise();
    this.store.dispatch(new SetToken(token));
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
    this.afAuth.signOut();
    this.router.navigate(['/about']);
  }
}
