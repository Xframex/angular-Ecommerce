export default {

    // define JSON configuration for OKTA
    oidc: {
        clientId: '0oa12myfeoxdP1Y2c698',
        issuer: 'http://dev-integrator-2754624.okta.com/oauth2/default',
        redirectUri: 'http://localhost:4200/login/callback',
        scopes : ['openid', 'profile', 'email']
    }
}
 