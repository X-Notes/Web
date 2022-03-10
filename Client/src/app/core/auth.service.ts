import { Injectable } from '@angular/core';
import { Router } from '@angular/router';
import { AngularFireAuth } from '@angular/fire/compat/auth';
import { Store } from '@ngxs/store';
import { Auth, Logout } from './stateUser/user-action';
import firebase from 'firebase/compat/app';
import { UserAPIService } from './user-api.service';

@Injectable()
export class AuthService {
  constructor(
    private readonly afAuth: AngularFireAuth,
    private readonly router: Router,
    private readonly store: Store,
    private readonly apiAuth: UserAPIService,
  ) {
    this.afAuth.onAuthStateChanged((user) => {
      this.configureAuthState(user);
    });
  }

  async authGoogle() {
    try {
      await this.afAuth.signInWithRedirect(new firebase.auth.GoogleAuthProvider());
    } catch (e) {
      window.alert(e);
    }
  }

  logout = async () => {
    await this.store.dispatch(new Logout()).toPromise();
    await this.afAuth.signOut();
    await this.router.navigate(['about']);
  };

  async getUser() {
    const user = await this.afAuth.currentUser;
    return user;
  }

  async getToken(refresh = false) {
    const user = await this.afAuth.currentUser;
    return user?.getIdToken(refresh);
  }

  async redirectOnSuccessAuth() {
    const { user } = await this.afAuth.getRedirectResult();
    if (user) {
      await this.store
        .dispatch(new Auth({ name: user.displayName, photoURL: user.photoURL }))
        .toPromise();
      this.router.navigate(['notes']);
    }
  }

  private async configureAuthState(user: firebase.User) {
    if (user) {
      const token = await this.getToken();
      const isValidToken = await this.apiAuth.verifyToken(token).toPromise();
      if (!isValidToken.success) {
        await this.logout();
      } else {
        this.getToken(true); // force refresh token for getting custom claims;
      }
    } else {
      await this.logout();
    }
  }
}
