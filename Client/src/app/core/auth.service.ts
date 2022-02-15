import { Injectable } from '@angular/core';
import { Router } from '@angular/router';
import { AngularFireAuth } from '@angular/fire/compat/auth';
import { Store } from '@ngxs/store';
import { LoadPersonalization, Login, Logout } from './stateUser/user-action';
import firebase from 'firebase/compat/app';

@Injectable()
export class AuthService {
  constructor(
    private readonly afAuth: AngularFireAuth,
    private readonly router: Router,
    private readonly store: Store,
  ) {
    this.afAuth.onAuthStateChanged((user) => {
      this.configureAuthState(user);
    });
  }

  async authGoogle() {
    try {
      this.afAuth.signInWithRedirect(new firebase.auth.GoogleAuthProvider());
    } catch (e) {
      window.alert(e);
    }
  }

  logout = async () => {
    await this.store.dispatch(new Logout()).toPromise();
    await this.afAuth.signOut();
    await this.router.navigate(['about']);
  };

  async getToken(refresh = false) {
    const user = await this.afAuth.currentUser;
    return user?.getIdToken(refresh);
  }

  async redirectOnSuccessAuth() {
    const { user } = await this.afAuth.getRedirectResult();
    if (user) {
      this.router.navigate(['notes']);
    }
  }

  private async configureAuthState(user: firebase.User) {
    if (user) {
      await this.store
        .dispatch(new Login({ name: user.displayName, photo: user.photoURL }))
        .toPromise();
      await this.store.dispatch(LoadPersonalization).toPromise();
      console.log(1);
    } else {
      await this.logout();
    }
  }
}
