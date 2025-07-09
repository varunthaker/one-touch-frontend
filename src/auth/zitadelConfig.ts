import { UserManager, UserManagerSettings } from 'oidc-client-ts';

const zitadelConfig: UserManagerSettings = {
  authority: 'https://one-touch-xfjetu.us1.zitadel.cloud/',
  client_id: '328120241748011721',
  redirect_uri: 'http://localhost:5173/',
  post_logout_redirect_uri: 'http://localhost:5173/',
  response_type: 'code',
  scope: 'openid profile email urn:zitadel:iam:org:project:roles',
  loadUserInfo: true,
  automaticSilentRenew: true,
  silent_redirect_uri: 'http://localhost:5173/silent-renew.html',
  monitorSession: false,
};

export const userManager = new UserManager(zitadelConfig);

export default zitadelConfig; 