/* eslint-disable @typescript-eslint/no-empty-function */
import { Injectable, NgZone } from '@angular/core';
import { Router } from '@angular/router';
import { Store } from '@ngxs/store';
import { Auth, Logout } from './stateUser/user-action';
import { UserAPIService } from './user-api.service';
import { UserStore } from './stateUser/user-state';
import { BehaviorSubject, Observable } from 'rxjs';
import { map } from 'rxjs/operators';
import { environment } from 'src/environments/environment';
import { ResetFoldersState } from '../content/folders/state/folders-actions';
import { ResetNotesState } from '../content/notes/state/notes-actions';
import { ResetLabelsState } from '../content/labels/state/labels-actions';

export enum AuthStatus {
  NoStarted,
  InProgress,
  Successful,
  Failed,
}

declare let google: any;

@Injectable()
export class AuthService {
  authStatus = new BehaviorSubject<AuthStatus>(AuthStatus.NoStarted);

  navigateToUrl: string;

  inited = false;

  constructor(
    private readonly router: Router,
    private readonly store: Store,
    private readonly apiAuth: UserAPIService,
    private ngZone: NgZone
  ) { }

  get isLoggedIn(): boolean {
    const user = this.store.selectSnapshot(UserStore.getUser);
    return Object.keys(user).length > 0;
  }

  get IsAuthActive(): Observable<boolean> {
    return this.authStatus.pipe(map((status) => status === AuthStatus.InProgress));
  }

  initGoogleLogin(buttonIds: string[], isShowPrompt: boolean, navigateToUrl: string): void {
    google.accounts.id.initialize({
      client_id: environment.google.client_id,
      callback: (e) => this.onGoogleSignIn(e),
      auto_select: false,
    });

    for (const id of buttonIds) {
      google.accounts.id.renderButton(document.getElementById(id),
        { theme: "outline", size: "large" }  // customization attributes
      );
    }

    if (isShowPrompt) {
      google.accounts.id.prompt((notification) => {
        if (notification.isNotDisplayed() || notification.isSkippedMoment()) {
          // continue with another identity provider.
        }
      });
    }

    this.navigateToUrl = navigateToUrl;
    this.inited = true;
  }

  async onGoogleSignIn(response: any) {
    // Handle the sign-in response
    this.authStatus.next(AuthStatus.InProgress);
    if (response.credential) {
      // User signed in successfully
      const idToken = response.credential as string;
      const res = await this.apiAuth.googleLogin(idToken).toPromise();
      if (res.success) {
        await this.login(res.data.accessToken, res.data.refreshToken);
        this.ngZone.run(() => this.router.navigate([this.navigateToUrl]));
      }
    } else {
      // Sign-in failed
      console.error('Sign-in failed.');
      this.authStatus.next(AuthStatus.Failed);
    }
  }

  async login(accessToken: string, refreshToken: string) {
    this.setTokens(accessToken, refreshToken);
    await this.store.dispatch(new Auth()).toPromise();
    this.authStatus.next(AuthStatus.Successful);
  }

  setTokens(accessToken: string, refreshToken: string): void {
    this.setAccessToken(accessToken);
    this.setRefreshToken(refreshToken);
    localStorage.setItem('isLoggedIn', 'true'); 
  }

  setAccessToken(accessToken: string): void {
    localStorage.removeItem('access_token');
    localStorage.setItem('access_token', accessToken);
  }

  setRefreshToken(refreshToken: string): void {
    localStorage.removeItem('refresh_token');
    localStorage.setItem('refresh_token', refreshToken);
  }

  getAccessToken(): string {
    return localStorage.getItem('access_token');
  }

  getRefreshToken(): string {
    return localStorage.getItem('refresh_token');
  }

  resetTokens(): void {
    localStorage.removeItem('access_token');
    localStorage.removeItem('refresh_token');
  }

  async refresh(): Promise<boolean> {
    try {
      const refreshToken = this.getAccessToken();
      const accessToken = this.getAccessToken();
      if (refreshToken && accessToken) {
        const resp = await this.apiAuth.refreshToken({
          accessToken: this.getAccessToken(),
          refreshToken: this.getRefreshToken()
        }).toPromise();
        if (resp.success) {
          this.setTokens(resp.data.accessToken, resp.data.refreshToken);
          return true;
        }
      }
    } catch(e) {
      console.error(e);
      return false;
    }
  }

  logout = async () => {
    const token = this.getRefreshToken();
    if(token){
      await this.store.dispatch(new Logout(token)).toPromise();
    }
    await this.store.dispatch([ResetNotesState, ResetFoldersState, ResetLabelsState]).toPromise();
    this.resetTokens();
    this.ngZone.run(() => this.router.navigate(['login']));
  };
}
