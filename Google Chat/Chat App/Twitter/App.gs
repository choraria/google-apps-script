/**
 * Responds to a MESSAGE event in Google Chat.
 *
 * @param {Object} event the event object from Google Chat
 */
function onMessage(event) {
  const uid = event.user.name.split("/")[1];
  if (event.message.slashCommand && event.message.slashCommand.commandId === 6) {
    return helpCard(event.space.singleUserBotDm ? "NEW_MESSAGE" : "UPDATE_USER_MESSAGE_CARDS");
  }

  if (!getService().hasAccess()) {
    return requestConfig(event.configCompleteRedirectUrl);
  }

  if (event.message.slashCommand) {
    switch (event.message.slashCommand.commandId) {
      case 1: // /twitter_connect
        if (!getService().hasAccess()) {
          return requestConfig(event.configCompleteRedirectUrl);
        } else {
          return connectCard(event.space.singleUserBotDm ? "NEW_MESSAGE" : "UPDATE_USER_MESSAGE_CARDS");
        }
      case 2: // /twitter_me
        return meCard(uid, event, event.space.singleUserBotDm ? "NEW_MESSAGE" : "UPDATE_USER_MESSAGE_CARDS");
      case 3: // /twitter_me_public
        return meCard(uid, event, "NEW_MESSAGE");
      case 4: // /twitter_logout
        getService().reset();
        return logoutCard(event.space.singleUserBotDm ? "NEW_MESSAGE" : "UPDATE_USER_MESSAGE_CARDS");
    }
  } else if (event.message.matchedUrl) {
    const matchedUrl = event.message.matchedUrl.url.split("?")[0];
    const matchedUrlEntities = checkMatchedUrl(matchedUrl);
    return matchedUrlEntities.entity === "USER" ?
      userCard(uid, matchedUrlEntities.username, event) :
      (
        matchedUrlEntities.entity === "TWEET" ?
          tweetCard(uid, matchedUrlEntities.tweetId, event) :
          { text: "Invalid URL" }
      );
  } else {
    const message = (event.space.singleUserBotDm ? "P" : "<" + event.user.name + ">, p") + "lease use our _slash commands_ by typing */twitter...* or check previews of tweets & users by sharing a direct link.";
    return { "text": message };
  }
}

/**
 * Updates a card that was attached to a message with a previewed link.
 *
 * @param {Object} event The event object from Chat API.
 * @return {Object} Response from the Chat app. Either a new card attached to
 * the message with the previewed link, or an update to an existing card.
 */
function onCardClick(event) {
  const uid = event.user.name.split("/")[1];
  if (!getService().hasAccess()) {
    return {
      text: (event.space.singleUserBotDm ? "T" : "<users/" + uid + ">, t") +
        "o take any action from the cards, please connect your Twitter account by running */twitter_connect*" +
        (event.space.singleUserBotDm ? "." : " or DMing the bot directly.")
    };
  }
  let actionName = event.action.actionMethodName;

  switch (actionName) {
    case "LIKE_TWEET": {
      const tweetId = event.action.parameters.filter(params => params.key == "tweetId")[0].value;
      return likeTweet(uid, tweetId, event);
    };
    case "FOLLOW_USER": {
      const userIdToFollow = event.action.parameters.filter(params => params.key == "userIdToFollow")[0].value;
      const userNameToFollow = event.action.parameters.filter(params => params.key == "userNameToFollow")[0].value;
      return followUser(uid, userIdToFollow, userNameToFollow, event);
    };
  }
}

/**
 * Responds to an ADDED_TO_SPACE event in Google Chat.
 *
 * @param {Object} event the event object from Google Chat
 */
function onAddToSpace(event) {
  const message = (event.space.singleUserBotDm ? "T" : "<" + event.user.name + ">, t") + "hank you for adding me to " + (event.space.singleUserBotDm ? ("a DM, " + event.user.displayName) : (event.space.displayName ? event.space.displayName + '!' : "this chat!")) +
    "\n\n➡️ Next, connect your Twitter account by running the */twitter_connect* slash command.\nAnyone who wants to either *like* a tweet or *follow* another user will need to authorize their own Twitter account, which can be done either by running */twitter_connect* or DMing the bot directly.\n\n⚠️ Notes on connecting and authorization:\nYou will need to click on that *Configure* button *twice* during the auth process!\n— First would prepare your Google account to store your Twitter credentials — this way, no one else can access them\n\t— Needs to be done only once, unless you manually revoke the apps' permissions\n— And the second, would then allow you to connect & interact with your Twitter account";

  return { "text": message };
}

/**
 * Responds to a REMOVED_FROM_SPACE event in Google Chat.
 *
 * @param {Object} event the event object from Google Chat
 */
const onRemoveFromSpace = (event) => console.info("Bot removed from ", (event.space.name ? event.space.name : "this chat by " + event.user.email));
