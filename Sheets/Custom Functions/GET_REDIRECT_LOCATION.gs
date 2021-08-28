/**
 * Returns the redirect location of a url.
 *
 * @param {string} input The source URL being redirected.
 * @return The destination location/URL.
 * @customfunction
 */
function GET_REDIRECT_LOCATION(input) {
  try { // use the validator.gs library => 1OLVhM4V7DKQaPLM0025IO_Url3xr8QnnLqTlC7viE9AtEIIG_-IPVDY0
    if (!validator.isURL(input)) return "INVALID_URL";
  } catch (err) {
    console.log(err);
  }
  if (input == null || input == undefined || input.toString().includes("@") || !input.toString().includes(".")) return "INVALID_URL";
  let response;
  try {
    response = UrlFetchApp.fetch(input, {
      muteHttpExceptions: true,
      followRedirects: false,
      validateHttpsCertificates: false
    });
  } catch (error) {
    console.log(error);
    return error.toString();
  }
  const status = response.getResponseCode();
  console.log(status);
  if (/3\d\d/.test(status)) { // https://en.wikipedia.org/wiki/URL_redirection#HTTP_status_codes_3xx
    const location = response.getAllHeaders().Location;
    console.log(location);
    return location;
  } else {
    return "NO_REDIRECTS_FOUND";
  }
}
