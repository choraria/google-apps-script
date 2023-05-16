function sendEmail() {
  const input = {
    from: {
      name: `FRÖM NAME`, // use `` if empty
      email: `##########`, // YYYYYYYYYY@example.com
    },
    to: {
      name: `TO NÂME`, // use `` if empty
      email: `##########`, // ZZZZZZZZZZ@example.com
    },
    subject: `Sending email usiñg Gmäil API 🚀`,
    body: {
      plainText: `This is what plaiń text's suppośed to look like`,
      html: `<html><body>This iš suppösed to be in <b>HTML</b> 👩🏽‍💻</body></html>`
    }
  };

  const boundaryId = Utilities.getUuid();
  // Email message as per RFC 2822 format
  const message =
    `From: =?UTF-8?B?${Utilities.base64Encode(input.from.name, Utilities.Charset.UTF_8)}?= <${input.from.email}>` + `\r\n` +
    `To: =?UTF-8?B?${Utilities.base64Encode(input.to.name, Utilities.Charset.UTF_8)}?= <${input.to.email}>` + `\r\n` +
    `Subject: =?UTF-8?B?${Utilities.base64Encode(input.subject, Utilities.Charset.UTF_8)}?=` + `\r\n` +
    `Content-Type: multipart/alternative; boundary=${boundaryId}` + `\r\n\r\n` +
    `--${boundaryId}` + `\r\n` +
    `Content-Type: text/plain; charset="UTF-8"` + `\r\n` +
    `Content-Transfer-Encoding: base64` + `\r\n\r\n` +
    `${Utilities.base64Encode(input.body.plainText, Utilities.Charset.UTF_8)}` + `\r\n\r\n` +
    `--${boundaryId}` + `\r\n` +
    `Content-Type: text/html; charset="UTF-8"` + `\r\n` +
    `Content-Transfer-Encoding: base64` + `\r\n\r\n` +
    `${Utilities.base64Encode(input.body.html, Utilities.Charset.UTF_8)}` + `\r\n\r\n` +
    `--${boundaryId}--`;
  
  const newMsg = Gmail.newMessage();
  newMsg.raw = Utilities.base64EncodeWebSafe(message, Utilities.Charset.UTF_8);

  try {
    Gmail.Users.Messages.send(newMsg, "me");
    console.log("Email sent.");
  } catch (error) {
    console.log("Error: " + error);
  }
}
