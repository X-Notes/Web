/* eslint-disable @typescript-eslint/no-empty-function */
import { Injectable } from '@angular/core';
import { Router } from '@angular/router';
import { AngularFireAuth } from '@angular/fire/compat/auth';
import { Store } from '@ngxs/store';
import { Auth, Logout } from './stateUser/user-action';
import firebase from 'firebase/compat/app';
import { UserAPIService } from './user-api.service';

@Injectable()
export class AuthService {
  isLoading = false;

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

  private get isFirefox(): boolean {
    return navigator?.userAgent?.includes('Firefox');
  }

  async authGoogle() {
    try {
      if (this.isFirefox) {
        this.isLoading = true;
        const result = await this.afAuth.signInWithPopup(new firebase.auth.GoogleAuthProvider());
        this.handlerAuth(result.user);
        this.isLoading = false;
      } else {
        this.afAuth.signInWithRedirect(new firebase.auth.GoogleAuthProvider());
      }
    } catch (e) {
      console.log('e: ', e);
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

  async getToken(refresh = false): Promise<string> {
    const user = await this.afAuth.currentUser;
    return user?.getIdToken(refresh);
  }

  async refreshToken(): Promise<void> {
    const user = await this.afAuth.currentUser;
    await user?.getIdToken(true);
  }

  async redirectOnSuccessAuth() {
    try {
      this.isLoading = true;
      const result = await this.afAuth.getRedirectResult();
      await this.handlerAuth(result.user);
    } catch (e) {
      console.log('e: ', e);
    } finally {
      this.isLoading = false;
    }
  }

  async handlerAuth(user: firebase.User) {
    if (user) {
      const token = await this.getToken();
      const isValidToken = await this.apiAuth.verifyToken(token).toPromise();
      if (isValidToken.success) {
        await this.store
          .dispatch(new Auth({ name: user.displayName, photoURL: user.photoURL }))
          .toPromise();
        await this.apiAuth.setTokenClaims().toPromise();
        await this.refreshToken();
        this.router.navigate(['notes']);
      }
    }
  }

  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  private async configureAuthState(user: firebase.User) {}
}
