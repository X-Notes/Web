import { Injectable } from '@angular/core';
import { Router } from '@angular/router';
import * as firebase from 'firebase';
import { AngularFireAuth } from '@angular/fire/auth';
import { Store } from '@ngxs/store';
import { UserAPIService } from './user-api.service';
import { User } from './models/user.model';
import { LoadPersonalization, Login, Logout } from './stateUser/user-action';
import { UserStore } from './stateUser/user-state';
import { SetToken } from './stateApp/app-action';

@Injectable()
export class AuthService {
  constructor(
    private afAuth: AngularFireAuth,
    private router: Router,
    private store: Store,
    private api: UserAPIService,
  ) {
    this.afAuth.authState.subscribe(async (firebaseUser) => {
      await this.configureAuthState(firebaseUser);
    });
  }

  init = () => null;

  authGoogle() {
    return this.afAuth
      .signInWithRedirect(new firebase.default.auth.GoogleAuthProvider())
      .then((result) => {
        console.log('result: ', result);
      })
      .catch((error) => {
        window.alert(error);
      });
  }

  authFacebook() {
    return this.afAuth
      .signInWithRedirect(new firebase.default.auth.FacebookAuthProvider())
      .then((result) => {
        console.log('result: ', result);
      })
      .catch((error) => {
        window.alert(error);
      });
  }

  logout = async () => {
    await this.store.dispatch(new Logout()).toPromise();
    await this.afAuth.signOut();
    await this.router.navigate(['/about']);
  };

  private async configureAuthState(firebaseUser: firebase.default.User) {
    if (firebaseUser) {
      const token = await firebaseUser.getIdToken(true);
      await this.api.verifyToken(token).toPromise();
      this.store.dispatch(new SetToken(token));
      const flag = this.store.selectSnapshot(UserStore.getStatus);
      if (!flag) {
        const user = this.getUser(firebaseUser);
        try {
          user.photo = await this.api.getImageFromGoogle(firebaseUser.photoURL);
        } catch (e) {
          console.log(e);
        } finally {
          await this.store.dispatch(new Login(token, user)).toPromise();
          await this.store.dispatch(LoadPersonalization).toPromise();
          this.router.navigate(['/notes']);
        }
      }
      setInterval(async () => this.updateToken(firebaseUser), 10 * 60 * 1000); // TODO CLEAR SETINTERVAL
    } else {
      await this.logout();
    }
  }

  private async updateToken(firebaseUser: firebase.default.User) {
    const token = await firebaseUser.getIdToken(true);
    await this.api.verifyToken(token).toPromise();
    this.store.dispatch(new SetToken(token));
  }

  private getUser = (user: firebase.default.User) => {
    const temp: User = {
      name: user.displayName,
      photo: null,
    };
    return temp;
  };
}
