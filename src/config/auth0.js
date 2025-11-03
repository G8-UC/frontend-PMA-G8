// Auth0 Configuration
export const auth0Config = {
  domain: process.env.REACT_APP_AUTH0_DOMAIN || 'dev-e84zztt540q7m8pi.us.auth0.com',
  clientId: process.env.REACT_APP_AUTH0_CLIENT_ID || 'gL2wkeFJaLhPb6q4L6bp0mbp7JxjnMlw',
  redirectUri: process.env.REACT_APP_AUTH0_REDIRECT_URI || `${window.location.origin}/callback`,
  audience: process.env.REACT_APP_AUTH0_AUDIENCE || 'https://api.propertymarket.cl', // Optional: para APIs
  scope: 'openid profile email'
};

// Configuración adicional para Auth0
export const auth0Options = {
  ...auth0Config,
  useRefreshTokens: true,
  cacheLocation: 'localstorage',
  authorizationParams: {
    redirect_uri: auth0Config.redirectUri,
    audience: auth0Config.audience,
    scope: auth0Config.scope
  }
};