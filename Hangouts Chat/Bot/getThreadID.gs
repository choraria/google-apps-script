/**
 * Responds to a MESSAGE event in Hangouts Chat.
 *
 * @param {Object} event the event object from Hangouts Chat
 */
function onMessage(event) {
  var thread = event.message.thread.name;
  var threadRegex = /(spaces\/)(.*)(\/threads\/)(.*)/;
  var spaceID = threadRegex.exec(thread)[2]
  var threadID = threadRegex.exec(thread)[4]
  var message = "Thread ID: " + threadID + "\nThread URL: https://chat.google.com/room/" + spaceID + "/" + threadID;
  return { "text": message };
}

/**
 * Responds to an ADDED_TO_SPACE event in Hangouts Chat.
 *
 * @param {Object} event the event object from Hangouts Chat
 */
function onAddToSpace(event) {
  var message = "";
  message = "Thank you for adding me to *" + event.space.displayName + "*. \nYou can now use `@getThreadID` command to get the URL of a specific conversation.";
  if (event.message) {
    var thread = event.message.thread.name;
    var threadRegex = /(spaces\/)(.*)(\/threads\/)(.*)/;
    var spaceID = threadRegex.exec(thread)[2]
    var threadID = threadRegex.exec(thread)[4]  
    message = "Thank you for adding me to " + event.space.displayName + "\n" + "Thread ID: " + threadID + "\nThread URL: https://chat.google.com/room/" + spaceID + "/" + threadID;
  }
  return { "text": message };
}
