import { Component, OnInit } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { shake } from '../../services/personalization.service';

const CompareValidator = (first: string, second: string) => {
  return (fg: FormGroup) => {
    const firstField = fg.controls[first];
    const secondField = fg.controls[second];

    if (firstField?.errors && !secondField?.errors?.isMatch) {
      return;
    }

    if (firstField.value !== secondField.value) {
      secondField.setErrors({ isMatch: true });
    } else {
      secondField.setErrors(null);
    }
  };
};

@Component({
  selector: 'app-lock',
  templateUrl: './lock.component.html',
  styleUrls: ['./lock.component.scss'],
  animations: [shake],
})
export class LockComponent implements OnInit {
  form: FormGroup;

  isSubmit = false;

  constructor(private fb: FormBuilder) {}

  ngOnInit() {
    this.form = this.fb.group(
      {
        password: [null, [Validators.required, Validators.minLength(6)]],
        confirmation: [null, Validators.required],
      },
      { validator: CompareValidator('password', 'confirmation') },
    );
  }

  get field() {
    return this.form.controls;
  }

  save() {
    this.isSubmit = true;
    if (this.form.invalid) {
      return;
    }
    console.log(this.form);
  }
}
