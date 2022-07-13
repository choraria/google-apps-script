const tweetCard = (uid, tweetId, event) => {
  const tweetData = TWITTER_API.getTweet(uid, tweetId);
  if (!tweetData) {
    return requestConfig(event.configCompleteRedirectUrl);
  } else {
    const userData = tweetData.includes.users.filter(user => user.id == tweetData.data.author_id)[0];
    const card = {
      "actionResponse": {
        "type": "UPDATE_USER_MESSAGE_CARDS"
      },
      "cards": [
        {
          "header": {
            "title": userData.name,
            "subtitle": `@${userData.username}`,
            "imageUrl": userData.profile_image_url.replace("_normal.jpg", "_400x400.jpg"),
            "imageStyle": "AVATAR",
          },
          "sections": [
            {
              "header": `Created at (GMT): ${Utilities.formatDate(new Date(tweetData.data.created_at), "GMT", "h:mm a · MMM d, yyyy")}`,
              "widgets": [
                {
                  "keyValue": {
                    "content": tweetData.data.text,
                    "contentMultiline": true
                  }
                }
              ]
            },
            {
              "widgets": [
                {
                  "keyValue": {
                    "content": `Likes: ${tweetData.data.public_metrics.like_count}`,
                    "bottomLabel": `RTs: ${tweetData.data.public_metrics.retweet_count} | QTs: ${tweetData.data.public_metrics.quote_count} | Replies: ${tweetData.data.public_metrics.reply_count}`,
                    "icon": "STAR",
                    "button": {
                      "textButton": {
                        "text": "LIKE",
                        "onClick": {
                          "action": {
                            "actionMethodName": `LIKE_TWEET`,
                            "parameters": [
                              {
                                "key": "tweetId",
                                "value": tweetId
                              },
                            ]
                          }
                        }
                      }
                    }
                  }
                }
              ]
            },
            {
              "widgets": [
                {
                  "keyValue": {
                    "topLabel": `"Twitter is unable to process your request"?`,
                    "content": "Connect your Twitter account by running <b>/twitter_connect</b> or DM the bot directly.",
                    "contentMultiline": true,
                    "iconUrl": "https://script.gs/content/images/2022/07/warning.png",
                  }
                }
              ]
            }
          ]
        }
      ]
    };

    if (tweetData.includes.media) {
      const cardImageUrl = tweetData.includes.media[0].type === "photo" ? tweetData.includes.media[0].url : tweetData.includes.media[0].preview_image_url
      const imageWidget = {
        "image": {
          "imageUrl": cardImageUrl
        }
      }
      card.cards[0].sections[0].widgets.push(imageWidget);
    }

    return card;
  }
}

const userCard = (uid, username, event) => {
  const userData = TWITTER_API.getUser(uid, username);
  if (!userData) {
    return requestConfig(event.configCompleteRedirectUrl);
  } else {
    const card = {
      "actionResponse": {
        "type": "UPDATE_USER_MESSAGE_CARDS"
      },
      "cards": [
        {
          "header": {
            "title": userData.data.name,
            "subtitle": `@${userData.data.username}`,
            "imageUrl": userData.data.profile_image_url.replace("_normal.jpg", "_400x400.jpg"),
            "imageStyle": "AVATAR",
          },
          "sections": [
            {
              "widgets": [
                {
                  "keyValue": {
                    "content": `Followers: ${userData.data.public_metrics.followers_count}`,
                    "contentMultiline": "true",
                    "bottomLabel": `Following: ${userData.data.public_metrics.following_count}`,
                    "iconUrl": `https://script.gs/content/images/2022/07/twitter-verified-${userData.data.verified ? "blue" : "grey"}.png`,
                    "button": {
                      "textButton": {
                        "text": "FOLLOW",
                        "onClick": {
                          "action": {
                            "actionMethodName": `FOLLOW_USER`,
                            "parameters": [
                              {
                                "key": "userIdToFollow",
                                "value": userData.data.id
                              },
                              {
                                "key": "userNameToFollow",
                                "value": userData.data.username
                              },
                            ]
                          }
                        }
                      }
                    }
                  }
                }
              ]
            },
            {
              "widgets": [
                {
                  "textParagraph": {
                    "text": `<b>Profile description</b>:<br>${userData.data.description}`
                  }
                }
              ]
            },
            {
              "widgets": [
                {
                  "keyValue": {
                    "topLabel": `"Twitter is unable to process your request"?`,
                    "content": "Connect your Twitter account by running <b>/twitter_connect</b> or DM the bot directly.",
                    "contentMultiline": true,
                    "iconUrl": "https://script.gs/content/images/2022/07/warning.png",
                  }
                }
              ]
            }
          ]
        }
      ]
    };
    return card;
  }
}

const meCard = (uid, event, type) => {
  let twitterUserData = getService().getStorage().getValue(`${uid}_twitter_data`);
  let username;
  if (twitterUserData) {
    username = JSON.parse(twitterUserData).username;
  } else {
    twitterUserData = TWITTER_API.getMe(uid);
    if (!twitterUserData) {
      return requestConfig(event.configCompleteRedirectUrl);
    }
    username = twitterUserData.data.username;
  }
  const userData = TWITTER_API.getUser(uid, username);
  if (!userData) {
    return requestConfig(event.configCompleteRedirectUrl);
  } else {
    const card = {
      "actionResponse": {
        "type": type
      },
      "cards": [
        {
          "header": {
            "title": userData.data.name,
            "subtitle": `@${userData.data.username}`,
            "imageUrl": userData.data.profile_image_url.replace("_normal.jpg", "_400x400.jpg"),
            "imageStyle": "AVATAR",
          },
          "sections": [
            {
              "widgets": [
                {
                  "keyValue": {
                    "content": `Followers: ${userData.data.public_metrics.followers_count}`,
                    "contentMultiline": "true",
                    "bottomLabel": `Following: ${userData.data.public_metrics.following_count}`,
                    "onClick": {
                      "openLink": {
                        "url": `https://twitter.com/${userData.data.username}`
                      }
                    },
                    "iconUrl": `https://script.gs/content/images/2022/07/twitter-verified-${userData.data.verified ? "blue" : "grey"}.png`,
                  }
                }
              ]
            },
            {
              "widgets": [
                {
                  "textParagraph": {
                    "text": `<b>Profile description</b>:<br>${userData.data.description}`
                  }
                }
              ]
            },
            {
              "widgets": [
                {
                  "keyValue": {
                    "topLabel": "User Id",
                    "content": userData.data.id,
                    "onClick": {
                      "openLink": {
                        "url": `https://twitter.com/${userData.data.username}`
                      }
                    },
                    "icon": "PERSON",
                  }
                }
              ]
            }
          ]
        }
      ]
    };

    const followButton = {
      "textButton": {
        "text": "FOLLOW",
        "onClick": {
          "action": {
            "actionMethodName": `FOLLOW_USER`,
            "parameters": [
              {
                "key": "userIdToFollow",
                "value": userData.data.id
              },
              {
                "key": "userNameToFollow",
                "value": userData.data.username
              },
            ]
          }
        }
      }
    };
    event.space.singleUserBotDm ? card : card.cards[0].sections[0].widgets[0].keyValue["button"] = followButton;

    const noticeWidget = {
      "widgets": [
        {
          "keyValue": {
            "topLabel": `"Twitter is unable to process your request"?`,
            "content": "Connect your Twitter account by running <b>/twitter_connect</b> or DM the bot directly.",
            "contentMultiline": true,
            "iconUrl": "https://script.gs/content/images/2022/07/warning.png",
          }
        }
      ]
    };
    event.space.singleUserBotDm ? card : card.cards[0].sections.push(noticeWidget);
    return card;
  }
}

const connectCard = (type) => {
  return {
    "actionResponse": {
      "type": type
    },
    "cards": [
      {
        "sections": [
          {
            "widgets": [
              {
                "keyValue": {
                  "content": 'Your Twitter account has been connected.<br>To check your profile, try <b>/twitter_me</b>',
                  "contentMultiline": true,
                  "icon": "STAR",
                }
              }
            ]
          },
        ]
      }
    ]
  };
}

const feedbackCard = (type) => {
  return {
    "actionResponse": {
      "type": type
    },
    "cards": [
      {
        "sections": [
          {
            "widgets": [
              {
                "keyValue": {
                  "content": `Thanks for your feedback!<br>It's shared with Sourabh (code@script.gs).<br>DM <b>@choraria</b> on Twitter for quicker response.`,
                  "contentMultiline": true,
                  "icon": "BOOKMARK",
                }
              }
            ]
          },
        ]
      }
    ]
  };
}

const logoutCard = (type) => {
  return {
    "actionResponse": {
      "type": type
    },
    "cards": [
      {
        "sections": [
          {
            "widgets": [
              {
                "keyValue": {
                  "content": `You've now logged-out of your Twitter account!`,
                  "contentMultiline": true,
                  "icon": "PERSON",
                }
              }
            ]
          },
        ]
      }
    ]
  };
}

const helpCard = (type) => {
  return {
    "actionResponse": {
      "type": type
    },
    "cards": [
      {
        "header": {
          "title": "Help",
          "imageUrl": "https://script.gs/content/images/2022/07/help-icon.png",
          "imageStyle": "AVATAR",
        },
        "sections": [
          {
            "header": "Getting started",
            "widgets": [
              {
                "keyValue": {
                  "content": "Connect your Twitter account by running the <b>/twitter_connect</b> slash command.",
                  "contentMultiline": true,
                  "icon": "DESCRIPTION",
                }
              },
              {
                "keyValue": {
                  "content": "To <b>like</b> a tweet or <b>follow</b> another user, you will need to authorize your own Twitter account.",
                  "contentMultiline": true,
                }
              }
            ]
          },
          {
            "header": "Connecting and authorization",
            "widgets": [
              {
                "keyValue": {
                  "content": "You will need to click on that <b>Configure</b> button <b>twice</b> during the auth process!",
                  "contentMultiline": true,
                  "iconUrl": "https://script.gs/content/images/2022/07/warning.png",
                }
              },
              {
                "keyValue": {
                  "content": "— First would prepare your Google account to store your Twitter credentials<br>— And the second, would then allow you to connect & interact with your Twitter account",
                  "contentMultiline": true,
                }
              }
            ]
          },
          {
            "header": "Usage",
            "widgets": [
              {
                "keyValue": {
                  "content": "Preview <u>twitter.com</u> links and invoke Slash commands using <b>/twitter...</b>",
                  "contentMultiline": true,
                  "icon": "STAR",
                }
              }
            ]
          },
        ]
      }
    ]
  };
}
