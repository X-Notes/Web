import { Component, OnInit } from '@angular/core';
import { FormBuilder, FormGroup, ValidatorFn, Validators } from '@angular/forms';
import { shake } from '../../services/personalization.service';

const CompareValidator: ValidatorFn = (fg: FormGroup) => {
  const password = fg.get('password').value;
  const confirmation = fg.get('confirmation').value;
  return password === confirmation ? { compare: false } : { compare: true };
};

@Component({
  selector: 'app-lock',
  templateUrl: './lock.component.html',
  styleUrls: ['./lock.component.scss'],
  animations: [shake],
})
export class LockComponent implements OnInit {
  form: FormGroup;

  passwords = {
    main: '',
    confirm: '',
  };

  constructor(private fb: FormBuilder) {
    this.form = this.fb.group(
      {
        password: [null, Validators.required],
        confirmation: [null, Validators.required],
      },
      { validator: CompareValidator },
    );
  }

  ngOnInit = () => {};

  save() {
    console.log(this.form);
  }
}
