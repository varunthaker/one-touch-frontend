import { UserManager, UserManagerSettings } from 'oidc-client-ts';

const authority = import.meta.env.VITE_ZITADEL_AUTHORITY;
const client_id = import.meta.env.VITE_ZITADEL_CLIENT_ID;
const redirect_uri = import.meta.env.VITE_ZITADEL_REDIRECT_URL;

// Check if required values are present
if (!authority) {
  console.error('VITE_ZITADEL_AUTHORITY is not defined in environment variables');
}

if (!client_id) {
  console.error('VITE_ZITADEL_CLIENT_ID is not defined in environment variables');
}

if (!redirect_uri) {
  console.error('VITE_ZITADEL_REDIRECT_URL is not defined in environment variables');
}


// Note: The below code is for live deployment. Uncomment and use it when deploying to production.
const zitadelConfig: UserManagerSettings = {
  authority,
  client_id,
  redirect_uri,
  post_logout_redirect_uri: import.meta.env.VITE_ZITADEL_REDIRECT_URL,
  response_type: 'code',
  scope: 'openid profile email urn:zitadel:iam:org:project:roles',
  loadUserInfo: true,
  automaticSilentRenew: true,
  silent_redirect_uri: import.meta.env.VITE_SILENT_REDIRECT_URI,
  monitorSession: false,
};

export const userManager = new UserManager(zitadelConfig);

export default zitadelConfig;