function reminders() {
  var events = CalendarApp.getDefaultCalendar().getEventsForDay(new Date());
  for (var i = 0; i < events.length; i++) {
    var event = events[i];
    if (event.isOwnedByMe()) {
      var guests = event.getGuestList(false);
      for (var j = 0; j < guests.length; j++) {
        var guest = guests[j];
        if (guest.getGuestStatus() == 'INVITED') {
          var meetingName = event.getTitle();
          var meetingDescription = event.getDescription();
          var meetingID = event.getId().split('@')[0];
          var guestMail = guest.getEmail();
          var eventID = Utilities.base64Encode(meetingID + ' ' + guestMail);
          var meetingLink = 'https://www.google.com/calendar/render?action=VIEW&eid=' + eventID;
          var meetingTime = Utilities.formatDate(
            new Date(event.getStartTime()),
            Session.getScriptTimeZone(),
            'HHmm'
          );
          var msgSubject = 'Reminder for ' + meetingName + ' | ⏰: ' + meetingTime + ' hrs.';
          var msgBody = 'Hi there!\n\n'
          + 'You\'ve not responded to my invite for today\'s conversation on -\n⚡ ' + meetingName
          + '.\n\nPlease either ✅ or ❌ the invite so we could plan accordingly -\n' + meetingLink;
          if (meetingDescription.length > 0) {
            msgBody = msgBody + '\n\nHere\'s the agenda:\n\n' + meetingDescription;
          }
          msgBody = msgBody + '\n\nHope to see you there.\n\nCiao!'
          GmailApp.sendEmail(
            guestMail,
            msgSubject,
            msgBody,
            {
              name: 'Reminder BOT',
              cc: Session.getEffectiveUser().getEmail()
            }
          );
        }
      }
    }
  }
}

function cronSetup() {
  ScriptApp.newTrigger('reminders')
  .timeBased()
  .everyDays(1)
  .atHour(10)
  .nearMinute(1)
  .create();
}
