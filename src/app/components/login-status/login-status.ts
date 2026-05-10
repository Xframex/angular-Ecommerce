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
  userEmail = '';

  // reference to browser storage
  storage: Storage = localStorage;

  constructor(
    private oktaState: OktaAuthStateService,
    @Inject(OKTA_AUTH) private oktaAuth: OktaAuth
  ) {}

  ngOnInit(): void {

    this.oktaState.authState$.subscribe(authState => {

      this.isAuthenticated = authState?.isAuthenticated ?? false;

      // get user name from Okta
      this.userFullName = authState?.idToken?.claims?.name ?? '';

      // get email from Okta
      this.userEmail = authState?.idToken?.claims?.email ?? '';

      // store email in local storage
      this.storage.setItem('email', this.userEmail);

      // retrieve email from storage
      const storedEmail = this.storage.getItem('email');

      if (storedEmail) {
        this.userEmail = storedEmail;
      }

    });

  }

  logout() {
    this.oktaAuth.signOut();
  }
} 