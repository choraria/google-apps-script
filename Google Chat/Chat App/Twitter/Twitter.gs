const CLIENT_ID = '...';
const CLIENT_SECRET = '...';

function generateCodeVerifier() {
  const charset = "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789-._~";
  let verifier = "";
  for (let i = 0; i < 32; ++i) {
    const r = Math.floor(Math.random() * charset.length);
    verifier += charset[r];
  }
  return verifier;
}

function encodeChallenge(codeVerifier) {
  const hashedValue = Utilities.computeDigest(Utilities.DigestAlgorithm.SHA_256, codeVerifier, Utilities.Charset.US_ASCII);
  let encodedValue = Utilities.base64EncodeWebSafe(hashedValue);
  encodedValue = encodedValue.slice(0, encodedValue.indexOf('=')); // Strip padding
  return encodedValue;
}

/**
* Configures the service.
*/
const getService = () => {
  return OAuth2.createService('Twitter')
    // Set the endpoint URLs.
    .setAuthorizationBaseUrl('https://twitter.com/i/oauth2/authorize')
    .setTokenUrl('https://api.twitter.com/2/oauth2/token')

    // Set the client ID and secret.
    .setClientId(CLIENT_ID)
    .setClientSecret(CLIENT_SECRET)

    // Set the name of the callback function that should be invoked to
    // complete the OAuth flow.
    .setCallbackFunction('authCallback')

    // Set the property store where authorized tokens should be persisted.
    .setPropertyStore(PropertiesService.getUserProperties())

    // Set the scopes to request (space-separated for Twitter services).
    .setScope('users.read tweet.read follows.write like.write offline.access')

    .setTokenHeaders({
      'Authorization': 'Basic ' + Utilities.base64Encode(CLIENT_ID + ':' + CLIENT_SECRET),
      'Content-Type': 'application/x-www-form-urlencoded'
    })
}

/**
* Handles the OAuth callback.
*/
function authCallback(request) {
  const service = getService();
  service.setTokenPayloadHandler(payload => {
    payload['code_verifier'] = request.parameter.codeVerifier;
    return payload;
  });
  const authorized = service.handleCallback(request);
  if (authorized) {
    const configCompleteRedirectUrl = service.getStorage().getValue('configCompleteRedirectUrl');
    return HtmlService
      .createHtmlOutput(`<html><body><button onclick="window.open('${configCompleteRedirectUrl}');">Finish Setup</button></body></html>`);
  } else {
    return HtmlService.createHtmlOutput('Denied.');
  }
}

/**
* Resets OAuth config.
*/
const reset = () => getService().reset();
