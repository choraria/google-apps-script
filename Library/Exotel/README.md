# Google Apps Script Library for [Exotel APIs](https://developer.exotel.com/api/)

### Host it yourself

Refer to Google's guide on [creating a library](https://developers.google.com/apps-script/guides/libraries#creating_a_library) and copy-paste the code available in this repository - [ExoAPI.gs](/ExoAPI.gs)

### List of functions

- ExoAPI.metaData(number) // [Number metadata](https://developer.exotel.com/api/#metadata-phone)
- ExoAPI.connectTwoNumbers(from, to, callerID) // [Outgoing call to connect two numbers](https://developer.exotel.com/api/#call-agent)
- ExoAPI.connectNumberToFlow(from, callerID, flowID) // [Outgoing call to connect number to a call flow](https://developer.exotel.com/api/#call-customer)
- ExoAPI.callDetails(callSid) // [Call details](https://developer.exotel.com/api/#call-details)
- ExoAPI.sendSMS(callerID, to, body) // [Send SMS](https://developer.exotel.com/api/#send-sms)
- ExoAPI.smsDetails(smsSid) // [SMS details](https://developer.exotel.com/api/#sms-details)
- ExoAPI.authenticate(apiKey, apiToken, accSid, cluster)
  - this is a default function that needs to be called before invoking any/all other functions - if this is skipped, an error message would request to invoke the same
  - `cluster` parameter is optional

**Caveat**: Only the mandatory parameters have been considered for the purposes of this library

### Use mine

You're also free to use the library hosted on my personal ID [here](https://script.google.com/d/1V9cn0CSU9GnSyCebBRZ5vS-jSn2z3U6s1KkaHe4Aml2x-CAsmTNU4bp4/edit) & *this* is how to [use an existing library](https://developers.google.com/apps-script/guides/libraries#using_a_library)

## Disclaimer

This library is neither endoresed nor offically approved by [Exotel](https://exotel.com/).
