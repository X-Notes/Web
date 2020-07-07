import { Component, OnInit } from '@angular/core';
import { AuthService } from 'src/app/core/auth.service';
import { Router } from '@angular/router';

@Component({
  selector: 'app-about',
  templateUrl: './about.component.html',
  styleUrls: ['./about.component.scss']
})
export class AboutComponent implements OnInit {

  constructor(private authService: AuthService, private router: Router) { }

  ngOnInit(): void {
  }

  login() {
    if (!this.authService.getStatus().loggin) {
      this.authService.GoogleAuth();
    } else {
      this.router.navigate(['/notes']);
    }
  }

  logout() {
    this.authService.logout();
  }
}
