import { ComponentType } from '@angular/cdk/portal';
import { Injectable } from '@angular/core';
import { MatSnackBar, MatSnackBarHorizontalPosition } from '@angular/material/snack-bar';
import { Store } from '@ngxs/store';
import { UserStore } from 'src/app/core/stateUser/user-state';
import { ThemeENUM } from 'src/app/shared/enums/theme.enum';

@Injectable({
  providedIn: 'root',
})
export class SnackbarService {
  constructor(private snackbar: MatSnackBar, private store: Store) { }

  openSnackBar(
    message: string,
    action?: string,
    horizontalPosition: MatSnackBarHorizontalPosition = 'end',
    duration = 3000,
    ctheme: ThemeENUM = null
  ) {
    const theme = ctheme ?? this.store.selectSnapshot(UserStore.getUserTheme);
    return this.snackbar.open(message, action, {
      duration,
      panelClass: theme === ThemeENUM.Light ? 'snackbar-light' : 'snackbar-dark',
      horizontalPosition,
      verticalPosition: 'bottom',
    });
  }

  openSnackBarFromComponent<T>(
    component: ComponentType<T>,
    message: string,
    horizontalPosition: MatSnackBarHorizontalPosition = 'end',
    duration = 3000,
  ) {
    return this.snackbar.openFromComponent(component, {
      verticalPosition: 'bottom',
      horizontalPosition,
      panelClass: 'snackbar-light',
      duration,
      data: {
        message,
      }
    });
  }
}
