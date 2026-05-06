import { Component, Inject, OnInit } from '@angular/core';
import { OKTA_AUTH, OktaAuthStateService } from '@okta/okta-angular';
import { OktaAuth } from '@okta/okta-auth-js';
import { CommonModule } from '@angular/common';
import { RouterLink } from '@angular/router';

@Component({
  selector: 'app-login-status',
  standalone: true,
  imports: [CommonModule, RouterLink],
  templateUrl: './login-status.html',
  styleUrl: './login-status.css'
})
export class LoginStatus implements OnInit {

  isAuthenticated = false;
  userFullName = '';

  constructor(
    private oktaState: OktaAuthStateService,
    @Inject(OKTA_AUTH) private oktaAuth: OktaAuth
  ) {}

  ngOnInit(): void {

    this.oktaState.authState$.subscribe(authState => {
      this.isAuthenticated = authState?.isAuthenticated ?? false;
      this.userFullName = authState?.idToken?.claims?.name ?? '';
    });

  }

  logout() {
    this.oktaAuth.signOut();
  }
}