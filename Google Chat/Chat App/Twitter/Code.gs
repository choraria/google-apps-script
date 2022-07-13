function requestConfig(configCompleteRedirectUrl) {
  const service = getService();
  const codeVerifier = generateCodeVerifier();
  let codeChallenge = encodeChallenge(codeVerifier);
  service.setParam('code_challenge_method', 'S256')
  service.setParam('code_challenge', codeChallenge)

  const authorizationUrl = service.getAuthorizationUrl({
    codeVerifier: codeVerifier,
  });
  service.getStorage().setValue('configCompleteRedirectUrl', configCompleteRedirectUrl);
  return {
    "actionResponse": {
      "type": "REQUEST_CONFIG",
      "url": authorizationUrl
    }
  }
}

const TWITTER_API = {
  getMe: function (uid) { // https://developer.twitter.com/en/docs/twitter-api/users/lookup/api-reference/get-users-me
    const url = `https://api.twitter.com/2/users/me`;
    const accessToken = getService().getAccessToken();
    const options = {
      "method": 'GET',
      "headers": {
        Authorization: "Bearer " + accessToken,
      },
      "muteHttpExceptions": true,
    };
    const res = UrlFetchApp.fetch(url, options);
    if (res.getResponseCode() === 200) {
      const twitterData = JSON.parse(res);
      getService().getStorage().setValue(`${uid}_twitter_data`, JSON.stringify({
        id: twitterData.data.id,
        username: twitterData.data.username,
        name: twitterData.data.name
      }));
      return twitterData;
    } else {
      console.log({
        message: `An error occurred getting user ${uid}'s Twitter user data using token ${accessToken}`,
        responseCode: res.getResponseCode(),
        responseMessage: res.getContentText(),
        response: res
      });
      return false;
    }
  },
  getTweet: function (uid, tweetId) { // https://developer.twitter.com/en/docs/twitter-api/tweets/lookup/api-reference/get-tweets-id
    const url = `https://api.twitter.com/2/tweets/${tweetId}?expansions=attachments.poll_ids,attachments.media_keys,author_id,entities.mentions.username,geo.place_id,in_reply_to_user_id,referenced_tweets.id,referenced_tweets.id.author_id&media.fields=duration_ms,height,media_key,preview_image_url,type,url,width,public_metrics,alt_text,variants&place.fields=contained_within,country,country_code,full_name,geo,id,name,place_type&poll.fields=duration_minutes,end_datetime,id,options,voting_status&tweet.fields=attachments,author_id,context_annotations,conversation_id,created_at,entities,geo,id,in_reply_to_user_id,lang,public_metrics,possibly_sensitive,referenced_tweets,reply_settings,source,text,withheld&user.fields=created_at,description,entities,id,location,name,pinned_tweet_id,profile_image_url,protected,public_metrics,url,username,verified,withheld`;
    const accessToken = getService().getAccessToken();
    const options = {
      "method": 'GET',
      "headers": {
        Authorization: "Bearer " + accessToken,
      },
      "muteHttpExceptions": true,
    };
    const res = UrlFetchApp.fetch(url, options);
    if (res.getResponseCode() === 200) {
      return JSON.parse(res);
    } else {
      console.log({
        message: `An error occurred getting tweet via Id ${tweetId} from user ${uid} using token ${accessToken}`,
        responseCode: res.getResponseCode(),
        responseMessage: res.getContentText(),
        response: res
      });
      return false;
    }
  },
  getUser: function (uid, username) { // https://developer.twitter.com/en/docs/twitter-api/users/lookup/api-reference/get-users-by-username-username
    const url = `https://api.twitter.com/2/users/by/username/${username}?expansions=pinned_tweet_id&tweet.fields=attachments,author_id,context_annotations,conversation_id,created_at,entities,geo,id,in_reply_to_user_id,lang,public_metrics,possibly_sensitive,referenced_tweets,reply_settings,source,text,withheld&user.fields=created_at,description,entities,id,location,name,pinned_tweet_id,profile_image_url,protected,public_metrics,url,username,verified,withheld`;
    const accessToken = getService().getAccessToken();
    const options = {
      "method": 'GET',
      "headers": {
        Authorization: "Bearer " + accessToken,
      },
      "muteHttpExceptions": true,
    };
    const res = UrlFetchApp.fetch(url, options);
    if (res.getResponseCode() === 200) {
      return JSON.parse(res);
    } else {
      console.log({
        message: `An error occurred getting user via username ${username} from user ${uid} using token ${accessToken}`,
        responseCode: res.getResponseCode(),
        responseMessage: res.getContentText(),
        response: res
      });
      return false;
    }
  },
  likeTweet: function (uid, tweetId) { // https://developer.twitter.com/en/docs/twitter-api/tweets/likes/api-reference/post-users-id-likes
    let twitterUserData = getService().getStorage().getValue(`${uid}_twitter_data`);
    let userId;
    if (twitterUserData) {
      userId = JSON.parse(twitterUserData).id;
    } else {
      twitterUserData = TWITTER_API.getMe(uid);
      userId = twitterUserData.data.id;
    }
    if (userId) {
      const url = `https://api.twitter.com/2/users/${userId}/likes`;
      const accessToken = getService().getAccessToken();
      const options = {
        "method": 'POST',
        "payload": JSON.stringify({ tweet_id: tweetId }),
        "headers": {
          Authorization: "Bearer " + accessToken,
          "Content-Type": "application/json",
        },
        "muteHttpExceptions": true,
      };
      const res = UrlFetchApp.fetch(url, options);
      if (res.getResponseCode() === 200) {
        return JSON.parse(res);
      } else {
        console.log({
          message: `An error occurred when liking tweet via Id ${tweetId} from user ${uid} using token ${accessToken}`,
          responseCode: res.getResponseCode(),
          responseMessage: res.getContentText(),
          response: res
        });
        return false;
      }
    } else {
      return false;
    }
  },
  followUser: function (uid, userIdToFollow, userNameToFollow) { // https://developer.twitter.com/en/docs/twitter-api/tweets/likes/api-reference/post-users-id-likes
    let twitterUserData = getService().getStorage().getValue(`${uid}_twitter_data`);
    let userId;
    if (twitterUserData) {
      userId = JSON.parse(twitterUserData).id;
    } else {
      twitterUserData = TWITTER_API.getMe(uid);
      userId = twitterUserData.data.id;
    }
    if (userId) {
      const url = `https://api.twitter.com/2/users/${userId}/following`;
      const accessToken = getService().getAccessToken();
      const options = {
        "method": 'POST',
        "payload": JSON.stringify({ target_user_id: userIdToFollow }),
        "headers": {
          Authorization: "Bearer " + accessToken,
          "Content-Type": "application/json",
        },
        "muteHttpExceptions": true,
      };
      const res = UrlFetchApp.fetch(url, options);
      if (res.getResponseCode() === 200) {
        return JSON.parse(res);
      } else {
        console.log({
          message: `An error occurred when following user @${userNameToFollow} via Id ${userIdToFollow} from user ${uid} using token ${accessToken}`,
          responseCode: res.getResponseCode(),
          responseMessage: res.getContentText(),
          response: res
        });
        return false;
      }
    } else {
      return false;
    }
  },
}

function checkMatchedUrl(url) {
  const urlPattern = new RegExp(/^https:\/\/twitter\.com\/([A-Za-z0-9_]{1,15})(?:\/status\/([0-9]{19}))?$/);
  const [matchedUrl, username, tweetId] = urlPattern.test(url) ? urlPattern.exec(url) : new Array(3).fill(null);
  const entity = !matchedUrl ? "UNDEFINED" : (matchedUrl.length > 40 ? "TWEET" : "USER");
  return {
    entity: entity,
    username: username,
    tweetId: tweetId
  }
}

function likeTweet(uid, tweetId, event) {
  const like = TWITTER_API.likeTweet(uid, tweetId);
  if (like) {
    return { text: `*${event.space.singleUserBotDm ? "You" : event.user.displayName}* liked the Tweet with Id ${tweetId}` }
  } else {
    return {
      text: (event.space.singleUserBotDm ? "S" : "<users/" + uid + ">, s") +
        "omething went wrong.\nPlease log-out of your Twitter account by using */twitter_logout* and re-connect by mentioning */twitter_connect*" +
        (event.space.singleUserBotDm ? "." : " or DMing the bot directly.")
    }
  }
}

function followUser(uid, userIdToFollow, userNameToFollow, event) {
  const follow = TWITTER_API.followUser(uid, userIdToFollow, userNameToFollow);
  if (follow) {
    return {
      text: `*${event.space.singleUserBotDm ? "You" : event.user.displayName}* ${follow.data.following ? "followed" : (follow.data.pending_follow ? "requested to follow" : "tried following")
        } *@${userNameToFollow}* (userId: ${userIdToFollow})`
    }
  } else {
    return {
      text: (event.space.singleUserBotDm ? "S" : "<users/" + uid + ">, s") +
        "omething went wrong.\nPlease log-out of your Twitter account by using */twitter_logout* and re-connect by mentioning */twitter_connect*" +
        (event.space.singleUserBotDm ? "." : " or DMing the bot directly.")
    }
  }
}
