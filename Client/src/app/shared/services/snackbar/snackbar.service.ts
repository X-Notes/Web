import { ComponentType } from '@angular/cdk/portal';
import { Injectable } from '@angular/core';
import { MatSnackBar, MatSnackBarHorizontalPosition, MatSnackBarRef } from '@angular/material/snack-bar';
import { Store } from '@ngxs/store';
import { UserStore } from 'src/app/core/stateUser/user-state';
import { ThemeENUM } from 'src/app/shared/enums/theme.enum';
import { PersonalizationService } from '../personalization.service';
import { take } from 'rxjs/operators';

@Injectable()
export class SnackbarService {
  constructor(
    private snackbar: MatSnackBar,
    private store: Store,
    private prService: PersonalizationService) { }

  openSnackBar(
    message: string,
    action?: string,
    horizontalPosition: MatSnackBarHorizontalPosition = 'end',
    duration = 3000,
    ctheme: ThemeENUM = null
  ) {
    const isMobile = this.prService.isMobile();
    const theme = ctheme ?? this.store.selectSnapshot(UserStore.getUserTheme);
    const ref = this.snackbar.open(message, action, {
      duration,
      panelClass: theme === ThemeENUM.Light ? 'snackbar-light' : 'snackbar-dark',
      horizontalPosition,
      verticalPosition: isMobile ? 'top' : 'bottom',
    });
    this.handleSnackbarState(ref);
    return ref;
  }

  openSnackBarFromComponent<T>(
    component: ComponentType<T>,
    message: string,
    showSpinner: boolean,
    horizontalPosition: MatSnackBarHorizontalPosition = 'end',
    duration = 3000,
  ) {
    const isMobile = this.prService.isMobile();
    const ref = this.snackbar.openFromComponent(component, {
      verticalPosition: isMobile ? 'top' : 'bottom',
      horizontalPosition,
      panelClass: 'snackbar-light',
      duration,
      data: {
        message,
        showSpinner
      }
    });
    this.handleSnackbarState(ref);
    return ref;
  }

  handleSnackbarState<T>(ref: MatSnackBarRef<T>): void {
    this.prService.isSnackBarActive$.next(true);
    ref
      .afterDismissed()
      .pipe(take(1))
      .subscribe(() => {
        this.prService.isSnackBarActive$.next(false);
      });
  }
}
