/* eslint-disable @typescript-eslint/no-empty-function */
import { Injectable } from '@angular/core';
import { Router } from '@angular/router';
import { AngularFireAuth } from '@angular/fire/compat/auth';
import { Store } from '@ngxs/store';
import { Auth, Logout } from './stateUser/user-action';
import firebase from 'firebase/compat/app';
import { UserAPIService } from './user-api.service';
import { UserStore } from './stateUser/user-state';
import { BehaviorSubject, Observable } from 'rxjs';
import { map } from 'rxjs/operators';

export enum AuthStatus {
  NoStarted,
  InProgress,
  Successful,
  Failed,
}

@Injectable()
export class AuthService {
  authStatus = new BehaviorSubject<AuthStatus>(AuthStatus.NoStarted);

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

  get isLogined(): boolean {
    const user = this.store.selectSnapshot(UserStore.getUser);
    return Object.keys(user).length > 0;
  }

  get IsAuthActive(): Observable<boolean> {
    return this.authStatus.pipe(map((status) => status === AuthStatus.InProgress));
  }

  private get isFirefox(): boolean {
    return navigator?.userAgent?.includes('Firefox');
  }

  async authGoogle(navigateToUrl = 'notes') {
    try {
      if (this.isFirefox) {
        this.authStatus.next(AuthStatus.InProgress);
        const result = await this.afAuth.signInWithPopup(new firebase.auth.GoogleAuthProvider());
        this.handlerAuth(result.user, navigateToUrl);
      } else {
        this.afAuth.signInWithRedirect(new firebase.auth.GoogleAuthProvider());
      }
    } catch (e) {
      console.log('e: ', e);
    } finally {
      this.authStatus.next(AuthStatus.Failed);
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

  async getToken(refresh = false): Promise<string | undefined> {
    const user = await this.afAuth.currentUser;
    return user?.getIdToken(refresh);
  }

  async getTokenRefreshed(): Promise<string | undefined> {
    const user = await this.afAuth.currentUser;
    return user?.getIdToken(true);
  }

  async refreshToken(): Promise<void> {
    const user = await this.afAuth.currentUser;
    await user?.getIdToken(true);
  }

  async redirectOnSuccessAuth(navigateToUrl = 'notes') {
    try {
      this.authStatus.next(AuthStatus.InProgress);
      const result = await this.afAuth.getRedirectResult();
      await this.handlerAuth(result.user, navigateToUrl);
    } catch (e) {
      console.log('e: ', e);
    } finally {
      this.authStatus.next(AuthStatus.Failed);
    }
  }

  async handlerAuth(user: firebase.User | null, navigateToUrl: string) {
    if (user) {
      const token = await this.getToken();
      if (token) {
        const isValidToken = await this.apiAuth.verifyToken(token).toPromise();
        if (isValidToken.success) {
          await this.store
            .dispatch(new Auth({ name: user.displayName, photoURL: user.photoURL }))
            .toPromise();
          await this.apiAuth.setTokenClaims().toPromise();
          await this.refreshToken();
          this.authStatus.next(AuthStatus.Successful);
          this.router.navigate([navigateToUrl]);
          return;
        }
      }
    }
    this.authStatus.next(AuthStatus.Failed);
  }

  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  private async configureAuthState(user: firebase.User | null) {}
}
