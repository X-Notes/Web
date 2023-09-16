import { AfterViewInit, Component, OnInit } from '@angular/core';
import { AuthService } from 'src/app/core/auth.service';
import { TypeAuthEnum } from '../models/type.auth.enum';

@Component({
  selector: 'app-about',
  templateUrl: './about.component.html',
  styleUrls: ['./about.component.scss'],
})
export class AboutComponent implements OnInit, AfterViewInit {
  authType = TypeAuthEnum;

  constructor(
    public authService: AuthService) { }

  ngAfterViewInit(): void {
    const ids = ['loginGoogle1'];
    this.authService.initGoogleLogin(ids, true, 'notes');
  }

  ngOnInit(): void {}
}
