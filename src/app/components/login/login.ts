import { Component, Inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { OKTA_AUTH } from '@okta/okta-angular';
import { OktaAuth } from '@okta/okta-auth-js';

@Component({
  selector: 'app-login',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './login.html',
  styleUrls: ['./login.css']
})
export class Login {
userName: string = '';


logout() {
  this.oktaAuth.signOut();

}
isAuthenticated: any;

  constructor(@Inject(OKTA_AUTH) private oktaAuth: OktaAuth) {} // 👈 THIS IS THE FIX

  login() {
    this.oktaAuth.signInWithRedirect();
  }

  
}