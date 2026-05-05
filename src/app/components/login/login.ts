import { Component, Inject, OnInit } from '@angular/core';
import { OKTA_AUTH } from '@okta/okta-angular';
import OktaAuth from '@okta/okta-auth-js';
import OktaSignIn from '@okta/okta-signin-widget';
import myAppConfig from '../../config/my-app-config';

@Component({
  selector: 'app-login',
  imports: [],
  templateUrl: './login.html',
  styleUrl: './login.css',
})
export class Login {
  // This component will be used to display the Okta Sign-In Widget for user authentication.
  // The widget will be initialized in the ngOnInit lifecycle hook, and it will handle the authentication flow.
  oktaSignIn: any;

  constructor(@Inject(OKTA_AUTH) private oktaAuth: OktaAuth) {
    // Initialize the Okta Sign-In Widget with the necessary configuration.
    this.oktaSignIn = new OktaSignIn({
      logo: 'assets/logo.png', // Optional: Add your logo here
      baseUrl: myAppConfig.oidc.issuer.split('/oauth2')[0],
      clientId: myAppConfig.oidc.clientId,
      redirectUri: myAppConfig.oidc.redirectUri,
      authParams: {
        pkce: true,
        issuer: myAppConfig.oidc.issuer,
        scopes: myAppConfig.oidc.scopes,
      },
    });
  }

  ngOnInit() {
    // Initialize the Okta Sign-In Widget when the component is initialized.
    this.oktaSignIn.remove();
    // Render the Okta Sign-In Widget in the specified 
    // container and handle the authentication response.
    this.oktaSignIn.renderEl(
      { el: '#okta-sign-in-widget' },
      (response: any) => {
        if (response.status === 'SUCCESS') {
          this.oktaAuth.signInWithRedirect();
        }
      },
      (error: any) => {
        throw error.message;
      }
    );
  }
}