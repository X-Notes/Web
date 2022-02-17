import { Component } from '@angular/core';
import { FormControl, FormGroup, Validators } from '@angular/forms';
import { MatDialogRef } from '@angular/material/dialog';
import { TranslateService } from '@ngx-translate/core';
import { shake } from '../../services/personalization.service';
import { SnackbarService } from '../../services/snackbar/snackbar.service';
import { ApiContactUsService } from './services/api-contact-us.service';

@Component({
  selector: 'app-contact-us',
  templateUrl: './contact-us.component.html',
  styleUrls: ['./contact-us.component.scss'],
  animations: [shake],
})
export class ContactUsComponent {
  form = new FormGroup({
    email: new FormControl('', [Validators.required, Validators.email]),
    text: new FormControl('', [Validators.required]),
  });

  loading = false;

  constructor(
    private readonly snackService: SnackbarService,
    private readonly dialogRef: MatDialogRef<ContactUsComponent>,
    private readonly contactUsService: ApiContactUsService,
    private readonly translateService: TranslateService,
  ) {}

  hasError = (controlName: string, errorName: string) => {
    return (
      this.form.controls[controlName].hasError(errorName) && this.form.controls[controlName].touched
    );
  };

  async save() {
    if (this.form.valid) {
      this.loading = true;
      try {
        await this.contactUsService
          .createQuestion({
            senderEmail: this.form.controls.email.value,
            question: this.form.controls.text.value,
          })
          .toPromise();
        this.dialogRef.close();
        this.successSnackbar();
      } catch (e) {
        const close = await this.translateService.get('modal.contactUs.close').toPromise();
        this.snackService.openSnackBar(e, close);
      }
      this.loading = false;
    } else {
      this.incorrectSnackbar();
    }
  }

  private successSnackbar() {
    const message = this.translateService.instant('modal.contactUs.success');
    const close = this.translateService.instant('modal.contactUs.close');
    this.snackService.openSnackBar(message, close);
  }

  private incorrectSnackbar() {
    const message = this.translateService.instant('modal.contactUs.incorrect');
    const close = this.translateService.instant('modal.contactUs.close');
    this.snackService.openSnackBar(message, close);
  }
}
