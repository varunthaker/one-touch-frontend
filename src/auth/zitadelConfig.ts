import { UserManager, UserManagerSettings } from 'oidc-client-ts';

const zitadelConfig: UserManagerSettings = {
  authority: import.meta.env.VITE_ZITADEL_AUTHORITY,
  client_id: import.meta.env.VITE_ZITADEL_CLIENT_ID,
  redirect_uri: 'https://onetouchpro.app/',
  post_logout_redirect_uri: 'https://onetouchpro.app/',
  response_type: 'code',
  scope: 'openid profile email urn:zitadel:iam:org:project:roles',
  loadUserInfo: true,
  automaticSilentRenew: true,
  silent_redirect_uri: 'https://onetouchpro.app/silent-renew.html',
  monitorSession: false,
};

export const userManager = new UserManager(zitadelConfig);

export default zitadelConfig; 